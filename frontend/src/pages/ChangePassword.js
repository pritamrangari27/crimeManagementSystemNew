import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Card, Form, Alert, Spinner } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import { authAPI } from '../api/client';
import { getCurrentUser, getUserRole } from '../utils/authService';
import '../styles/forms.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const role = getUserRole();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!user || !role) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setError('Current password is required');
      return false;
    }
    if (!formData.newPassword) {
      setError('New password is required');
      return false;
    }
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match');
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authAPI.changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      if (response.data.status === 'success') {
        setSuccess('Password changed successfully! Redirecting to login...');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
        <Container fluid className="mgmt-container" style={{ background: '#ffffff', maxWidth: '600px', margin: '0 auto' }}>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 gap-2" style={{ animation: 'fadeIn 0.35s cubic-bezier(.4,0,.2,1) both' }}>
            <div>
              <h2 className="fw-bold mb-0" style={{ color: '#1a1a1a', fontSize: '1.3rem' }}>
                <i className="fas fa-key me-2" style={{ color: '#ef4444' }}></i>Change Password
              </h2>
              <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>Update your account password securely</p>
            </div>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)} className="fw-bold">
              <i className="fas fa-arrow-left me-1"></i>Back
            </Button>
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3" style={{ animation: 'fadeInDown 0.3s ease both' }}>
              <i className="fas fa-exclamation-circle me-2"></i>{error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-3" style={{ animation: 'fadeInDown 0.3s ease both' }}>
              <i className="fas fa-check-circle me-2"></i>{success}
            </Alert>
          )}

          {/* Password Change Card */}
          <Card className="border-0 overflow-hidden" style={{ borderRadius: '16px', boxShadow: '0 4px 24px rgba(239,68,68,0.10)', animation: 'fadeInUp 0.45s cubic-bezier(.4,0,.2,1) both' }}>
            {/* Header Banner */}
            <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)', padding: '28px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              <h4 className="text-white fw-bold mb-0" style={{ position: 'relative', zIndex: 1, fontSize: '1.1rem' }}>
                <i className="fas fa-lock me-2"></i>Secure Password Update
              </h4>
            </div>

            {/* Form Body */}
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                {/* Current Password */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                    <i className="fas fa-unlock me-1" style={{ color: '#ef4444' }}></i>Current Password
                  </Form.Label>
                  <div style={{ position: 'relative' }}>
                    <Form.Control
                      type={showPassword.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter your current password"
                      disabled={loading}
                      style={{
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        paddingRight: '40px',
                        fontSize: '0.95rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      <i className={`fas fa-eye${showPassword.current ? '' : '-slash'}`}></i>
                    </button>
                  </div>
                  <small className="d-block mt-1" style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    For security, enter your current password to verify
                  </small>
                </Form.Group>

                {/* New Password */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                    <i className="fas fa-lock me-1" style={{ color: '#ef4444' }}></i>New Password
                  </Form.Label>
                  <div style={{ position: 'relative' }}>
                    <Form.Control
                      type={showPassword.new ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter a strong new password"
                      disabled={loading}
                      style={{
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        paddingRight: '40px',
                        fontSize: '0.95rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      <i className={`fas fa-eye${showPassword.new ? '' : '-slash'}`}></i>
                    </button>
                  </div>
                  <small className="d-block mt-1" style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    Minimum 6 characters. Use mix of uppercase, lowercase, numbers, and symbols
                  </small>
                </Form.Group>

                {/* Confirm Password */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                    <i className="fas fa-lock me-1" style={{ color: '#ef4444' }}></i>Confirm New Password
                  </Form.Label>
                  <div style={{ position: 'relative' }}>
                    <Form.Control
                      type={showPassword.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your new password"
                      disabled={loading}
                      style={{
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        paddingRight: '40px',
                        fontSize: '0.95rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      <i className={`fas fa-eye${showPassword.confirm ? '' : '-slash'}`}></i>
                    </button>
                  </div>
                </Form.Group>

                {/* Action Buttons */}
                <div className="d-flex gap-2 pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="fw-bold px-4"
                    style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.95rem'
                    }}
                  >
                    {loading ? (
                      <><Spinner animation="border" size="sm" className="me-2" /> Updating...</>
                    ) : (
                      <><i className="fas fa-save me-2"></i>Change Password</>
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                    className="fw-bold px-4"
                    style={{ borderRadius: '10px', fontSize: '0.95rem' }}
                  >
                    <i className="fas fa-times me-1"></i>Cancel
                  </Button>
                </div>
              </Form>

              {/* Security Tips */}
              <div style={{ marginTop: '24px', padding: '12px 14px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fee2e2' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#991b1b', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  <i className="fas fa-shield-alt me-1"></i> Password Security Tips
                </div>
                <ul style={{ fontSize: '0.8rem', color: '#7f1d1d', margin: 0, paddingLeft: '18px' }}>
                  <li>Use at least 6 characters</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Add numbers and special symbols (!@#$%)</li>
                  <li>Avoid using personal information</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </>
  );
};

export default ChangePassword;
