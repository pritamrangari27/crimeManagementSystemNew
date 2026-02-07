import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { authAPI } from '../api/client';
import '../styles/auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    role: 'User',
    station_id: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch stations when role changes to Police
  useEffect(() => {
    if (formData.role === 'Police' && stations.length === 0) {
      const fetchStations = async () => {
        try {
          setStationsLoading(true);
          const response = await fetch('http://localhost:3000/api/stations/all');
          const data = await response.json();
          if (data.status === 'success' && Array.isArray(data.data)) {
            setStations(data.data);
          }
        } catch (err) {
          console.log('Could not fetch stations:', err);
        } finally {
          setStationsLoading(false);
        }
      };
      fetchStations();
    }
  }, [formData.role, stations]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      setError('Username, email, and password are required');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.role === 'Police' && !formData.station_id) {
      setError('Please select a police station');
      return;
    }

    setLoading(true);

    try {
      console.log('Registering with data:', {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        station_id: formData.station_id
      });

      const response = await authAPI.register(
        formData.username,
        formData.password,
        formData.email,
        formData.phone,
        formData.role,
        formData.station_id
      );

      console.log('Registration response:', response.data);

      if (response.data.status === 'success') {
        alert(`Registration successful! Welcome ${formData.username}. Please login with your credentials.`);
        navigate('/login');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="auth-container">
      <Row className="justify-content-center align-items-center min-vh-100 py-5">
        <Col md={6} lg={5}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <h2 className="text-center mb-4 fw-bold">Create Account</h2>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Choose username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Register As</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                    <option value="Police">Police Officer</option>
                  </Form.Select>
                </Form.Group>

                {formData.role === 'Police' && (
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Police Station</Form.Label>
                    <Form.Select
                      name="station_id"
                      value={formData.station_id}
                      onChange={handleChange}
                      required
                      disabled={stationsLoading}
                    >
                      <option value="">{stationsLoading ? 'Loading stations...' : '-- Select Police Station --'}</option>
                      {stations.map((station) => {
                        const stationId = station.station_code || station.station_id || station.id;
                        const stationName = station.station_name;
                        return (
                          <option key={stationId} value={stationId || station.id}>
                            {stationId} - {stationName}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 fw-bold"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Form>

              <hr className="my-4" />

              <p className="text-center text-muted">
                Already have an account?{' '}
                <a href="/login" className="text-decoration-none">
                  Login here
                </a>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
