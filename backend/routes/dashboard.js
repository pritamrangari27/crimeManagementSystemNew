const express = require('express');
const router = express.Router();

// Get dashboard statistics
router.get('/stats', (req, res) => {
  const queries = {
    totalPolice: `SELECT COUNT(*) as count FROM police`,
    totalCriminals: `SELECT COUNT(*) as count FROM criminals`,
    totalStations: `SELECT COUNT(*) as count FROM police_station`,
    totalFIRs: `SELECT COUNT(*) as count FROM firs`,
    pendingFIRs: `SELECT COUNT(*) as count FROM firs WHERE status = 'Pending'`,
    approvedFIRs: `SELECT COUNT(*) as count FROM firs WHERE status = 'Approved'`,
    totalUsers: `SELECT COUNT(*) as count FROM users WHERE role = 'User'`
  };

  const stats = {};
  let completed = 0;
  let errors = 0;

  Object.entries(queries).forEach(([key, sql]) => {
    req.db.get(sql, [], (err, result) => {
      if (err) {
        errors++;
      } else {
        stats[key] = result.count;
      }
      completed++;

      if (completed === Object.keys(queries).length) {
        if (errors) {
          return res.status(500).json({ status: 'error', message: 'Database error' });
        }
        res.json({ status: 'success', data: stats });
      }
    });
  });
});

// Get crime statistics by type
router.get('/crimes-by-type', (req, res) => {
  const sql = `SELECT crime_type, COUNT(*) as count FROM criminals 
               GROUP BY crime_type ORDER BY count DESC`;

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows });
  });
});

// Get FIR status distribution
router.get('/fir-status', (req, res) => {
  const sql = `SELECT status, COUNT(*) as count FROM firs 
               GROUP BY status`;

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows });
  });
});

// Get crimes by location
router.get('/crimes-by-location', (req, res) => {
  const sql = `SELECT city, state, COUNT(*) as count FROM criminals 
               GROUP BY city, state ORDER BY count DESC LIMIT 10`;

  req.db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: rows });
  });
});

// Get recent activity
router.get('/activity', (req, res) => {
  const limit = req.query.limit || 10;

  // First try activity_log table
  const activityLogSql = `
    SELECT 
      al.id,
      al.action,
      al.description,
      al.icon,
      al.created_at as timestamp,
      COALESCE(u.username, 'System') as user
    FROM activity_log al
    LEFT JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC 
    LIMIT ?
  `;

  req.db.all(activityLogSql, [limit], (err, logRows) => {
    if (err) {
      console.error('Activity log error:', err);
      // Fallback to old method if no activity_log table
      return getActivityFallback(req, res, limit);
    }

    if (logRows && logRows.length > 0) {
      return res.json({ 
        status: 'success', 
        activities: logRows.map(row => ({
          action: row.action,
          description: row.description,
          icon: row.icon || 'fas fa-history',
          timestamp: formatTime(row.timestamp),
          user: row.user
        }))
      });
    }

    // Fallback if no records in activity_log
    getActivityFallback(req, res, limit);
  });
});

// Fallback activity method
function getActivityFallback(req, res, limit) {
  const sql = `
    SELECT 
      'Criminal' as type, 
      Criminal_name as name, 
      crime_type as detail, 
      created_at,
      'fas fa-user-secret' as icon
    FROM criminals 
    UNION ALL
    SELECT 
      'FIR' as type, 
      'FIR #' || id as name, 
      crime_type as detail, 
      created_at,
      'fas fa-file-alt' as icon
    FROM firs 
    UNION ALL
    SELECT 
      'Police' as type, 
      name as name, 
      station_name as detail, 
      created_at,
      'fas fa-users-cog' as icon
    FROM police 
    ORDER BY created_at DESC 
    LIMIT ?
  `;

  req.db.all(sql, [limit], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    
    const formattedRows = rows.map(row => ({
      action: `New ${row.type} Record`,
      description: `${row.name} - ${row.detail}`,
      icon: row.icon,
      timestamp: formatTime(row.created_at)
    }));
    
    res.json({ status: 'success', activities: formattedRows });
  });
}

function formatTime(dateString) {
  if (!dateString) return 'Just now';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + ' mins ago';
    if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
    if (diff < 604800) return Math.floor(diff / 86400) + ' days ago';
    
    return date.toLocaleDateString();
  } catch (e) {
    return dateString;
  }
}

module.exports = router;
