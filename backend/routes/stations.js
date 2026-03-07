const express = require('express');
const router = express.Router();
const ResponseHandler = require('../utils/responseHandler');

// Add police station
router.post('/add', (req, res) => {
  const {
    station_name, station_code, address, city, state, phone, email, in_charge
  } = req.body;

  if (!station_name || !station_code || !address || !state) {
    return ResponseHandler.validationError(res, 'Missing required fields');
  }

  const sql = `INSERT INTO police_station (
    station_name, station_code, address, city, state, phone, email, in_charge
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  req.db.run(sql, [
    station_name, station_code, address, city, state, phone, email, in_charge
  ], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return ResponseHandler.error(res, 'Station Code already exists', 400);
      }
      return ResponseHandler.databaseError(res, err, 'Add police station');
    }
    ResponseHandler.success(res, { id: this.lastID }, 'Police station added', 201);
  });
});

// Get all police stations
router.get('/all', (req, res) => {
  const sql = `SELECT * FROM police_station ORDER BY created_at DESC`;

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return ResponseHandler.databaseError(res, err, 'Fetch all stations');
    }
    ResponseHandler.success(res, rows, 'Police stations retrieved');
  });
});

// Get station by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM police_station WHERE id = ?`;

  req.db.get(sql, [id], (err, row) => {
    if (err) {
      return ResponseHandler.databaseError(res, err, 'Fetch station by ID');
    }
    if (!row) {
      return ResponseHandler.notFound(res, 'Police station');
    }
    ResponseHandler.success(res, row, 'Police station retrieved');
  });
});

// Get station with officers count
router.get('/:id/details', (req, res) => {
  const { id } = req.params;
  
  req.db.get(`SELECT * FROM police_station WHERE id = ?`, [id], (err, station) => {
    if (err) {
      return ResponseHandler.databaseError(res, err, 'Fetch station details');
    }
    if (!station) {
      return ResponseHandler.notFound(res, 'Police station');
    }

    req.db.get(`SELECT COUNT(*) as officer_count FROM police WHERE station_id = ?`, [id], (err, count) => {
      if (err) {
        return ResponseHandler.databaseError(res, err, 'Count station officers');
      }

      ResponseHandler.success(res, { ...station, ...count }, 'Station details retrieved');
    });
  });
});

// Update police station
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const ALLOWED_COLS = ['station_name','station_code','address','city','state','phone','email','in_charge','latitude','longitude'];

  const filteredKeys = Object.keys(updates).filter(k => ALLOWED_COLS.includes(k));
  if (filteredKeys.length === 0) {
    return ResponseHandler.validationError(res, 'No valid fields to update');
  }
  const setClause = filteredKeys.map(key => `${key} = ?`).join(', ');
  const values = filteredKeys.map(k => updates[k]);
  values.push(id);

  const sql = `UPDATE police_station SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

  req.db.run(sql, values, function(err) {
    if (err) {
      return ResponseHandler.databaseError(res, err, 'Update station');
    }
    ResponseHandler.success(res, { id }, 'Police station updated');
  });
});

// Delete police station
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Check if station has officers
  req.db.get(`SELECT COUNT(*) as count FROM police WHERE station_id = ?`, [id], (err, result) => {
    if (err) {
      return ResponseHandler.databaseError(res, err, 'Check station officers');
    }
    if (result.count > 0) {
      return ResponseHandler.error(res, 'Cannot delete station with officers', 400);
    }

    const sql = `DELETE FROM police_station WHERE id = ?`;
    req.db.run(sql, [id], function(err) {
      if (err) {
        return ResponseHandler.databaseError(res, err, 'Delete station');
      }
      ResponseHandler.success(res, { id }, 'Police station deleted');
    });
  });
});

module.exports = router;
