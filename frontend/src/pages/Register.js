import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { authAPI } from '../api/client';
import '../styles/auth-modern.css';

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
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-card-title">Create Account</h1>
            <p className="auth-card-subtitle">Join our crime management system</p>
          </div>
          <div className="auth-card-body" style={{ padding: '2rem 1.5rem' }}>

            {error && (
              <Alert variant="danger" className="mb-3" style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: '0.5rem'
              }}>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold" style={{ color: '#1a1a1a' }}>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Choose username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    style={{
                      borderColor: '#0ea5e9',
                      borderWidth: '2px',
                      backgroundColor: '#ffffff',
                      color: '#1a1a1a',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1rem'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0284c7';
                      e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#0ea5e9';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold" style={{ color: '#1a1a1a' }}>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      borderColor: '#0ea5e9',
                      borderWidth: '2px',
                      backgroundColor: '#ffffff',
                      color: '#1a1a1a',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1rem'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0284c7';
                      e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#0ea5e9';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold" style={{ color: '#1a1a1a' }}>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      borderColor: '#0ea5e9',
                      borderWidth: '2px',
                      backgroundColor: '#ffffff',
                      color: '#1a1a1a',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1rem'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0284c7';
                      e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#0ea5e9';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold" style={{ color: '#1a1a1a' }}>Register As</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    style={{
                      borderColor: '#0ea5e9',
                      borderWidth: '2px',
                      backgroundColor: '#ffffff',
                      color: '#1a1a1a',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1rem'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0284c7';
                      e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#0ea5e9';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                    <option value="Police">Police Officer</option>
                  </Form.Select>
                </Form.Group>

                {formData.role === 'Police' && (
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold" style={{ color: '#1a1a1a' }}>Police Station</Form.Label>
                    <Form.Select
                      name="station_id"
                      value={formData.station_id}
                      onChange={handleChange}
                      required
                      disabled={stationsLoading}
                      style={{
                        borderColor: '#0ea5e9',
                        borderWidth: '2px',
                        backgroundColor: '#ffffff',
                        color: '#1a1a1a',
                        borderRadius: '0.5rem',
                        padding: '0.75rem 1rem'
                      }}
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
                  <Form.Label className="fw-bold" style={{ color: '#1a1a1a' }}>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{
                      borderColor: '#0ea5e9',
                      borderWidth: '2px',
                      backgroundColor: '#ffffff',
                      color: '#1a1a1a',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1rem'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0284c7';
                      e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#0ea5e9';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold" style={{ color: '#1a1a1a' }}>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{
                      borderColor: '#0ea5e9',
                      borderWidth: '2px',
                      backgroundColor: '#ffffff',
                      color: '#1a1a1a',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1rem'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0284c7';
                      e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#0ea5e9';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 fw-bold"
                  disabled={loading}
                  style={{
                    backgroundColor: '#0ea5e9',
                    borderColor: '#0ea5e9',
                    color: '#ffffff',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#0284c7';
                    e.target.style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.2)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#0ea5e9';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Form>

              <hr style={{ color: '#e5e7eb', margin: '1.5rem 0' }} />

              <p style={{ textAlign: 'center', color: '#666666', fontSize: '0.95rem' }}>
                Already have an account?{' '}
                <a href="/login" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: '600' }}>
                  Login here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Register;
