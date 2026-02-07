const express = require('express');
const router = express.Router();

// Add police station
router.post('/add', (req, res) => {
  const {
    station_name, station_id, state, address
  } = req.body;

  if (!station_name || !station_id || !state || !address) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  const sql = `INSERT INTO police_station (
    station_name, station_id, state, address
  ) VALUES (?, ?, ?, ?)`;

  req.db.run(sql, [
    station_name, station_id, state, address
  ], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ status: 'error', message: 'Station ID already exists' });
      }
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', message: 'Police station added', id: this.lastID });
  });
});

// Get all police stations
router.get('/all', (req, res) => {
  const sql = `SELECT * FROM police_station ORDER BY created_at DESC`;

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows });
  });
});

// Get station by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM police_station WHERE id = ?`;

  req.db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ status: 'error', message: 'Station not found' });
    }
    res.json({ status: 'success', data: row });
  });
});

// Get station with officers count
router.get('/:id/details', (req, res) => {
  const { id } = req.params;
  
  req.db.get(`SELECT * FROM police_stations WHERE id = ?`, [id], (err, station) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (!station) {
      return res.status(404).json({ status: 'error', message: 'Station not found' });
    }

    req.db.get(`SELECT COUNT(*) as officer_count FROM police WHERE station_id = ?`, [id], (err, count) => {
      if (err) {
        return res.status(500).json({ status: 'error', message: 'Database error' });
      }

      res.json({ status: 'success', data: { ...station, ...count } });
    });
  });
});

// Update police station
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  values.push(id);

  const sql = `UPDATE police_station SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

  req.db.run(sql, values, function(err) {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', message: 'Police station updated' });
  });
});

// Delete police station
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Check if station has officers
  req.db.get(`SELECT COUNT(*) as count FROM police WHERE station_id = ?`, [id], (err, result) => {
    if (err || result.count > 0) {
      return res.status(400).json({ status: 'error', message: 'Cannot delete station with officers' });
    }

    const sql = `DELETE FROM police_station WHERE id = ?`;
    req.db.run(sql, [id], function(err) {
      if (err) {
        return res.status(500).json({ status: 'error', message: 'Database error' });
      }
      res.json({ status: 'success', message: 'Police station deleted' });
    });
  });
});

module.exports = router;
