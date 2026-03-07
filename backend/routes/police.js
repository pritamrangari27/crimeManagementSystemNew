const express = require('express');
const router = express.Router();
const { logActivity } = require('../utils/activityLogger');
const ResponseHandler = require('../utils/responseHandler');

// Add police officer
router.post('/add', (req, res) => {
  const {
    police_id, name, crime_type, position, station_name, station_id, email, phone, address
  } = req.body;

  if (!police_id || !name) {
    return ResponseHandler.validationError(res, 'Missing required fields');
  }

  const sql = `INSERT INTO police (
    police_id, name, crime_type, position, station_name, station_id, email, phone, address
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  req.db.run(sql, [
    police_id, name, crime_type, position || null, station_name, station_id, email, phone, address
  ], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return ResponseHandler.error(res, 'Police ID already exists', 400);
      }
      return ResponseHandler.databaseError(res, err, 'Add police officer');
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
    
    return ResponseHandler.success(res, { id: this.lastID }, 'Police officer added', 201);
  });
});

// Get all police officers
router.get('/all', (req, res) => {
  const sql = `SELECT * FROM police ORDER BY created_at DESC`;

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return ResponseHandler.databaseError(res, err, 'Fetch all police');
    }
    ResponseHandler.success(res, rows, 'Police officers retrieved');
  });
});

// Get police by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM police WHERE id = ?`;

  req.db.get(sql, [id], (err, row) => {
    if (err) {
      return ResponseHandler.databaseError(res, err, 'Fetch police by ID');
    }
    if (!row) {
      return ResponseHandler.notFound(res, 'Police officer');
    }
    ResponseHandler.success(res, row, 'Police officer retrieved');
  });
});

// Get police by station
router.get('/station/:stationId', (req, res) => {
  const { stationId } = req.params;
  const sql = `SELECT * FROM police WHERE station_id = ? ORDER BY name ASC`;

  req.db.all(sql, [stationId], (err, rows) => {
    if (err) {
      return ResponseHandler.databaseError(res, err, 'Fetch police by station');
    }
    ResponseHandler.success(res, rows, 'Police officers retrieved');
  });
});

// Update police
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const ALLOWED_COLS = ['police_id','name','crime_type','position','station_name','station_id','email','phone','address','active_cases'];

  const filteredKeys = Object.keys(updates).filter(k => ALLOWED_COLS.includes(k));
  if (filteredKeys.length === 0) {
    return ResponseHandler.validationError(res, 'No valid fields to update');
  }
  const setClause = filteredKeys.map(key => `${key} = ?`).join(', ');
  const values = filteredKeys.map(k => updates[k]);
  values.push(id);

  const sql = `UPDATE police SET ${setClause}, created_at = CURRENT_TIMESTAMP WHERE id = ?`;

  req.db.run(sql, values, function(err) {
    if (err) {
      return ResponseHandler.databaseError(res, err, 'Update police');
    }
    ResponseHandler.success(res, { id }, 'Police officer updated');
  });
});

// Delete police
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM police WHERE id = ?`;

  req.db.run(sql, [id], function(err) {
    if (err) {
      return ResponseHandler.databaseError(res, err, 'Delete police');
    }
    ResponseHandler.success(res, { id }, 'Police officer deleted');
  });
});

module.exports = router;
