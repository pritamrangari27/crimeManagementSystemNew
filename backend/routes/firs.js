const express = require('express');
const router = express.Router();

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

module.exports = router;
