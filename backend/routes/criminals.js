const express = require('express');
const router = express.Router();
const { logActivity } = require('../utils/activityLogger');

// Add criminal
router.post('/add', (req, res) => {
  const {
    station_name, station_id, crime_type, crime_date, crime_time,
    Prison_name, Court_name, Criminal_name, contact, DateOfBirth,
    email, state, city, address, photo
  } = req.body;

  if (!Criminal_name || !crime_type) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  const sql = `INSERT INTO criminals (
    station_name, station_id, crime_type, crime_date, crime_time,
    Prison_name, Court_name, Criminal_name, contact, DateOfBirth,
    email, state, city, address, photo
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  req.db.run(sql, [
    station_name, station_id, crime_type, crime_date, crime_time,
    Prison_name, Court_name, Criminal_name, contact, DateOfBirth,
    email, state, city, address, photo
  ], function(err) {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
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
    
    res.json({ status: 'success', message: 'Criminal added', id: this.lastID });
  });
});

// Get all criminals
router.get('/all', (req, res) => {
  const sql = `SELECT * FROM criminals ORDER BY created_at DESC`;
  
  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows });
  });
});

// Get criminal by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM criminals WHERE id = ?`;

  req.db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ status: 'error', message: 'Criminal not found' });
    }
    res.json({ status: 'success', data: row });
  });
});

// Update criminal
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
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

  const sql = `SELECT * FROM criminals WHERE criminal_name LIKE ? OR email LIKE ? OR contact LIKE ? 
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
