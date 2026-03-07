const express = require('express');
const router = express.Router();
const { logActivity } = require('../utils/activityLogger');
const ResponseHandler = require('../utils/responseHandler');

// Mixed-case columns need quoting for PostgreSQL
const MIXED_CASE_COLS = ['Prison_name', 'Court_name', 'Criminal_name', 'DateOfBirth'];
const quoteCol = (col) => MIXED_CASE_COLS.includes(col) ? `"${col}"` : col;

// Add criminal
router.post('/add', (req, res) => {
  const {
    station_name, station_id, crime_type, crime_date, crime_time,
    Prison_name, Court_name, Criminal_name, contact, DateOfBirth,
    email, state, city, address, photo, gender
  } = req.body;

  if (!Criminal_name || !crime_type) {
    return ResponseHandler.validationError(res, 'Missing required fields');
  }

  const sql = `INSERT INTO criminals (
    station_name, station_id, crime_type, crime_date, crime_time,
    "Prison_name", "Court_name", "Criminal_name", contact, "DateOfBirth",
    email, state, city, address, photo, gender
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  req.db.run(sql, [
    station_name, station_id, crime_type, crime_date, crime_time,
    Prison_name, Court_name, Criminal_name, contact, DateOfBirth,
    email, state, city, address, photo, gender
  ], function(err) {
    if (err) {
      return ResponseHandler.databaseError(res, err, 'Add criminal');
    }
    
    // Log the criminal addition activity
    logActivity(
      req.db,
      null,
      'CRIMINAL_ADDED',
      'Criminal record added',
      `${Criminal_name} added to database for ${crime_type}`,
      'Criminal',
      this.lastID,
      'fas fa-user-secret'
    );
    
    ResponseHandler.success(res, { id: this.lastID }, 'Criminal added', 201);
  });
});

// Get all criminals
router.get('/all', (req, res) => {
  const sql = `SELECT * FROM criminals ORDER BY created_at DESC`;
  
  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return ResponseHandler.databaseError(res, err, 'Fetch all criminals');
    }
    ResponseHandler.success(res, rows, 'Criminals retrieved');
  });
});

// Get criminal by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM criminals WHERE id = ?`;

  req.db.get(sql, [id], (err, row) => {
    if (err) {
      return ResponseHandler.databaseError(res, err, 'Fetch criminal by ID');
    }
    if (!row) {
      return ResponseHandler.notFound(res, 'Criminal');
    }
    ResponseHandler.success(res, row, 'Criminal retrieved');
  });
});

// Update criminal
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const setClause = Object.keys(updates).map(key => `${quoteCol(key)} = ?`).join(', ');
  const values = Object.values(updates);
  values.push(id);

  const sql = `UPDATE criminals SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

  req.db.run(sql, values, function(err) {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', message: 'Criminal updated' });
  });
});

// Delete criminal
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM criminals WHERE id = ?`;

  req.db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', message: 'Criminal deleted' });
  });
});

// Search criminals
router.get('/search/query', (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ status: 'error', message: 'Search query required' });
  }

  const sql = `SELECT * FROM criminals WHERE LOWER("Criminal_name") LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?) OR LOWER(contact) LIKE LOWER(?) 
               ORDER BY created_at DESC`;
  const searchTerm = `%${query}%`;

  req.db.all(sql, [searchTerm, searchTerm, searchTerm], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows });
  });
});

module.exports = router;
