import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { authAPI } from '../api/client';
import { updateAuthUser } from '../utils/authService';

const EditProfileModal = ({ show, onHide, user, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
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
      const response = await authAPI.updateProfile(formData);
      if (response.data.status === 'success') {
        updateAuthUser(formData);
        setSuccess('✓ Profile updated successfully!');
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onHide();
          setSuccess('');
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile. Please try again.');
      console.error('Update profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      setSuccess('');
      setFormData({
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || ''
      });
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="edit-profile-modal">
      <Modal.Header closeButton style={{ borderBottom: 'none' }}>
        <Modal.Title>
          <i className="fas fa-edit me-2" style={{ color: '#0ea5e9' }}></i>
          Edit Profile
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
          <Row className="g-2">
            <Col md={6} sm={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small mb-1">
                  <i className="fas fa-user me-1" style={{ color: '#0ea5e9' }}></i>
                  Username
                </Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter username"
                  style={{ borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}
                />
              </Form.Group>
            </Col>
            <Col md={6} sm={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small mb-1">
                  <i className="fas fa-envelope me-1" style={{ color: '#0ea5e9' }}></i>
                  Email
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter email"
                  style={{ borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-2">
            <Col md={6} sm={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small mb-1">
                  <i className="fas fa-phone me-1" style={{ color: '#10b981' }}></i>
                  Phone
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter phone number"
                  style={{ borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}
                />
              </Form.Group>
            </Col>
            <Col md={6} sm={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small mb-1">
                  <i className="fas fa-map-marker-alt me-1" style={{ color: '#f59e0b' }}></i>
                  Address
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter your address"
                  style={{ borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.85rem', resize: 'none' }}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-2 mt-4 pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
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
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', border: 'none', borderRadius: 8 }}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-1"></i>
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditProfileModal;
