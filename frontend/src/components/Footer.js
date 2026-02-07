import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../styles/footer.css';

const Footer = () => {
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);

  return (
    <>
      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-year">© 2026 Crime Management System</p>
          <div className="footer-divider">
            <div></div>
            <div></div>
          </div>
          <p className="footer-credit">
            Made by{' '}
            <span 
              className="developer-name"
              onClick={() => setShowDeveloperModal(true)}
            >
              Pritam Rangari
            </span>
          </p>
        </div>
      </footer>

      {/* Developer Credit Modal */}
      <Modal 
        show={showDeveloperModal} 
        onHide={() => setShowDeveloperModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton style={{ borderBottom: '1px solid #e0e0e0' }}>
          <Modal.Title style={{ color: '#0ea5e9', fontWeight: 'bold' }}>
            <i className="fas fa-user-circle me-2"></i>About Developer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '25px', textAlign: 'center' }}>
          <div style={{ marginBottom: '20px' }}>
            <i className="fas fa-code" style={{ fontSize: '3rem', color: '#0ea5e9', marginBottom: '15px', display: 'block' }}></i>
          </div>
          <h4 style={{ color: '#1a1a1a', fontWeight: 'bold', marginBottom: '10px' }}>
            Pritam Rangari
          </h4>
          <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '15px' }}>
            <i className="fas fa-briefcase me-2" style={{ color: '#0ea5e9' }}></i>
            Full Stack Developer
          </p>
          <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Passionate about creating robust and user-friendly applications. 
            This Crime Management System showcases modern web development practices.
          </p>
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '0.5rem',
            borderLeft: '4px solid #0ea5e9'
          }}>
            <p style={{ color: '#0ea5e9', fontWeight: 'bold', marginBottom: '8px' }}>
              <i className="fas fa-star me-2"></i>Skills:
            </p>
            <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>
              React • Node.js • Express • MongoDB • Database Design • API Development
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #e0e0e0', justifyContent: 'center' }}>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setShowDeveloperModal(false)}
          >
            <i className="fas fa-check me-2"></i>Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Footer;
