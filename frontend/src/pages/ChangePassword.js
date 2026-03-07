import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { authAPI } from '../api/client';
import { useChangePassword } from '../context/ChangePasswordContext';
import '../styles/forms.css';

const ChangePassword = () => {
  const { isOpen, closeChangePasswordModal } = useChangePassword();
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
          localStorage.removeItem('userRole');
          window.location.href = '/login';
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

  const handleClose = () => {
    if (!loading) {
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setError('');
      setSuccess('');
      closeChangePasswordModal();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050,
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'scaleIn 0.3s ease',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'white'
        }}>
          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
            <i className="fas fa-key me-2"></i>Change Password
          </h4>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: 0,
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.9rem',
              animation: 'slideInDown 0.3s ease'
            }}>
              <i className="fas fa-exclamation-circle me-2"></i>{error}
            </div>
          )}
          {success && (
            <div style={{
              background: '#dcfce7',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.9rem',
              animation: 'slideInDown 0.3s ease'
            }}>
              <i className="fas fa-check-circle me-2"></i>{success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Current Password */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                <i className="fas fa-unlock me-1" style={{ color: '#ef4444' }}></i>Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  disabled={loading}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    border: '1.5px solid #e2e8f0',
                    padding: '10px 40px 10px 12px',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
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
                    fontSize: '1rem',
                    padding: 0
                  }}
                >
                  <i className={`fas fa-eye${showPassword.current ? '' : '-slash'}`}></i>
                </button>
              </div>
            </div>

            {/* New Password */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                <i className="fas fa-lock me-1" style={{ color: '#ef4444' }}></i>New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter a strong new password"
                  disabled={loading}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    border: '1.5px solid #e2e8f0',
                    padding: '10px 40px 10px 12px',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
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
                    fontSize: '1rem',
                    padding: 0
                  }}
                >
                  <i className={`fas fa-eye${showPassword.new ? '' : '-slash'}`}></i>
                </button>
              </div>
              <small style={{ display: 'block', marginTop: '4px', color: '#64748b', fontSize: '0.75rem' }}>
                Minimum 6 characters recommended
              </small>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                <i className="fas fa-lock me-1" style={{ color: '#ef4444' }}></i>Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your new password"
                  disabled={loading}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    border: '1.5px solid #e2e8f0',
                    padding: '10px 40px 10px 12px',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
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
                    fontSize: '1rem',
                    padding: 0
                  }}
                >
                  <i className={`fas fa-eye${showPassword.confirm ? '' : '-slash'}`}></i>
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  background: loading ? '#fca5a5' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '10px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" style={{ width: '16px', height: '16px' }} />
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>Change Password
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                style={{
                  flex: 1,
                  background: '#f1f5f9',
                  border: '1.5px solid #e2e8f0',
                  color: '#0f172a',
                  borderRadius: '8px',
                  padding: '10px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: loading ? 0.6 : 1
                }}
              >
                <i className="fas fa-times me-1"></i>Cancel
              </button>
            </div>
          </form>

          {/* Security Tips */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: '8px',
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            fontSize: '0.8rem'
          }}>
            <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: '8px', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <i className="fas fa-shield-alt me-1"></i> Security Tips
            </div>
            <ul style={{ color: '#7f1d1d', margin: 0, paddingLeft: '18px', fontSize: '0.8rem' }}>
              <li>Use at least 6 characters</li>
              <li>Mix uppercase, lowercase, numbers, symbols</li>
              <li>Avoid personal information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
