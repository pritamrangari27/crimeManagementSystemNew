const express = require('express');
const router = express.Router();

// Get dashboard statistics
router.get('/stats', (req, res) => {
  const queries = {
    totalPolice: `SELECT COUNT(*) as count FROM police`,
    totalCriminals: `SELECT COUNT(*) as count FROM criminals`,
    totalStations: `SELECT COUNT(*) as count FROM police_station`,
    totalFIRs: `SELECT COUNT(*) as count FROM firs`,
    pendingFIRs: `SELECT COUNT(*) as count FROM firs WHERE status = 'Pending'`,
    approvedFIRs: `SELECT COUNT(*) as count FROM firs WHERE status = 'Approved'`,
    totalUsers: `SELECT COUNT(*) as count FROM users WHERE role = 'User'`
  };

  const stats = {};
  let completed = 0;
  let errors = 0;

  Object.entries(queries).forEach(([key, sql]) => {
    req.db.get(sql, [], (err, result) => {
      if (err) {
        errors++;
      } else {
        stats[key] = result.count;
      }
      completed++;

      if (completed === Object.keys(queries).length) {
        if (errors) {
          return res.status(500).json({ status: 'error', message: 'Database error' });
        }
        res.json({ status: 'success', data: stats });
      }
    });
  });
});

// Get crime statistics by type
router.get('/crimes-by-type', (req, res) => {
  const sql = `SELECT crime_type, COUNT(*) as count FROM criminals 
               GROUP BY crime_type ORDER BY count DESC`;

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows });
  });
});

// Get FIR status distribution
router.get('/fir-status', (req, res) => {
  const sql = `SELECT status, COUNT(*) as count FROM firs 
               GROUP BY status`;

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows });
  });
});

// Get crimes by location
router.get('/crimes-by-location', (req, res) => {
  const sql = `SELECT city, state, COUNT(*) as count FROM criminals 
               GROUP BY city, state ORDER BY count DESC LIMIT 10`;

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows });
  });
});

// Get recent activity
router.get('/activity', (req, res) => {
  const limit = req.query.limit || 10;

  const sql = `SELECT 'Criminal' as type, criminal_name as name, crime_type as detail, created_at 
               FROM criminals 
               UNION ALL
               SELECT 'FIR' as type, fir_number as name, crime_type as detail, created_at 
               FROM firs 
               UNION ALL
               SELECT 'Police' as type, name as name, position as detail, created_at 
               FROM police 
               ORDER BY created_at DESC LIMIT ?`;

  req.db.all(sql, [limit], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows });
  });
});

module.exports = router;
