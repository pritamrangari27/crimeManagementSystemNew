import React, { useState, useEffect, useRef } from 'react';
import { Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../api/client';
import '../styles/notifications.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationsAPI.getAll(),
        notificationsAPI.getUnreadCount()
      ]);
      if (notifRes.data.status === 'success') setNotifications(notifRes.data.data || []);
      if (countRes.data.status === 'success') setUnreadCount(countRes.data.count || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setShowAll(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.filter(n => n.is_read));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const handleNotifClick = (notif) => {
    if (!notif.is_read) handleMarkRead(notif.id);
    if (notif.entity_type === 'FIR' && notif.entity_id) {
      navigate('/fir/list', { state: { viewFIRId: notif.entity_id } });
      setOpen(false);
      setShowAll(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'workflow': return 'fas fa-project-diagram';
      case 'assignment': return 'fas fa-user-check';
      case 'fir_status': return 'fas fa-file-alt';
      case 'warning': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-bell';
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const unreadNotifs = notifications.filter(n => !n.is_read);
  const displayNotifs = showAll ? notifications : notifications.slice(0, 5);

  return (
    <div className="notification-bell-wrapper" ref={dropdownRef}>
      <button className="notification-bell-btn" onClick={() => { setOpen(!open); setShowAll(false); }}>
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <Badge bg="danger" className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</Badge>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <span>Notifications {unreadCount > 0 && <Badge bg="danger" style={{ fontSize: '0.65rem', marginLeft: 4 }}>{unreadCount} new</Badge>}</span>
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={handleMarkAllRead}>Mark all read</button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <i className="fas fa-bell-slash"></i>
                <p>No notifications</p>
              </div>
            ) : (
              <>
                {displayNotifs.map(notif => (
                  <div
                    key={notif.id}
                    className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                    onClick={() => handleNotifClick(notif)}
                  >
                    <div className="notification-icon">
                      <i className={getTypeIcon(notif.type)}></i>
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notif.title}</div>
                      <div className="notification-message">{notif.message}</div>
                      <div className="notification-time">{timeAgo(notif.created_at)}</div>
                    </div>
                    {!notif.is_read && (
                      <span className="notification-unread-dot" title="Unread"></span>
                    )}
                  </div>
                ))}
                {!showAll && notifications.length > 5 && (
                  <button
                    className="notification-view-all-btn"
                    onClick={(e) => { e.stopPropagation(); setShowAll(true); }}
                  >
                    View All ({notifications.length})
                  </button>
                )}
                {showAll && notifications.length > 5 && (
                  <button
                    className="notification-view-all-btn"
                    onClick={(e) => { e.stopPropagation(); setShowAll(false); }}
                  >
                    Show Less
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
