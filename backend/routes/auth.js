const express = require('express');
const router = express.Router();
const { logActivity } = require('../utils/activityLogger');

/**
 * PRODUCTION NOTES:
 * - Implement bcrypt for password hashing in production
 * - Add rate limiting to prevent brute force attacks
 * - Implement HTTPS with secure cookies
 * - Add CSRF protection middleware
 * - Implement password strength requirements
 * - Add email verification for new registrations
 * - Implement account lockout after failed login attempts
 */

// Middleware to check if user is authenticated
const checkAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ status: 'error', message: 'Not authenticated' });
  }
  next();
};

// Input validation utilities
const validateUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  if (username.length < 3 || username.length > 50) return false;
  return /^[a-zA-Z0-9_-]+$/.test(username);
};

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
};

// Login endpoint with RBAC
router.post('/login', (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate inputs
    if (!username || !password || !role) {
      return res.status(400).json({ status: 'error', message: 'Username, password, and role are required' });
    }

    if (!['Admin', 'User', 'Police'].includes(role)) {
      return res.status(400).json({ status: 'error', message: 'Invalid role selected' });
    }

    // IMPORTANT: In production, use bcrypt to compare passwords
    // const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    const sql = `SELECT id, username, email, phone, role, station_id, profile_pic FROM users 
                 WHERE username = ? AND password = ? AND role = ?`;
    
    req.db.get(sql, [username, password, role], (err, user) => {
      if (err) {
        console.error('Login database error:', err);
        return res.status(500).json({ status: 'error', message: 'Authentication service unavailable' });
      }

      if (!user) {
        // Generic message for security (don't reveal if user exists)
        return res.status(401).json({ status: 'error', message: 'Invalid username or password' });
      }

      // Role-based validation
      if (role === 'Police' && !user.station_id) {
        return res.status(401).json({ status: 'error', message: 'Police officer must be assigned to a station' });
      }

      // Set secure session
      req.session.user = user;
      
      // Log the login activity
      logActivity(
        req.db,
        user.id,
        'LOGIN',
        `${user.role} logged in`,
        `${user.username} (${user.role}) logged into the system`,
        'User',
        user.id,
        'fas fa-sign-in-alt'
      );
      
      res.json({ 
        status: 'success', 
        message: `Login successful as ${role}`,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          station_id: user.station_id,
          profile_pic: user.profile_pic
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'error', message: 'An unexpected error occurred' });
  }
});

// Register endpoint with validation
router.post('/register', (req, res) => {
  try {
    const { username, password, email, phone, role, station_id } = req.body;

    // Validate required fields
    if (!username || !password || !email || !role) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    // Validate input formats
    if (!validateUsername(username)) {
      return res.status(400).json({ status: 'error', message: 'Username must be 3-50 characters (alphanumeric, dash, underscore)' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ status: 'error', message: 'Invalid email address' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters' });
    }

    if (!['Admin', 'User', 'Police'].includes(role)) {
      return res.status(400).json({ status: 'error', message: 'Invalid role' });
    }

    // Police role requires station
    if (role === 'Police' && !station_id) {
      return res.status(400).json({ status: 'error', message: 'Police officers must select a station' });
    }

    const sql = `INSERT INTO users (username, password, email, phone, role, station_id) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    
    // Police role requires station_id
    if (role === 'Police' && !station_id) {
      return res.status(400).json({ status: 'error', message: 'Station ID is required for Police registration' });
    }

    // Additional validation for role
    if (!['Admin', 'User', 'Police'].includes(role)) {
      return res.status(400).json({ status: 'error', message: 'Invalid role selected' });
    }

    req.db.run(sql, [username, password, email, phone || '', role, station_id || null], function(err) {
      if (err) {
        console.error('Registration database error:', err);
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ status: 'error', message: 'Username or email already registered' });
        }
        return res.status(500).json({ status: 'error', message: 'Registration failed' });
      }

      res.status(201).json({ 
        status: 'success', 
        message: `${role} registration successful. Please login with your credentials.`,
        id: this.lastID
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ status: 'error', message: 'An unexpected error occurred during registration' });
  }
});

/**
 * Logout endpoint
 * - Securely destroys user session
 * - Clears all authentication state
 * SECURITY: Verify session cookie is cleared on client side (httpOnly prevents JS access)
 */
router.post('/logout', (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(400).json({ status: 'error', message: 'No active session' });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ status: 'error', message: 'Logout service unavailable' });
      }
      
      // Clear session cookie on client
      res.clearCookie('connect.sid');
      res.json({ status: 'success', message: 'Logged out successfully' });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ status: 'error', message: 'An unexpected error occurred' });
  }
});

/**
 * Get current user endpoint
 * - Returns authenticated user's session data
 * - Requires valid session (protected by checkAuth middleware)
 * SECURITY: Never expose sensitive data (password hashes, raw credentials)
 */
router.get('/current-user', checkAuth, (req, res) => {
  try {
    const user = req.session.user;

    res.json({ 
      status: 'success', 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        station_id: user.station_id,
        profile_pic: user.profile_pic
      }
    });
  } catch (error) {
    console.error('Current user fetch error:', error);
    res.status(500).json({ status: 'error', message: 'An unexpected error occurred' });
  }
});

/**
 * Change password endpoint
 * - Validates old password before issuing new one
 * - Updates password hash with timestamp
 * SECURITY: In production, use bcrypt for password comparison and hashing
 * Current implementation uses plain text for backwards compatibility with existing DB
 * Migration path: Use bcrypt.hash() for new passwords, verify with bcrypt.compare()
 */
router.post('/change-password', checkAuth, (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.user.id;

    // Validate inputs
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ status: 'error', message: 'All password fields are required' });
    }

    // Validate new password format
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters' });
    }

    // Verify passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: 'error', message: 'New passwords do not match' });
    }

    // Prevent same password
    if (oldPassword === newPassword) {
      return res.status(400).json({ status: 'error', message: 'New password must be different from current password' });
    }

    // Verify old password
    const checkSql = `SELECT id FROM users WHERE id = ? AND password = ?`;
    req.db.get(checkSql, [userId, oldPassword], (err, user) => {
      if (err) {
        console.error('Password verification database error:', err);
        return res.status(500).json({ status: 'error', message: 'Password verification service unavailable' });
      }

      if (!user) {
        // Generic message for security (don't reveal if password is correct)
        return res.status(401).json({ status: 'error', message: 'Current password is incorrect' });
      }

      // Update password
      const updateSql = `UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      req.db.run(updateSql, [newPassword, userId], (err) => {
        if (err) {
          console.error('Password update database error:', err);
          return res.status(500).json({ status: 'error', message: 'Password update failed' });
        }

        res.json({ 
          status: 'success', 
          message: 'Password changed successfully' 
        });
      });
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ status: 'error', message: 'An unexpected error occurred' });
  }
});

module.exports = router;
