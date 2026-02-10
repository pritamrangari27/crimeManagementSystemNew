const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { logActivity } = require('../utils/activityLogger');

// Middleware to check if user is Admin
const checkAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'Admin') {
    return res.status(403).json({ status: 'error', message: 'Admin access required' });
  }
  next();
};

// Get all users (with pagination)
router.get('/users', checkAdmin, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Get total count
    req.db.get('SELECT COUNT(*) as total FROM users', (err, countResult) => {
      if (err) {
        console.error('Error counting users:', err);
        return res.status(500).json({ status: 'error', message: 'Database error' });
      }

      // Get paginated users (don't return password hashes)
      const sql = `SELECT id, username, email, phone, role, station_id, created_at, updated_at 
                   FROM users 
                   LIMIT ? OFFSET ?`;
      
      req.db.all(sql, [limit, offset], (err, users) => {
        if (err) {
          console.error('Error fetching users:', err);
          return res.status(500).json({ status: 'error', message: 'Database error' });
        }

        res.json({
          status: 'success',
          data: users,
          pagination: {
            total: countResult.total,
            page,
            limit,
            pages: Math.ceil(countResult.total / limit)
          }
        });
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Create a new user (Admin)
router.post('/users', checkAdmin, async (req, res) => {
  try {
    const { username, email, password, phone, role, station_id } = req.body;

    // Validation
    if (!username || !email || !password || !role) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    if (!['Admin', 'User', 'Police'].includes(role)) {
      return res.status(400).json({ status: 'error', message: 'Invalid role' });
    }

    if (role === 'Police' && !station_id) {
      return res.status(400).json({ status: 'error', message: 'Station ID required for Police role' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (username, email, password, phone, role, station_id) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    
    req.db.run(sql, [username, email, hashedPassword, phone || '', role, station_id || null], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ status: 'error', message: 'Username or email already exists' });
        }
        console.error('Error creating user:', err);
        return res.status(500).json({ status: 'error', message: 'Failed to create user' });
      }

      // Log activity
      logActivity(
        req.db,
        req.session.user.id,
        'USER_CREATED',
        `Created new ${role} user: ${username}`,
        `Admin ${req.session.user.username} created user ${username}`,
        'Admin',
        req.session.user.id,
        'fas fa-user-plus'
      );

      res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        id: this.lastID
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Update user
router.put('/users/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, phone, role, station_id } = req.body;

    const updates = [];
    const values = [];

    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }
    if (phone) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (role) {
      updates.push('role = ?');
      values.push(role);
    }
    if (station_id !== undefined) {
      updates.push('station_id = ?');
      values.push(station_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    
    req.db.run(sql, values, function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ status: 'error', message: 'Username or email already exists' });
        }
        console.error('Error updating user:', err);
        return res.status(500).json({ status: 'error', message: 'Failed to update user' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({ status: 'success', message: 'User updated successfully' });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', checkAdmin, (req, res) => {
  try {
    const { id } = req.params;

    if (id == req.session.user.id) {
      return res.status(400).json({ status: 'error', message: 'Cannot delete your own account' });
    }

    const sql = 'DELETE FROM users WHERE id = ?';
    
    req.db.run(sql, [id], function(err) {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ status: 'error', message: 'Failed to delete user' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.json({ status: 'success', message: 'User deleted successfully' });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Bulk import users (CSV format)
router.post('/users/bulk/import', checkAdmin, async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid users array' });
    }

    if (users.length > 10000) {
      return res.status(400).json({ status: 'error', message: 'Maximum 10000 users per import' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Insert users sequentially
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      try {
        // Validation
        if (!user.username || !user.email || !user.password || !user.role) {
          results.failed++;
          results.errors.push({ row: i + 1, error: 'Missing required fields' });
          continue;
        }

        if (!['Admin', 'User', 'Police'].includes(user.role)) {
          results.failed++;
          results.errors.push({ row: i + 1, error: 'Invalid role' });
          continue;
        }

        const hashedPassword = await bcrypt.hash(user.password, 10);

        const sql = `INSERT INTO users (username, email, password, phone, role, station_id) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        
        await new Promise((resolve, reject) => {
          req.db.run(sql, [user.username, user.email, hashedPassword, user.phone || '', user.role, user.station_id || null], function(err) {
            if (err) {
              if (err.message.includes('UNIQUE')) {
                results.failed++;
                results.errors.push({ row: i + 1, error: 'Username or email already exists' });
              } else {
                results.failed++;
                results.errors.push({ row: i + 1, error: err.message });
              }
              resolve();
            } else {
              results.success++;
              resolve();
            }
          });
        });
      } catch (error) {
        results.failed++;
        results.errors.push({ row: i + 1, error: error.message });
      }
    }

    // Log activity
    logActivity(
      req.db,
      req.session.user.id,
      'BULK_USER_IMPORT',
      `Imported ${results.success} users`,
      `Admin ${req.session.user.username} imported ${results.success} users successfully`,
      'Admin',
      req.session.user.id,
      'fas fa-users'
    );

    res.json({
      status: 'success',
      message: `Bulk import completed: ${results.success} success, ${results.failed} failed`,
      results
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Get user statistics
router.get('/users/stats', checkAdmin, (req, res) => {
  try {
    const sql = `SELECT 
                   COUNT(*) as total,
                   SUM(CASE WHEN role = 'Admin' THEN 1 ELSE 0 END) as admins,
                   SUM(CASE WHEN role = 'User' THEN 1 ELSE 0 END) as users,
                   SUM(CASE WHEN role = 'Police' THEN 1 ELSE 0 END) as police
                 FROM users`;
    
    req.db.get(sql, (err, stats) => {
      if (err) {
        console.error('Error getting stats:', err);
        return res.status(500).json({ status: 'error', message: 'Database error' });
      }

      res.json({ status: 'success', data: stats });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

module.exports = router;
