const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../utils/jwtAuth');
const { createNotification, notifyUsers } = require('./notifications');

// ══════════════════════════════════════════════════════════════
//  1. DIGITAL CASE WORKFLOW ENGINE
// ══════════════════════════════════════════════════════════════

const WORKFLOW_STAGES = [
  'FIR Filed',
  'Under Review',
  'Investigation',
  'Charge Sheet Filed',
  'Court Proceedings',
  'Closed'
];

// Get workflow stages list
router.get('/workflow/stages', (req, res) => {
  res.json({ status: 'success', data: WORKFLOW_STAGES });
});

// Get FIR workflow timeline
router.get('/workflow/fir/:id', verifyToken, (req, res) => {
  req.db.get(`SELECT id, fir_number, crime_type, status, workflow_stage, created_at, updated_at FROM firs WHERE id = ?`,
    [req.params.id], (err, fir) => {
      if (err) return res.status(500).json({ status: 'error', message: 'Database error' });
      if (!fir) return res.status(404).json({ status: 'error', message: 'FIR not found' });

      const currentIdx = WORKFLOW_STAGES.indexOf(fir.workflow_stage || 'FIR Filed');
      const timeline = WORKFLOW_STAGES.map((stage, i) => ({
        stage,
        status: i < currentIdx ? 'completed' : i === currentIdx ? 'current' : 'pending',
        order: i + 1
      }));

      res.json({ status: 'success', data: { fir, timeline, currentStage: currentIdx } });
    });
});

// Advance workflow stage
router.put('/workflow/fir/:id/advance', verifyToken, requireRole('Police', 'Admin'), (req, res) => {
  const firId = req.params.id;

  req.db.get(`SELECT id, fir_number, workflow_stage, user_id, crime_type FROM firs WHERE id = ?`, [firId], (err, fir) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Database error' });
    if (!fir) return res.status(404).json({ status: 'error', message: 'FIR not found' });

    const currentIdx = WORKFLOW_STAGES.indexOf(fir.workflow_stage || 'FIR Filed');
    if (currentIdx >= WORKFLOW_STAGES.length - 1) {
      return res.status(400).json({ status: 'error', message: 'Case is already closed' });
    }

    const nextStage = WORKFLOW_STAGES[currentIdx + 1];
    req.db.run(`UPDATE firs SET workflow_stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [nextStage, firId], function(err2) {
        if (err2) return res.status(500).json({ status: 'error', message: 'Database error' });

        // Notify the complainant
        if (fir.user_id) {
          createNotification(req.db, fir.user_id,
            'Case Stage Updated',
            `Your FIR ${fir.fir_number || '#' + fir.id} (${fir.crime_type}) has moved to: ${nextStage}`,
            'workflow', 'FIR', fir.id);
        }

        res.json({ status: 'success', message: `Moved to ${nextStage}`, data: { stage: nextStage, stageIndex: currentIdx + 1 } });
      });
  });
});

// Set workflow stage directly (Admin)
router.put('/workflow/fir/:id/set', verifyToken, requireRole('Admin', 'Police'), (req, res) => {
  const { stage } = req.body;
  if (!WORKFLOW_STAGES.includes(stage)) {
    return res.status(400).json({ status: 'error', message: 'Invalid stage' });
  }

  req.db.run(`UPDATE firs SET workflow_stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [stage, req.params.id], function(err) {
      if (err) return res.status(500).json({ status: 'error', message: 'Database error' });
      res.json({ status: 'success', message: `Stage set to ${stage}` });
    });
});

// ══════════════════════════════════════════════════════════════
//  2. AUTO FIR NUMBER GENERATION
// ══════════════════════════════════════════════════════════════

router.get('/generate-fir-number', verifyToken, (req, res) => {
  const { state = 'MH', city = 'MUM' } = req.query;
  const year = new Date().getFullYear();

  req.db.get(`SELECT MAX(id) as max_id FROM firs`, [], (err, row) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Database error' });
    const serial = (row?.max_id || 0) + 1;
    const firNumber = `FIR-${year}-${state.toUpperCase()}-${city.toUpperCase()}-${String(serial).padStart(5, '0')}`;
    res.json({ status: 'success', data: { fir_number: firNumber } });
  });
});

// ══════════════════════════════════════════════════════════════
//  3. POLICE RESOURCE ALLOCATION
// ══════════════════════════════════════════════════════════════

// Get officer workload overview
router.get('/allocation/workload', verifyToken, requireRole('Admin', 'Police'), (req, res) => {
  const sql = `
    SELECT p.id, p.police_id, p.name, p.station_name, p.station_id,
           COALESCE(p.active_cases, 0) as active_cases,
           COUNT(f.id) as assigned_firs,
           SUM(CASE WHEN f.status = 'Sent' THEN 1 ELSE 0 END) as pending_firs
    FROM police p
    LEFT JOIN firs f ON f.assigned_police_id = p.police_id AND f.status != 'Rejected'
    GROUP BY p.id, p.police_id, p.name, p.station_name, p.station_id, p.active_cases
    ORDER BY assigned_firs ASC`;

  req.db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Database error' });
    res.json({ status: 'success', data: rows || [] });
  });
});

// Auto-assign FIR to least-busy officer at a station
router.post('/allocation/auto-assign/:firId', verifyToken, requireRole('Admin', 'Police'), (req, res) => {
  const firId = req.params.firId;

  req.db.get(`SELECT id, station_id, crime_type, user_id, fir_number FROM firs WHERE id = ?`, [firId], (err, fir) => {
    if (err || !fir) return res.status(404).json({ status: 'error', message: 'FIR not found' });

    // Find least-busy officer at the same station — prefer crime-type match
    const sql = `
      SELECT p.police_id, p.name, p.crime_type as specialty,
             COUNT(f.id) as case_count
      FROM police p
      LEFT JOIN firs f ON f.assigned_police_id = p.police_id AND f.status NOT IN ('Rejected', 'Closed')
      WHERE p.station_id = ?
      GROUP BY p.police_id, p.name, p.crime_type
      ORDER BY
        CASE WHEN p.crime_type = ? THEN 0 ELSE 1 END,
        COUNT(f.id) ASC
      LIMIT 1`;

    req.db.get(sql, [fir.station_id, fir.crime_type], (err2, officer) => {
      if (err2 || !officer) return res.status(404).json({ status: 'error', message: 'No officers available at this station' });

      req.db.run(`UPDATE firs SET assigned_police_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [officer.police_id, firId], function(err3) {
          if (err3) return res.status(500).json({ status: 'error', message: 'Database error' });

          // Notify the assigned officer's user account
          req.db.get(`SELECT id FROM users WHERE badge_number = ? OR username = ?`,
            [officer.police_id, officer.police_id], (_, userRow) => {
              if (userRow) {
                createNotification(req.db, userRow.id,
                  'New Case Assigned',
                  `FIR ${fir.fir_number || '#' + fir.id} (${fir.crime_type}) has been assigned to you.`,
                  'assignment', 'FIR', fir.id);
              }
            });

          res.json({
            status: 'success',
            message: `Assigned to ${officer.name}`,
            data: { officer_id: officer.police_id, officer_name: officer.name, specialty: officer.specialty, case_count: officer.case_count }
          });
        });
    });
  });
});

// ══════════════════════════════════════════════════════════════
//  4. CRIME PATTERN DETECTION
// ══════════════════════════════════════════════════════════════

router.get('/patterns', verifyToken, requireRole('Admin', 'Police'), (req, res) => {
  const queries = {
    // Repeat crime locations (≥2 FIRs at same location)
    hotspotLocations: `
      SELECT location, COUNT(*) as crime_count, 
             STRING_AGG(DISTINCT crime_type, ', ') as crime_types,
             MAX(crime_date) as last_incident
      FROM firs WHERE location IS NOT NULL AND location != ''
      GROUP BY location HAVING COUNT(*) >= 2
      ORDER BY crime_count DESC LIMIT 15`,

    // Time-of-day pattern
    timePatterns: `
      SELECT crime_time,
             CASE
               WHEN crime_time < '06:00' THEN 'Night (00-06)'
               WHEN crime_time < '12:00' THEN 'Morning (06-12)'
               WHEN crime_time < '18:00' THEN 'Afternoon (12-18)'
               ELSE 'Evening (18-24)'
             END as time_slot,
             crime_type, COUNT(*) as count
      FROM firs WHERE crime_time IS NOT NULL AND crime_time != ''
      GROUP BY crime_time, crime_type
      ORDER BY count DESC LIMIT 20`,

    // Monthly trend by crime type
    monthlyTrend: `
      SELECT TO_CHAR(TO_DATE(crime_date, 'YYYY-MM-DD'), 'YYYY-MM') as month,
             crime_type, COUNT(*) as count
      FROM firs WHERE crime_date IS NOT NULL AND crime_date != ''
      GROUP BY month, crime_type
      ORDER BY month DESC, count DESC LIMIT 30`,

    // Repeat offenders (accused appearing in multiple FIRs)
    repeatOffenders: `
      SELECT accused, COUNT(*) as fir_count,
             STRING_AGG(DISTINCT crime_type, ', ') as crime_types,
             STRING_AGG(DISTINCT location, ', ') as locations
      FROM firs WHERE accused IS NOT NULL AND accused != ''
      GROUP BY accused HAVING COUNT(*) >= 2
      ORDER BY fir_count DESC LIMIT 10`,

    // Crime type distribution by time slot
    crimeByTimeSlot: `
      SELECT
        CASE
          WHEN crime_time < '06:00' THEN 'Night'
          WHEN crime_time < '12:00' THEN 'Morning'
          WHEN crime_time < '18:00' THEN 'Afternoon'
          ELSE 'Evening'
        END as time_slot,
        COUNT(*) as count
      FROM firs WHERE crime_time IS NOT NULL AND crime_time != ''
      GROUP BY time_slot
      ORDER BY count DESC`
  };

  const results = {};
  const keys = Object.keys(queries);
  let completed = 0;

  keys.forEach(key => {
    req.db.all(queries[key], [], (err, rows) => {
      results[key] = err ? [] : (rows || []);
      completed++;
      if (completed === keys.length) {
        res.json({ status: 'success', data: results });
      }
    });
  });
});

// ══════════════════════════════════════════════════════════════
//  5. FIR SIMILARITY DETECTION
// ══════════════════════════════════════════════════════════════

// Simple text similarity using word overlap (Jaccard-like, no external deps)
function textSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  const tokenize = (t) => {
    const stops = new Set(['the','a','an','is','was','were','are','in','on','at','to','of','and','or','for','with','by','from','as','it','my','i','he','she','they','this','that','not','but']);
    return t.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stops.has(w));
  };
  const words1 = new Set(tokenize(text1));
  const words2 = new Set(tokenize(text2));
  if (words1.size === 0 || words2.size === 0) return 0;
  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;
  return union > 0 ? intersection / union : 0;
}

router.post('/similarity/check', verifyToken, (req, res) => {
  const { description, crime_type, threshold = 0.25 } = req.body;
  if (!description || description.trim().length < 10) {
    return res.status(400).json({ status: 'error', message: 'Description must be at least 10 characters' });
  }

  // Get recent FIRs to compare against
  const sql = crime_type
    ? `SELECT id, fir_number, crime_type, crime_description, purpose, accused, location, created_at FROM firs WHERE crime_type = ? ORDER BY created_at DESC LIMIT 100`
    : `SELECT id, fir_number, crime_type, crime_description, purpose, accused, location, created_at FROM firs ORDER BY created_at DESC LIMIT 200`;

  const params = crime_type ? [crime_type] : [];

  req.db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Database error' });

    const inputText = description.trim();
    const matches = (rows || []).map(fir => {
      const firText = [fir.crime_description, fir.purpose, fir.accused, fir.location].filter(Boolean).join(' ');
      const score = textSimilarity(inputText, firText);
      return { ...fir, similarity: Math.round(score * 100) };
    })
    .filter(m => m.similarity >= threshold * 100)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10);

    res.json({ status: 'success', data: { similar_firs: matches, total_compared: rows?.length || 0 } });
  });
});

// ══════════════════════════════════════════════════════════════
//  6. CRIMINAL NETWORK ANALYSIS
// ══════════════════════════════════════════════════════════════

// Get network graph data (nodes = criminals, edges = shared crimes/cases)
router.get('/network/graph', verifyToken, requireRole('Admin', 'Police'), (req, res) => {
  // Auto-build links from shared crime attributes
  const nodesSql = `SELECT id, "Criminal_name" as name, crime_type, station_name, city, status FROM criminals`;
  const linksSql = `SELECT * FROM criminal_network ORDER BY strength DESC`;

  // Also find implicit links: criminals sharing the same crime_type + station
  const implicitSql = `
    SELECT c1.id as source, c2.id as target,
           c1.crime_type, c1.station_name,
           'same_crime_station' as link_type
    FROM criminals c1
    JOIN criminals c2 ON c1.crime_type = c2.crime_type
                     AND c1.station_name = c2.station_name
                     AND c1.id < c2.id`;

  let results = {};
  let done = 0;
  const finish = () => {
    done++;
    if (done < 3) return;

    const nodes = (results.nodes || []).map(n => ({
      id: n.id, name: n.name, crime_type: n.crime_type,
      station: n.station_name, city: n.city, status: n.status
    }));

    const explicitEdges = (results.links || []).map(l => ({
      source: l.criminal_id_1, target: l.criminal_id_2,
      type: l.link_type, strength: l.strength, description: l.description
    }));

    const implicitEdges = (results.implicit || []).map(l => ({
      source: l.source, target: l.target,
      type: l.link_type, strength: 1, description: `Shared: ${l.crime_type} @ ${l.station_name}`
    }));

    // Deduplicate edges
    const edgeKey = (e) => `${Math.min(e.source, e.target)}-${Math.max(e.source, e.target)}`;
    const seen = new Set();
    const edges = [...explicitEdges, ...implicitEdges].filter(e => {
      if (!e.source || !e.target) return false;
      const k = edgeKey(e);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    res.json({ status: 'success', data: { nodes, edges } });
  };

  req.db.all(nodesSql, [], (e, r) => { results.nodes = r || []; finish(); });
  req.db.all(linksSql, [], (e, r) => { results.links = r || []; finish(); });
  req.db.all(implicitSql, [], (e, r) => { results.implicit = r || []; finish(); });
});

// Add explicit link between criminals
router.post('/network/link', verifyToken, requireRole('Admin', 'Police'), (req, res) => {
  const { criminal_id_1, criminal_id_2, link_type, description, fir_id, strength = 1 } = req.body;
  if (!criminal_id_1 || !criminal_id_2 || !link_type) {
    return res.status(400).json({ status: 'error', message: 'criminal_id_1, criminal_id_2, and link_type are required' });
  }
  req.db.run(
    `INSERT INTO criminal_network (criminal_id_1, criminal_id_2, link_type, description, fir_id, strength) VALUES (?, ?, ?, ?, ?, ?)`,
    [criminal_id_1, criminal_id_2, link_type, description || '', fir_id || null, strength],
    function(err) {
      if (err) return res.status(500).json({ status: 'error', message: 'Database error' });
      res.json({ status: 'success', message: 'Link created', id: this.lastID });
    }
  );
});

// Delete a network link
router.delete('/network/link/:id', verifyToken, requireRole('Admin'), (req, res) => {
  req.db.run(`DELETE FROM criminal_network WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ status: 'error', message: 'Database error' });
    res.json({ status: 'success' });
  });
});

// ══════════════════════════════════════════════════════════════
//  7. CRIME STATISTICS EXPORT
// ══════════════════════════════════════════════════════════════

// Export as CSV
router.get('/export/csv', verifyToken, requireRole('Admin'), (req, res) => {
  const { type = 'firs' } = req.query;

  let sql;
  if (type === 'criminals') {
    sql = `SELECT id, "Criminal_name" as name, crime_type, crime_date, station_name, city, state, address, status, created_at FROM criminals ORDER BY id`;
  } else {
    sql = `SELECT id, fir_number, crime_type, crime_description, accused, relation, COALESCE(complainant_name, name) as complainant, COALESCE(complainant_phone, number) as phone, age, station_name, location, address, purpose, evidence, assigned_police_id, status, workflow_stage, priority, crime_date, crime_time, latitude, longitude, created_at, updated_at FROM firs ORDER BY id`;
  }

  req.db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Database error' });
    if (!rows || rows.length === 0) return res.status(404).json({ status: 'error', message: 'No data to export' });

    const headers = Object.keys(rows[0]);
    const csvLines = [headers.join(',')];
    rows.forEach(row => {
      csvLines.push(headers.map(h => {
        let val = row[h] ?? '';
        val = String(val).replace(/"/g, '""');
        return val.includes(',') || val.includes('"') || val.includes('\n') ? `"${val}"` : val;
      }).join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_report_${Date.now()}.csv`);
    res.send(csvLines.join('\n'));
  });
});

// Export as JSON (for Excel conversion on frontend)
router.get('/export/json', verifyToken, requireRole('Admin'), (req, res) => {
  const { type = 'firs' } = req.query;

  const queries = {
    firs: `SELECT id, fir_number, crime_type, crime_description, accused, relation, COALESCE(complainant_name, name) as complainant, COALESCE(complainant_phone, number) as phone, age, station_name, location, address, purpose, evidence, assigned_police_id, status, workflow_stage, priority, crime_date, crime_time, latitude, longitude, created_at, updated_at FROM firs ORDER BY id`,
    criminals: `SELECT id, "Criminal_name" as name, crime_type, crime_date, station_name, city, state, address, status, created_at FROM criminals ORDER BY id`,
    summary: `SELECT crime_type, COUNT(*) as total_firs,
                     SUM(CASE WHEN status='Approved' THEN 1 ELSE 0 END) as approved,
                     SUM(CASE WHEN status='Sent' THEN 1 ELSE 0 END) as pending,
                     SUM(CASE WHEN status='Rejected' THEN 1 ELSE 0 END) as rejected
              FROM firs GROUP BY crime_type ORDER BY total_firs DESC`
  };

  const sql = queries[type] || queries.firs;
  req.db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Database error' });
    res.json({ status: 'success', data: rows || [], type });
  });
});

module.exports = router;
module.exports.WORKFLOW_STAGES = WORKFLOW_STAGES;
