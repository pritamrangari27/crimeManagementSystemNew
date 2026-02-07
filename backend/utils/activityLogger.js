// Utility function to log activities
function logActivity(db, userId, activityType, action, description, entityType, entityId, icon) {
  const sql = `
    INSERT INTO activity_log (user_id, activity_type, action, description, entity_type, entity_id, icon, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  db.run(sql, [userId, activityType, action, description, entityType, entityId, icon], (err) => {
    if (err) {
      console.error('Activity log error:', err);
    }
  });
}

module.exports = { logActivity };
