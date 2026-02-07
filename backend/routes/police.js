const express = require('express');
const router = express.Router();
const { logActivity } = require('../utils/activityLogger');

// Add police officer
router.post('/add', (req, res) => {
  const {
    police_id, name, crime_type, station_name, station_id, email, phone, address
  } = req.body;

  if (!police_id || !name) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  const sql = `INSERT INTO police (
    police_id, name, crime_type, station_name, station_id, email, phone, address
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  req.db.run(sql, [
    police_id, name, crime_type, station_name, station_id, email, phone, address
  ], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ status: 'error', message: 'Police ID already exists' });
      }
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    
    // Log the police officer addition activity
    logActivity(
      req.db,
      null,
      'POLICE_ADDED',
      'Police officer added',
      `${name} added as police officer at ${station_name}`,
      'Police',
      this.lastID,
      'fas fa-users-cog'
    );
    
    res.json({ status: 'success', message: 'Police officer added', id: this.lastID });
  });
});

// Get all police officers
router.get('/all', (req, res) => {
  const sql = `SELECT * FROM police ORDER BY created_at DESC`;

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows });
  });
});

// Get police by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM police WHERE id = ?`;

  req.db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ status: 'error', message: 'Police officer not found' });
    }
    res.json({ status: 'success', data: row });
  });
});

// Get police by station
router.get('/station/:stationId', (req, res) => {
  const { stationId } = req.params;
  const sql = `SELECT * FROM police WHERE station_id = ? ORDER BY name ASC`;

  req.db.all(sql, [stationId], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows });
  });
});

// Update police
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  values.push(id);

  const sql = `UPDATE police SET ${setClause}, created_at = CURRENT_TIMESTAMP WHERE id = ?`;

  req.db.run(sql, values, function(err) {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', message: 'Police officer updated' });
  });
});

// Delete police
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM police WHERE id = ?`;

  req.db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', message: 'Police officer deleted' });
  });
});

module.exports = router;
