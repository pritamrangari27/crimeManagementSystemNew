import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { authAPI } from '../api/client';
import '../styles/forms.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const role = localStorage.getItem('userRole');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const togglePassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.currentPassword) {
      setError('Please enter your current password');
      return;
    }
    if (!formData.newPassword) {
      setError('Please enter a new password');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      const data = response.data;
      if (data.status === 'success') {
        setSuccess('Password changed successfully!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Redirect after 2 seconds
        setTimeout(() => {
          if (role === 'Admin') {
            navigate('/admin/dashboard');
          } else if (role === 'Police') {
            navigate('/police/dashboard');
          } else {
            navigate('/user/dashboard');
          }
        }, 2000);
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !role) {
    return null;
  }

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
      <Container fluid className="mgmt-container">
        <Row className="mb-2">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="fw-bold" style={{ fontSize: '1.4rem' }}>
                  <i className="fas fa-lock me-2"></i> Change Password
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Update your account password</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left me-2"></i>Back
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={6}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-primary text-white fw-bold">
                <i className="fas fa-key me-2"></i> Password Update
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      Current Password *
                    </Form.Label>
                    <div className="password-wrapper">
                      <Form.Control
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        placeholder="Enter your current password"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                      />
                      <button type="button" className="password-toggle" onClick={() => togglePassword('current')} tabIndex={-1}>
                        <i className={`fas ${showPasswords.current ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      New Password *
                    </Form.Label>
                    <div className="password-wrapper">
                      <Form.Control
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        placeholder="Enter new password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                      />
                      <button type="button" className="password-toggle" onClick={() => togglePassword('new')} tabIndex={-1}>
                        <i className={`fas ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      Confirm Password *
                    </Form.Label>
                    <div className="password-wrapper">
                      <Form.Control
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm your new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <button type="button" className="password-toggle" onClick={() => togglePassword('confirm')} tabIndex={-1}>
                        <i className={`fas ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                      size="lg"
                      className="fw-bold"
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check me-2"></i> Change Password
                        </>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      type="reset"
                      size="lg"
                      className="fw-bold"
                      onClick={() => {
                        setFormData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setError('');
                        setSuccess('');
                      }}
                    >
                      <i className="fas fa-redo me-2"></i> Clear
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      </div>
      <Footer />
    </>
  );
};

export default ChangePassword;
