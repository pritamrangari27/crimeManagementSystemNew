import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { authAPI } from '../api/client';

const ChangePasswordModal = ({ show, onHide }) => {
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.oldPassword) {
      setError('Current password is required');
      return false;
    }
    if (!formData.newPassword) {
      setError('New password is required');
      return false;
    }
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.oldPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    try {
      const response = await authAPI.changePassword(formData.oldPassword, formData.newPassword);
      
      if (response.data.status === 'success') {
        setSuccess('✓ Password changed successfully!');
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          onHide();
          setSuccess('');
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to change password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error changing password. Please try again.');
      console.error('Change password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setError('');
      setSuccess('');
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="change-password-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-key me-2" style={{ color: '#ef4444' }}></i>
          Change Password
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3" style={{ fontSize: '0.85rem' }}>
            <i className="fas fa-exclamation-circle me-2"></i>{error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-3" style={{ fontSize: '0.85rem' }}>
            <i className="fas fa-check-circle me-2"></i>{success}
          </Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small mb-1">
              <i className="fas fa-lock me-1" style={{ color: '#0ea5e9' }}></i>
              Current Password
            </Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPasswords.old ? 'text' : 'password'}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                disabled={loading}
                style={{ borderRadius: 8, border: '1.5px solid #e2e8f0', paddingRight: '36px' }}
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                style={{ fontSize: '0.8rem', color: '#0ea5e9', border: 'none' }}
              >
                <i className={`fas fa-${showPasswords.old ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small mb-1">
              <i className="fas fa-lock-open me-1" style={{ color: '#10b981' }}></i>
              New Password
            </Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter a new password (min 6 characters)"
                disabled={loading}
                style={{ borderRadius: 8, border: '1.5px solid #e2e8f0', paddingRight: '36px' }}
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                style={{ fontSize: '0.8rem', color: '#10b981', border: 'none' }}
              >
                <i className={`fas fa-${showPasswords.new ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small mb-1">
              <i className="fas fa-check me-1" style={{ color: '#f59e0b' }}></i>
              Confirm New Password
            </Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                disabled={loading}
                style={{ borderRadius: 8, border: '1.5px solid #e2e8f0', paddingRight: '36px' }}
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                style={{ fontSize: '0.8rem', color: '#f59e0b', border: 'none' }}
              >
                <i className={`fas fa-${showPasswords.confirm ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
          </Form.Group>

          <div className="d-flex gap-2 mt-4">
            <Button
              type="button"
              variant="outline-secondary"
              className="fw-bold flex-grow-1"
              onClick={handleClose}
              disabled={loading}
              style={{ borderRadius: 8 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="fw-bold flex-grow-1"
              disabled={loading}
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', borderRadius: 8 }}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-1"></i>
                  Update Password
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ChangePasswordModal;
