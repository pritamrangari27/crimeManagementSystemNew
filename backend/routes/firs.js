const express = require('express');
const router = express.Router();
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('./notifications');

// ===== HELPER FUNCTIONS =====

/**
 * Helper function to get FIR by ID
 */
const getFirById = (db, id, callback) => {
  const sql = `SELECT * FROM firs WHERE id = ?`;
  db.get(sql, [id], callback);
};

/**
 * Helper function to execute database queries with error handling
 */
const executeDatabaseQuery = (db, sql, params, res, isRun = false) => {
  return new Promise((resolve, reject) => {
    if (isRun) {
      db.run(sql, params, function(err) {
        if (err) {
          console.error('Database error:', err);
          res.status(500).json({ status: 'error', message: 'Database error' });
          reject(err);
        } else {
          resolve(this);
        }
      });
    } else {
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          res.status(500).json({ status: 'error', message: 'Database error' });
          reject(err);
        } else {
          resolve(rows);
        }
      });
    }
  });
};

// Create FIR - POST /api/firs
router.post('/', (req, res) => {
  const {
    user_id, station_id, crime_type, accused, name, age, number, address,
    relation, purpose, file, latitude, longitude, status = 'Sent',
    complainant_name, complainant_phone, location, crime_description, crime_date, crime_time, priority
  } = req.body;

  // Support both form field naming conventions
  const finalName = name || complainant_name;
  const finalNumber = number || complainant_phone;
  const finalAccused = accused || '';
  const finalLocation = location || '';
  const finalDescription = crime_description || '';

  // Validate required fields
  if (!user_id || !station_id || !crime_type) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Missing required fields (user_id, station_id, crime_type)' 
    });
  }

  // Use station_id as station_name if needed (from form it's just station_code)
  const station_name = station_id;

  // Auto-generate FIR number
  req.db.get(`SELECT MAX(id) as max_id FROM firs`, [], (err0, maxRow) => {
    const serial = ((maxRow?.max_id || 0) + 1);
    const year = new Date().getFullYear();
    const firNumber = `FIR-${year}-MH-MUM-${String(serial).padStart(5, '0')}`;

    const sql = `INSERT INTO firs (
      fir_number, user_id, station_id, station_name, crime_type, accused, name, age, number, address,
      relation, purpose, file, latitude, longitude, status, workflow_stage, priority,
      complainant_name, complainant_phone, location, crime_description, crime_date, crime_time,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'FIR Filed', ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

    req.db.run(sql, [
      firNumber, user_id, station_id, station_name, crime_type, finalAccused, finalName || null, age || null, finalNumber || null, address || null,
      relation || '', purpose || '', file || null,
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null,
      status,
      priority || 'Medium',
      finalName || null, finalNumber || null, finalLocation, finalDescription,
      crime_date || null, crime_time || null
    ], function(err) {
      if (err) {
        console.error('FIR creation database error:', err);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Database error: ' + (err.message || 'Failed to create FIR'),
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
      
      // Log the FIR creation activity
      logActivity(
        req.db,
        user_id,
        'FIR_CREATED',
        'FIR filed successfully',
        `New FIR ${firNumber} filed against ${accused} for ${crime_type}`,
        'FIR',
        this.lastID,
        'fas fa-file-alt'
      );

      const newFirId = this.lastID;

      // Auto-assign FIR to least-busy officer at station, preferring crime-type match
      const assignSql = `
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

      req.db.get(assignSql, [station_id, crime_type], (assignErr, officer) => {
        if (!assignErr && officer) {
          req.db.run(`UPDATE firs SET assigned_police_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [officer.police_id, newFirId], () => {});
        }
      });
      
      res.json({ 
        status: 'success', 
        message: 'FIR created successfully', 
        id: newFirId,
        fir_number: firNumber
      });
    });
  });
});

// Get all FIRs - GET /api/firs/all
router.get('/all', (req, res) => {
  const sql = `SELECT * FROM firs ORDER BY created_at DESC`;

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows || [] });
  });
});

// Get FIRs for a specific station - GET /api/firs/station/:station_id
router.get('/station/:station_id', (req, res) => {
  const { station_id } = req.params;
  const sql = `SELECT * FROM firs WHERE station_id = ? ORDER BY created_at DESC`;

  req.db.all(sql, [station_id], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows || [] });
  });
});

// Get user's FIRs - GET /api/firs/user/:user_id
router.get('/user/:user_id', (req, res) => {
  const { user_id } = req.params;
  const sql = `SELECT * FROM firs WHERE user_id = ? ORDER BY created_at DESC`;

  req.db.all(sql, [user_id], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows || [] });
  });
});

// Get FIR by ID - GET /api/firs/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;

  getFirById(req.db, id, (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ status: 'error', message: 'FIR not found' });
    }
    res.json({ status: 'success', data: row });
  });
});

// Update FIR status - PUT /api/firs/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ status: 'error', message: 'Status is required' });
  }

  const sql = `UPDATE firs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

  req.db.run(sql, [status, id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ status: 'error', message: 'FIR not found' });
    }
    res.json({ status: 'success', message: 'FIR updated successfully' });
  });
});

// Get FIRs by status - GET /api/firs/status/:status
router.get('/status/:status', (req, res) => {
  const { status } = req.params;
  const sql = `SELECT * FROM firs WHERE status = ? ORDER BY created_at DESC`;

  req.db.all(sql, [status], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows || [] });
  });
});

// Delete FIR - DELETE /api/firs/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM firs WHERE id = ?`;

  req.db.run(sql, [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ status: 'error', message: 'FIR not found' });
    }
    res.json({ status: 'success', message: 'FIR deleted successfully' });
  });
});

// Approve FIR - PUT /api/firs/:id/approve
router.put('/:id/approve', (req, res) => {
  const { id } = req.params;
  const { assigned_officer_id } = req.body;

  const sql = `UPDATE firs SET status = 'Approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

  req.db.run(sql, [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ status: 'error', message: 'FIR not found' });
    }

    // Get FIR details for logging using helper function
    getFirById(req.db, id, (err, fir) => {
      if (!err && fir) {
        logActivity(
          req.db,
          assigned_officer_id || null,
          'FIR_APPROVED',
          'FIR approved',
          `FIR #${id} against ${fir.accused} approved for ${fir.crime_type}`,
          'FIR',
          id,
          'fas fa-check-circle'
        );

        // Notify complainant
        if (fir.user_id) {
          createNotification(req.db, fir.user_id,
            'FIR Approved',
            `Your FIR ${fir.fir_number || '#' + id} (${fir.crime_type}) has been approved.`,
            'fir_status', 'FIR', parseInt(id));
        }
      }
    });

    res.json({ status: 'success', message: 'FIR approved successfully' });
  });
});

// Reject FIR - PUT /api/firs/:id/reject
router.put('/:id/reject', (req, res) => {
  const { id } = req.params;
  const { rejection_reason } = req.body;

  const sql = `UPDATE firs SET status = 'Rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

  req.db.run(sql, [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ status: 'error', message: 'FIR not found' });
    }

    // Get FIR details for logging using helper function
    getFirById(req.db, id, (err, fir) => {
      if (!err && fir) {
        logActivity(
          req.db,
          null,
          'FIR_REJECTED',
          'FIR rejected',
          `FIR #${id} against ${fir.accused} rejected. Reason: ${rejection_reason || 'N/A'}`,
          'FIR',
          id,
          'fas fa-times-circle'
        );

        // Notify complainant
        if (fir.user_id) {
          createNotification(req.db, fir.user_id,
            'FIR Rejected',
            `Your FIR ${fir.fir_number || '#' + id} (${fir.crime_type}) was rejected. Reason: ${rejection_reason || 'N/A'}`,
            'fir_status', 'FIR', parseInt(id));
        }
      }
    });

    res.json({ status: 'success', message: 'FIR rejected successfully' });
  });
});

// Classify FIR text using Python AI service - POST /api/firs/classify
router.post('/classify', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length < 5) {
    return res.status(400).json({ status: 'error', message: 'FIR text is required (minimum 5 characters)' });
  }

  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${aiServiceUrl}/classify-fir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim() }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        status: 'error',
        message: errData.detail || 'AI service error',
      });
    }

    const data = await response.json();
    res.json({
      status: 'success',
      data: {
        crime_type: data.crime_type,
        confidence: data.confidence,
        all_scores: data.all_scores,
      },
    });
  } catch (err) {
    console.error('AI classification error:', err.message);
    res.status(503).json({
      status: 'error',
      message: 'AI classification service unavailable. Make sure the Python service is running.',
    });
  }
});

module.exports = router;
