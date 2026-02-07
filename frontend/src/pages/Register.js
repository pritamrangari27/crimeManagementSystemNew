import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="auth-page-title">
        <h1>Crime Management System</h1>
        <p className="auth-page-subtitle">Create Your Account</p>
      </div>

      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Register</h2>
            <p className="auth-card-subtitle">Join our crime management system</p>
          </div>
          <div className="auth-card-body">

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    placeholder="Choose username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Register As</label>
                  <select
                    className="form-select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                    <option value="Police">Police Officer</option>
                  </select>
                </div>

                {formData.role === 'Police' && (
                  <div className="form-group">
                    <label className="form-label">Police Station</label>
                    <select
                      className="form-select"
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
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
            </form>

            <div className="form-footer">
              <p>Already have an account?</p>
              <button
                type="button"
                className="btn-register-link"
                onClick={() => window.location.href = '/login'}
              >
                🔑 Login here
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="auth-footer">
        <div className="auth-footer-content">
          <p className="auth-footer-text">Crime Management System © 2026</p>
          <p className="auth-footer-credit">Made by <span className="developer-name">Pritam Rangari</span></p>
        </div>
      </footer>
    </div>
  );
};

export default Register;
