import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
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

  // Verify user is logged in
  useEffect(() => {
    if (!user || !role) {
      navigate('/login');
    }
  }, [user, role, navigate]);

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
      const response = await fetch(`http://localhost:3000/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();
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
      setError('Error changing password');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !role) {
    return null;
  }

  return (
    <div className="d-flex">
      <Sidebar userRole={role} />
      <Container fluid className="main-content py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="fw-bold">
                  <i className="fas fa-lock me-2"></i> Change Password
                </h2>
                <p className="text-muted">Update your account password</p>
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
                    <Form.Control
                      type="password"
                      name="currentPassword"
                      placeholder="Enter your current password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      New Password *
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="newPassword"
                      placeholder="Enter new password (min 6 characters)"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                    />
                    <Form.Text className="text-muted">
                      Minimum 6 characters
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      Confirm Password *
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
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

            <Card className="border-0 shadow-sm mt-4">
              <Card.Header className="bg-info text-white fw-bold">
                <i className="fas fa-lightbulb me-2"></i> Password Tips
              </Card.Header>
              <Card.Body className="small">
                <ul className="mb-0">
                  <li>Use a strong password with mixed characters</li>
                  <li>Avoid using easily guessable information</li>
                  <li>Don't reuse passwords from other accounts</li>
                  <li>Change your password regularly for security</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ChangePassword;
