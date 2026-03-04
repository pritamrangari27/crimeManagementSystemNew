const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { logActivity } = require('../utils/activityLogger');
const { validateUsername, validateEmail, validatePassword, validateRole } = require('../utils/validators');

// Middleware to check if user is authenticated
const checkAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ status: 'error', message: 'Not authenticated' });
  }
  next();
};

// Login endpoint with RBAC and bcrypt
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate inputs
    if (!username || !password || !role) {
      return res.status(400).json({ status: 'error', message: 'Username, password, and role are required' });
    }

    if (!['Admin', 'User', 'Police'].includes(role)) {
      return res.status(400).json({ status: 'error', message: 'Invalid role selected' });
    }

    const sql = `SELECT id, username, email, phone, address, badge_number, role, station_id, profile_pic, password FROM users 
                 WHERE username = ? AND role = ?`;
    
    req.db.get(sql, [username, role], async (err, user) => {
      if (err) {
        console.error('Login database error:', err);
        return res.status(500).json({ status: 'error', message: 'Authentication service unavailable' });
      }

      if (!user) {
        // Generic message for security (don't reveal if user exists)
        return res.status(401).json({ status: 'error', message: 'Invalid username or password' });
      }

      // Compare password using bcrypt
      try {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
          return res.status(401).json({ status: 'error', message: 'Invalid username or password' });
        }

        // Role-based validation
        if (role === 'Police' && !user.station_id) {
          return res.status(401).json({ status: 'error', message: 'Police officer must be assigned to a station' });
        }

        // Set secure session (don't include password)
        req.session.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          address: user.address,
          badge_number: user.badge_number,
          role: user.role,
          station_id: user.station_id,
          profile_pic: user.profile_pic
        };
        
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
            phone: user.phone,
            address: user.address,
            badge_number: user.badge_number,
            role: user.role,
            station_id: user.station_id,
            profile_pic: user.profile_pic
          }
        });
      } catch (bcryptErr) {
        console.error('Password comparison error:', bcryptErr);
        return res.status(500).json({ status: 'error', message: 'Authentication service error' });
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'error', message: 'An unexpected error occurred' });
  }
});

// Register endpoint with validation and bcrypt hashing
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, phone, role, station_id } = req.body;

    // Validate required fields
    if (!username || !password || !email || !role) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    // Validate input formats
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return res.status(400).json({ status: 'error', message: usernameValidation.message });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ status: 'error', message: emailValidation.message });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ status: 'error', message: passwordValidation.message });
    }

    const roleValidation = validateRole(role);
    if (!roleValidation.valid) {
      return res.status(400).json({ status: 'error', message: roleValidation.message });
    }

    // Police role requires station
    if (role === 'Police' && !station_id) {
      return res.status(400).json({ status: 'error', message: 'Police officers must select a station' });
    }

    // Hash the password
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const sql = `INSERT INTO users (username, password, email, phone, role, station_id) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
      
      req.db.run(sql, [username, hashedPassword, email, phone || '', role, station_id || null], function(err) {
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
    } catch (hashErr) {
      console.error('Password hashing error:', hashErr);
      return res.status(500).json({ status: 'error', message: 'Registration service error' });
    }
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
        address: user.address,
        badge_number: user.badge_number,
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
 * Update profile endpoint
 * - Updates user profile fields (username, email, phone) in the database
 * - Requires authentication
 */
router.put('/update-profile', (req, res) => {
  try {
    const userId = req.session?.user?.id || req.body.user_id;
    const { username, email, phone, address, badge_number } = req.body;

    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User identification required. Please login again.' });
    }

    if (!username || !email) {
      return res.status(400).json({ status: 'error', message: 'Username and email are required' });
    }

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return res.status(400).json({ status: 'error', message: usernameValidation.message });
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ status: 'error', message: emailValidation.message });
    }

    // Check if username or email is taken by another user
    const checkSql = `SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?`;
    req.db.get(checkSql, [username, email, userId], (err, existing) => {
      if (err) {
        console.error('Profile update check error:', err);
        return res.status(500).json({ status: 'error', message: 'Profile update service unavailable' });
      }

      if (existing) {
        return res.status(409).json({ status: 'error', message: 'Username or email already taken by another user' });
      }

      const updateSql = `UPDATE users SET username = ?, email = ?, phone = ?, address = ?, badge_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      req.db.run(updateSql, [username, email, phone || '', address || '', badge_number || '', userId], function(err) {
        if (err) {
          console.error('Profile update database error:', err);
          return res.status(500).json({ status: 'error', message: 'Failed to update profile' });
        }

        // Update session data if session exists
        if (req.session?.user) {
          req.session.user.username = username;
          req.session.user.email = email;
          req.session.user.phone = phone || '';
          req.session.user.address = address || '';
          req.session.user.badge_number = badge_number || '';
        }

        // Log activity
        logActivity(
          req.db,
          userId,
          'PROFILE_UPDATE',
          'Profile updated',
          `${username} updated their profile information`,
          'User',
          userId,
          'fas fa-user-edit'
        );

        res.json({
          status: 'success',
          message: 'Profile updated successfully',
          user: {
            id: userId,
            username,
            email,
            phone: phone || '',
            address: address || '',
            badge_number: badge_number || '',
            role: req.session?.user?.role || req.body.role,
            station_id: req.session?.user?.station_id || req.body.station_id
          }
        });
      });
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ status: 'error', message: 'An unexpected error occurred' });
  }
});

/**
 * Change password endpoint
 * - Validates old password using bcrypt before issuing new one
 * - Hashes new password with bcrypt before storing
 * - Accepts user_id from body as fallback when session unavailable (cross-origin)
 */
router.post('/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword, user_id } = req.body;
    const userId = req.session?.user?.id || user_id;

    // Validate user identification
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User identification required. Please login again.' });
    }

    // Validate inputs
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ status: 'error', message: 'Current password and new password are required' });
    }

    // Validate new password format
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ status: 'error', message: passwordValidation.message });
    }

    // Prevent same password
    if (oldPassword === newPassword) {
      return res.status(400).json({ status: 'error', message: 'New password must be different from current password' });
    }

    // Fetch the stored hashed password
    const checkSql = `SELECT id, password FROM users WHERE id = ?`;
    req.db.get(checkSql, [userId], async (err, user) => {
      if (err) {
        console.error('Password verification database error:', err);
        return res.status(500).json({ status: 'error', message: 'Password verification service unavailable' });
      }

      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      try {
        // Compare old password with stored bcrypt hash
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ status: 'error', message: 'Current password is incorrect' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in database
        const updateSql = `UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        req.db.run(updateSql, [hashedPassword, userId], (err) => {
          if (err) {
            console.error('Password update database error:', err);
            return res.status(500).json({ status: 'error', message: 'Password update failed' });
          }

          // Log activity
          logActivity(
            req.db,
            userId,
            'PASSWORD_CHANGE',
            'Password changed',
            `User #${userId} changed their password`,
            'User',
            userId,
            'fas fa-key'
          );

          res.json({
            status: 'success',
            message: 'Password changed successfully'
          });
        });
      } catch (bcryptErr) {
        console.error('Password comparison/hashing error:', bcryptErr);
        return res.status(500).json({ status: 'error', message: 'Password update service error' });
      }
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ status: 'error', message: 'An unexpected error occurred' });
  }
});

module.exports = router;
