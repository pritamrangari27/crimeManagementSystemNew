import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/forms.css';

const PoliceProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const stationId = user?.station_id;
  const role = localStorage.getItem('userRole');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    badge_number: user?.badge_number || ''
  });

  // Verify user is Police role
  useEffect(() => {
    if (role !== 'Police') {
      navigate('/login');
    }
  }, [role, navigate]);

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
      const response = await fetch(`http://localhost:3000/api/auth/update-profile`, {
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

  if (role !== 'Police') {
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
                  <i className="fas fa-user-circle me-2"></i> My Profile
                </h2>
                <p className="text-muted">View and manage your police officer profile</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left me-2"></i>Back
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={8}>
            {/* Officer Information */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-primary text-white fw-bold">
                <i className="fas fa-user me-2"></i> Officer Information
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                {isEditing ? (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Badge Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="badge_number"
                        value={formData.badge_number}
                        onChange={handleChange}
                        disabled
                      />
                      <Form.Text className="text-muted">Badge number cannot be changed</Form.Text>
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <Button
                        variant="primary"
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
                        variant="secondary"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            username: user?.username || '',
                            email: user?.email || '',
                            phone: user?.phone || '',
                            badge_number: user?.badge_number || ''
                          });
                        }}
                        className="fw-bold"
                      >
                        <i className="fas fa-times me-2"></i> Cancel
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <div>
                    <Row className="mb-4">
                      <Col md={6}>
                        <h6 className="text-muted small fw-bold">Name</h6>
                        <p className="fw-bold">{user.username}</p>
                      </Col>
                      <Col md={6}>
                        <h6 className="text-muted small fw-bold">Badge Number</h6>
                        <p className="fw-bold">{user.badge_number || 'N/A'}</p>
                      </Col>
                    </Row>
                    <Row className="mb-4">
                      <Col md={6}>
                        <h6 className="text-muted small fw-bold">Email</h6>
                        <p className="fw-bold">{user.email}</p>
                      </Col>
                      <Col md={6}>
                        <h6 className="text-muted small fw-bold">Phone</h6>
                        <p className="fw-bold">{user.phone || 'Not provided'}</p>
                      </Col>
                    </Row>
                    <Button
                      variant="primary"
                      onClick={() => setIsEditing(true)}
                      className="fw-bold"
                    >
                      <i className="fas fa-edit me-2"></i> Edit Profile
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Station Assignment */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-success text-white fw-bold">
                <i className="fas fa-building me-2"></i> Station Assignment
              </Card.Header>
              <Card.Body>
                <div className="mb-0">
                  <h6 className="text-muted small fw-bold">Assigned Station</h6>
                  <p className="fw-bold">{stationId || 'Not assigned'}</p>
                </div>
              </Card.Body>
            </Card>

            {/* Security */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-info text-white fw-bold">
                <i className="fas fa-lock me-2"></i> Security
              </Card.Header>
              <Card.Body>
                <Button
                  variant="outline-primary"
                  onClick={() => navigate('/change-password')}
                  className="fw-bold"
                >
                  <i className="fas fa-key me-2"></i> Change Password
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PoliceProfile;
