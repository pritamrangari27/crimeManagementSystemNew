/**
 * Generic CRUD Factory
 * Reduces code duplication in CRUD routes
 * Usage: createCRUDRouter(tableName, requiredFields, validators)
 */

const express = require('express');

/**
 * Create a generic CRUD router for a database table
 * @param {string} tableName - Name of the database table
 * @param {string[]} requiredFields - Required fields for creation
 * @param {object} validators - Field validators (optional)
 * @returns {express.Router} Configured router with CRUD endpoints
 */
const createCRUDRouter = (tableName, requiredFields = [], validators = {}) => {
  const router = express.Router();

  /**
   * GET /all - Get all records
   */
  router.get('/all', (req, res) => {
    const sql = `SELECT * FROM ${tableName} ORDER BY created_at DESC`;
    
    req.db.all(sql, [], (err, rows) => {
      if (err) {
        console.error(`Error fetching from ${tableName}:`, err);
        return res.status(500).json({ status: 'error', message: 'Database error' });
      }
      res.json({ status: 'success', data: rows || [] });
    });
  });

  /**
   * GET /:id - Get single record by ID
   */
  router.get('/:id', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM ${tableName} WHERE id = ?`;

    req.db.get(sql, [id], (err, row) => {
      if (err) {
        console.error(`Error fetching from ${tableName}:`, err);
        return res.status(500).json({ status: 'error', message: 'Database error' });
      }
      if (!row) {
        return res.status(404).json({ status: 'error', message: `${tableName} record not found` });
      }
      res.json({ status: 'success', data: row });
    });
  });

  /**
   * POST / or /add - Create new record
   */
  const createHandler = (req, res) => {
    // Validate required fields
    const missingFields = [];
    requiredFields.forEach(field => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Run custom validators if provided
    for (const [field, validator] of Object.entries(validators)) {
      if (req.body[field]) {
        const result = validator(req.body[field]);
        if (!result.valid) {
          return res.status(400).json({ status: 'error', message: result.message });
        }
      }
    }

    const fields = Object.keys(req.body);
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(f => req.body[f]);

    const sql = `INSERT INTO ${tableName} (${fields.join(', ')}, created_at, updated_at) 
                 VALUES (${placeholders}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

    req.db.run(sql, values, function(err) {
      if (err) {
        console.error(`Error inserting into ${tableName}:`, err);
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ status: 'error', message: 'Record already exists. Duplicate key error.' });
        }
        return res.status(500).json({ status: 'error', message: 'Database error' });
      }
      res.status(201).json({
        status: 'success',
        message: `${tableName} record created successfully`,
        id: this.lastID
      });
    });
  };

  router.post('/add', createHandler);
  router.post('/', createHandler);

  /**
   * PUT /:id - Update record
   */
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ status: 'error', message: 'No fields to update' });
    }

    // Run custom validators if provided
    for (const [field, validator] of Object.entries(validators)) {
      if (updates[field]) {
        const result = validator(updates[field]);
        if (!result.valid) {
          return res.status(400).json({ status: 'error', message: result.message });
        }
      }
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);

    const sql = `UPDATE ${tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    req.db.run(sql, values, function(err) {
      if (err) {
        console.error(`Error updating ${tableName}:`, err);
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ status: 'error', message: 'Record already exists. Duplicate key error.' });
        }
        return res.status(500).json({ status: 'error', message: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ status: 'error', message: `${tableName} record not found` });
      }

      res.json({ status: 'success', message: `${tableName} record updated successfully` });
    });
  });

  /**
   * DELETE /:id - Delete record
   */
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM ${tableName} WHERE id = ?`;

    req.db.run(sql, [id], function(err) {
      if (err) {
        console.error(`Error deleting from ${tableName}:`, err);
        return res.status(500).json({ status: 'error', message: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ status: 'error', message: `${tableName} record not found` });
      }

      res.json({ status: 'success', message: `${tableName} record deleted successfully` });
    });
  });

  return router;
};

module.exports = { createCRUDRouter };
