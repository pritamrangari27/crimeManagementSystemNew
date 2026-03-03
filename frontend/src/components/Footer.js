import React from 'react';
import '../styles/footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-year">
          <i className="fas fa-shield-alt me-1"></i>
          © 2026 Crime Management System
        </p>
        <p className="footer-credit">
          Made by{' '}
          <a 
            href="https://pritamrangari.me" 
            target="_blank" 
            rel="noopener noreferrer"
            className="developer-name"
          >
            Pritam Rangari
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
