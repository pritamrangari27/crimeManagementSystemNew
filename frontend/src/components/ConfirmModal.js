import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

const ConfirmModal = ({
  show,
  onHide,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon = 'fas fa-exclamation-triangle',
  loading = false
}) => {
  const colorMap = {
    danger: { bg: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
    success: { bg: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    warning: { bg: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    info: { bg: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
    primary: { bg: '#0ea5e9', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' },
  };
  const colors = colorMap[variant] || colorMap.danger;

  return (
    <Modal show={show} onHide={onHide} centered size="sm" className="confirm-modal">
      <Modal.Body className="text-center p-3" style={{ padding: '16px 20px' }}>
        <div
          style={{
            width: 48, height: 48, borderRadius: '50%',
            background: `${colors.bg}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', color: colors.bg, fontSize: '1.2rem',
            animation: 'scaleIn 0.3s cubic-bezier(.34,1.56,.64,1) both',
          }}
        >
          <i className={icon}></i>
        </div>
        <h5 style={{ fontWeight: 700, color: '#0f172a', marginBottom: 6, fontSize: '0.95rem' }}>{title}</h5>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 14, lineHeight: 1.4 }}>{message}</p>
        <div className="d-flex gap-2 justify-content-center" style={{ gap: '8px' }}>
          <Button
            variant="outline-secondary" size="sm"
            onClick={onHide} disabled={loading}
            style={{ borderRadius: 8, padding: '6px 20px', fontWeight: 600, fontSize: '0.85rem' }}
          >
            {cancelText}
          </Button>
          <Button
            size="sm" onClick={onConfirm} disabled={loading}
            style={{
              background: colors.gradient, border: 'none',
              borderRadius: 8, padding: '6px 20px', fontWeight: 600, fontSize: '0.85rem',
              minWidth: 90,
            }}
          >
            {loading ? <Spinner animation="border" size="sm" /> : confirmText}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmModal;
