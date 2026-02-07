import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/forms.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const role = localStorage.getItem('userRole');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
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
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:5000/api/auth/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...formData
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        // Update localStorage
        localStorage.setItem('authUser', JSON.stringify({
          ...user,
          ...formData
        }));
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    return (user?.username || 'U')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!user || role !== 'User') {
    return null;
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <Container fluid className="main-content py-5 px-4" style={{ background: '#ffffff' }}>
        {/* Header */}
        <Row className="mb-5">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="fw-bold mb-2" style={{ color: '#1a1a1a' }}>
                  <i className="fas fa-user-circle me-3" style={{ color: '#0ea5e9' }}></i> My Profile
                </h1>
                <p className="text-muted fs-5">Manage your account settings and personal information</p>
              </div>
              <Button 
                variant="outline-secondary" 
                size="lg" 
                onClick={() => navigate(-1)}
                className="fw-bold"
              >
                <i className="fas fa-arrow-left me-2"></i>Back
              </Button>
            </div>
          </Col>
        </Row>

        {/* Profile Header Card */}
        <Card 
          className="border-0 shadow-lg mb-5 overflow-hidden"
          style={{
            background: '#0ea5e9',
          }}
        >
          <Card.Body className="p-5 text-white">
            <Row className="align-items-center">
              <Col md={2} className="text-center mb-4 mb-md-0">
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    fontSize: '48px',
                    fontWeight: 'bold',
                    border: '4px solid white'
                  }}
                >
                  {getInitials()}
                </div>
              </Col>
              <Col md={10}>
                <h2 className="fw-bold mb-2">{user?.username}</h2>
                <p className="mb-3 fs-6">
                  <i className="fas fa-envelope me-2"></i> {user?.email}
                </p>
                <div className="d-flex gap-3 flex-wrap">
                  <Badge bg="light" text="dark" className="p-2 fs-6">
                    <i className="fas fa-user me-2"></i> Active User
                  </Badge>
                  <Badge bg="success" text="dark" className="p-2 fs-6">
                    <i className="fas fa-check-circle me-2"></i> Verified
                  </Badge>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
        {success && <Alert variant="success" className="mb-4">{success}</Alert>}

        {/* Combined Profile Information & Settings Table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <Card.Header className="fw-bold text-white p-4" style={{ backgroundColor: '#0ea5e9' }}>
            <i className="fas fa-user-circle me-2"></i> Profile Information
          </Card.Header>
          <Card.Body className="p-0">
            {isEditing ? (
              <div className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold mb-2">
                      <i className="fas fa-user me-2" style={{ color: '#0ea5e9' }}></i>Username
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="border-2"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold mb-2">
                      <i className="fas fa-envelope me-2" style={{ color: '#0ea5e9' }}></i>Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="border-2"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold mb-2">
                      <i className="fas fa-phone me-2" style={{ color: '#0ea5e9' }}></i>Phone Number
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className="border-2"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold mb-2">
                      <i className="fas fa-map-marker-alt me-2" style={{ color: '#0ea5e9' }}></i>Address
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      className="border-2"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </Form.Group>

                  <div className="d-flex gap-2 pt-3">
                    <Button
                      style={{ background: '#0ea5e9', border: 'none' }}
                      type="submit"
                      disabled={loading}
                      className="fw-bold"
                    >
                      {loading ? <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </> : <>
                        <i className="fas fa-save me-2"></i> Save Changes
                      </>}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          username: user?.username || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                          address: user?.address || ''
                        });
                      }}
                      className="fw-bold"
                    >
                      <i className="fas fa-times me-2"></i> Cancel
                    </Button>
                  </div>
                </Form>
              </div>
            ) : (
              <div>
                <div className="p-4 border-bottom">
                  <h6 className="fw-bold mb-3">Personal Information</h6>
                  <Table borderless responsive className="mb-0">
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ width: '35%', paddingBottom: '12px' }}>
                          <span className="text-muted fw-bold small">
                            <i className="fas fa-user me-2" style={{ color: '#0ea5e9' }}></i>Username
                          </span>
                        </td>
                        <td style={{ paddingBottom: '12px' }}>
                          <span className="fw-bold">{user.username}</span>
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                          <span className="text-muted fw-bold small">
                            <i className="fas fa-envelope me-2" style={{ color: '#0ea5e9' }}></i>Email
                          </span>
                        </td>
                        <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                          <span className="fw-bold">{user.email}</span>
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                          <span className="text-muted fw-bold small">
                            <i className="fas fa-phone me-2" style={{ color: '#0ea5e9' }}></i>Phone Number
                          </span>
                        </td>
                        <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                          <span className="fw-bold">{user.phone || <span className="text-muted">Not provided</span>}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: '8px', verticalAlign: 'top' }}>
                          <span className="text-muted fw-bold small">
                            <i className="fas fa-map-marker-alt me-2" style={{ color: '#0ea5e9' }}></i>Address
                          </span>
                        </td>
                        <td style={{ paddingTop: '8px' }}>
                          <span className="fw-bold">{user.address || <span className="text-muted">Not provided</span>}</span>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>

                <div className="p-4 border-bottom">
                  <h6 className="fw-bold mb-3">Account Status</h6>
                  <Table borderless responsive className="mb-0">
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ width: '35%', paddingBottom: '12px' }}>
                          <span className="text-muted fw-bold small">
                            <i className="fas fa-check-circle me-2" style={{ color: '#10b981' }}></i>Status
                          </span>
                        </td>
                        <td style={{ paddingBottom: '12px' }}>
                          <Badge bg="success" className="p-2">
                            <i className="fas fa-check-circle me-1"></i> Active
                          </Badge>
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                          <span className="text-muted fw-bold small">
                            <i className="fas fa-user-tag me-2" style={{ color: '#0ea5e9' }}></i>Account Type
                          </span>
                        </td>
                        <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                          <span className="fw-bold">Regular User</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: '8px' }}>
                          <span className="text-muted fw-bold small">
                            <i className="fas fa-calendar-check me-2" style={{ color: '#0ea5e9' }}></i>Member Since
                          </span>
                        </td>
                        <td style={{ paddingTop: '8px' }}>
                          <span className="fw-bold">
                            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>

                <div className="p-4">
                  <h6 className="fw-bold mb-3">Security</h6>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      style={{ background: '#0ea5e9', border: 'none' }}
                      onClick={() => setIsEditing(true)}
                      className="fw-bold"
                    >
                      <i className="fas fa-edit me-2"></i> Edit Profile
                    </Button>
                    <Button
                      size="sm"
                      style={{ background: '#ef4444', border: 'none' }}
                      onClick={() => navigate('/change-password')}
                      className="fw-bold"
                    >
                      <i className="fas fa-key me-2"></i> Change Password
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default UserProfile;
