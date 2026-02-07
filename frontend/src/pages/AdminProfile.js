import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/forms.css';

const AdminProfile = () => {
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
    department: user?.department || ''
  });

  // Verify user is Admin role
  useEffect(() => {
    if (role !== 'Admin') {
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

  if (role !== 'Admin') {
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
                  <i className="fas fa-user-circle me-2"></i> Admin Profile
                </h2>
                <p className="text-muted">Manage your administrator account settings</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left me-2"></i>Back
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-primary text-white fw-bold">
                <i className="fas fa-user me-2"></i> Account Information
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                {isEditing ? (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Username</Form.Label>
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
                      <Form.Label className="fw-bold">Department</Form.Label>
                      <Form.Control
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g., Crime Management Division"
                      />
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
                            department: user?.department || ''
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
                    <div className="mb-4">
                      <h6 className="text-muted small fw-bold">Username</h6>
                      <p className="fw-bold">{user.username}</p>
                    </div>
                    <div className="mb-4">
                      <h6 className="text-muted small fw-bold">Email</h6>
                      <p className="fw-bold">{user.email}</p>
                    </div>
                    <div className="mb-4">
                      <h6 className="text-muted small fw-bold">Phone</h6>
                      <p className="fw-bold">{user.phone || 'Not provided'}</p>
                    </div>
                    <div className="mb-4">
                      <h6 className="text-muted small fw-bold">Department</h6>
                      <p className="fw-bold">{user.department || 'Not specified'}</p>
                    </div>
                    <div className="mb-4">
                      <h6 className="text-muted small fw-bold">Role</h6>
                      <p className="fw-bold">
                        <span className="badge bg-danger">Administrator</span>
                      </p>
                    </div>
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

            <Card className="border-0 shadow-sm mt-4">
              <Card.Header className="bg-warning text-dark fw-bold">
                <i className="fas fa-shield-alt me-2"></i> Permissions
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <p className="text-muted mb-3">As an Administrator, you have full access to:</p>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <strong>Manage Criminals:</strong> Add, edit, and delete criminal records
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <strong>Manage Police:</strong> Add, edit, and delete police officers
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <strong>Manage Stations:</strong> Add, edit, and delete police stations
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <strong>FIR Management:</strong> Review, approve, and reject FIRs
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <strong>View Dashboard:</strong> Access comprehensive crime analytics
                    </li>
                  </ul>
                </div>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mt-4">
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

export default AdminProfile;
