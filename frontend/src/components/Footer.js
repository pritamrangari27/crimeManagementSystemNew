import React from 'react';
import '../styles/footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-year">© 2026 Crime Management System</p>
        <div className="footer-divider">
          <div></div>
          <div></div>
        </div>
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
