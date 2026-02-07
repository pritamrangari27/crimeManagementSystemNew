const express = require('express');
const router = express.Router();
const { logActivity } = require('../utils/activityLogger');

// Create FIR - POST /api/firs
router.post('/', (req, res) => {
  const {
    user_id, station_id, crime_type, accused, name, age, number, address,
    relation, purpose, file, status = 'Sent'
  } = req.body;

  // Validate required fields
  if (!user_id || !station_id || !crime_type || !accused || !name || !age || !number || !address) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Missing required fields' 
    });
  }

  const sql = `INSERT INTO firs (
    user_id, station_id, crime_type, accused, name, age, number, address,
    relation, purpose, file, status, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

  req.db.run(sql, [
    user_id, station_id, crime_type, accused, name, age, number, address,
    relation || '', purpose || '', file || null, status
  ], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    
    // Log the FIR creation activity
    logActivity(
      req.db,
      user_id,
      'FIR_CREATED',
      'FIR filed successfully',
      `New FIR filed against ${accused} for ${crime_type}`,
      'FIR',
      this.lastID,
      'fas fa-file-alt'
    );
    
    res.json({ 
      status: 'success', 
      message: 'FIR created successfully', 
      id: this.lastID
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
  const sql = `SELECT * FROM firs WHERE id = ?`;

  req.db.get(sql, [id], (err, row) => {
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

    // Get FIR details for logging
    req.db.get('SELECT * FROM firs WHERE id = ?', [id], (err, fir) => {
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

    // Get FIR details for logging
    req.db.get('SELECT * FROM firs WHERE id = ?', [id], (err, fir) => {
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
      }
    });

    res.json({ status: 'success', message: 'FIR rejected successfully' });
  });
});

module.exports = router;
