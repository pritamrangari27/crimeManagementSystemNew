const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/jwtAuth');

// ─── Get notifications for current user ───
router.get('/', verifyToken, (req, res) => {
  const sql = `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`;
  req.db.all(sql, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Database error' });
    res.json({ status: 'success', data: rows || [] });
  });
});

// ─── Get unread count ───
router.get('/unread-count', verifyToken, (req, res) => {
  const sql = `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false`;
  req.db.get(sql, [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Database error' });
    res.json({ status: 'success', count: row?.count || 0 });
  });
});

// ─── Mark single notification as read ───
router.put('/:id/read', verifyToken, (req, res) => {
  req.db.run(`UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?`,
    [req.params.id, req.user.id], function(err) {
      if (err) return res.status(500).json({ status: 'error', message: 'Database error' });
      res.json({ status: 'success' });
    });
});

// ─── Mark all as read ───
router.put('/read-all', verifyToken, (req, res) => {
  req.db.run(`UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false`,
    [req.user.id], function(err) {
      if (err) return res.status(500).json({ status: 'error', message: 'Database error' });
      res.json({ status: 'success', updated: this.changes });
    });
});

// ─── Helper: create a notification (used by other routes) ───
function createNotification(db, userId, title, message, type = 'info', entityType = null, entityId = null) {
  return new Promise((resolve) => {
    db.run(
      `INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, title, message, type, entityType, entityId],
      function(err) {
        if (err) console.error('Notification error:', err.message);
        resolve(this?.lastID);
      }
    );
  });
}

// Notify multiple users
function notifyUsers(db, userIds, title, message, type = 'info', entityType = null, entityId = null) {
  return Promise.all(userIds.map(uid => createNotification(db, uid, title, message, type, entityType, entityId)));
}

module.exports = { router, createNotification, notifyUsers };
