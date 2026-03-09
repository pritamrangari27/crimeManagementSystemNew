import React, { useState } from 'react';
import '../styles/footer.css';

const DeveloperPopup = ({ show, onClose, userMode = false, user = null }) => {
  if (!show) return null;

  // Get user initials for fallback avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Determine if we're showing user profile or developer info
  const isUserProfile = userMode && user;

  if (isUserProfile) {
    return (
      <div className="dev-popup-overlay" onClick={onClose}>
        <div className="dev-popup-card" onClick={e => e.stopPropagation()}>
          <button className="dev-popup-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
          <div className="dev-popup-header">
            <div className="dev-popup-avatar" style={{ background: '#10b981', fontSize: '28px' }}>
              {getInitials(user.username)}
            </div>
            <h4 className="dev-popup-name">{user.username}</h4>
            <p className="dev-popup-role">{user.role || 'User'}</p>
          </div>
          <div className="dev-popup-body">
            <div className="dev-popup-item">
              <i className="fas fa-envelope"></i>
              <span>{user.email || 'N/A'}</span>
            </div>
            <div className="dev-popup-item">
              <i className="fas fa-phone"></i>
              <span>{user.phone || 'N/A'}</span>
            </div>
            {user.address && (
              <div className="dev-popup-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>{user.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Original developer info
  return (
    <div className="dev-popup-overlay" onClick={onClose}>
      <div className="dev-popup-card" onClick={e => e.stopPropagation()}>
        <button className="dev-popup-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        <div className="dev-popup-header">
          <div className="dev-popup-avatar">
            <i className="fas fa-code"></i>
          </div>
          <h4 className="dev-popup-name">Pritam Rangari</h4>
          <p className="dev-popup-role">Full Stack Developer</p>
        </div>
        <div className="dev-popup-body">
          <div className="dev-popup-item">
            <i className="fas fa-envelope"></i>
            <span>pritamrangari123</span>
          </div>
          <div className="dev-popup-item">
            <i className="fas fa-phone"></i>
            <span>8767531150</span>
          </div>
          <div className="dev-popup-item">
            <i className="fab fa-github"></i>
            <a href="https://github.com/pritamrangari27" target="_blank" rel="noopener noreferrer">pritamrangari27</a>
          </div>
          <div className="dev-popup-item">
            <i className="fab fa-linkedin"></i>
            <a href="https://linkedin.com/in/pritamrangari" target="_blank" rel="noopener noreferrer">pritamrangari</a>
          </div>
          <div className="dev-popup-item">
            <i className="fas fa-globe"></i>
            <a href="https://pritamrangari.me" target="_blank" rel="noopener noreferrer">pritamrangari.me</a>
          </div>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-year">
            © 2026 Crime Management System
          </p>
          <p className="footer-credit">
            Made by{' '}
            <button
              type="button"
              className="developer-name-btn"
              onClick={() => setShowPopup(true)}
            >
              Pritam Rangari
            </button>
          </p>
        </div>
      </footer>
      <DeveloperPopup show={showPopup} onClose={() => setShowPopup(false)} />
    </>
  );
};

export { DeveloperPopup };
export default Footer;
