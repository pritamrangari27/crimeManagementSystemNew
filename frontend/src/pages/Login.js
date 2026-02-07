import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import '../styles/auth-professional.css';

const Login = () => {
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [stations, setStations] = useState([]);

  // Admin State
  const [adminData, setAdminData] = useState({ username: '', password: '' });

  // User State
  const [userData, setUserData] = useState({ username: '', password: '' });
  const [userRegisterMode, setUserRegisterMode] = useState(false);
  const [userRegisterForm, setUserRegisterForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Police State
  const [policeData, setPoliceData] = useState({
    username: '',
    password: '',
    station_id: ''
  });
  const [policeRegisterMode, setPoliceRegisterMode] = useState(false);
  const [policeRegisterForm, setPoliceRegisterForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    station_id: ''
  });

  // Fetch stations on mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setStationsLoading(true);
        const response = await fetch('http://localhost:3000/api/stations/all');
        const data = await response.json();
        if (data.status === 'success' && Array.isArray(data.data)) {
          setStations(data.data);
        }
      } catch (err) {
        console.error('Station fetch error:', err);
        setStations([]);
      } finally {
        setStationsLoading(false);
      }
    };
    fetchStations();
  }, []);

  // Handle Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!adminData.username || !adminData.password) {
        throw new Error('Username and password are required');
      }

      const response = await authAPI.login(adminData.username, adminData.password, 'Admin');
      if (response.data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token || '');
        localStorage.setItem('role', 'Admin');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle User Login
  const handleUserLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!userData.username || !userData.password) {
        throw new Error('Username and password are required');
      }

      const response = await authAPI.login(userData.username, userData.password, 'User');
      if (response.data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token || '');
        localStorage.setItem('role', 'User');
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle User Registration
  const handleUserRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!userRegisterForm.username || !userRegisterForm.email || !userRegisterForm.password) {
      setError('All fields are required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userRegisterForm.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (userRegisterForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (userRegisterForm.password !== userRegisterForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.userRegister(
        userRegisterForm.username,
        userRegisterForm.password,
        userRegisterForm.email,
        userRegisterForm.phone
      );

      if (response.data.status === 'success') {
        setError('');
        setUserRegisterMode(false);
        setUserRegisterForm({
          username: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });
        setUserData({ username: '', password: '' });
        alert('Registration successful! Please log in with your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Police Login
  const handlePoliceLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!policeData.username || !policeData.password || !policeData.station_id) {
        throw new Error('Please fill in all required fields');
      }

      const response = await authAPI.login(policeData.username, policeData.password, 'Police');
      if (response.data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token || '');
        localStorage.setItem('role', 'Police');
        localStorage.setItem('station_id', policeData.station_id);
        navigate('/police/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Police Registration
  const handlePoliceRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!policeRegisterForm.username || !policeRegisterForm.email || !policeRegisterForm.password || !policeRegisterForm.station_id) {
      setError('All fields are required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(policeRegisterForm.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (policeRegisterForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (policeRegisterForm.password !== policeRegisterForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.policeRegister(
        policeRegisterForm.username,
        policeRegisterForm.password,
        policeRegisterForm.email,
        policeRegisterForm.phone,
        policeRegisterForm.station_id
      );

      if (response.data.status === 'success') {
        setError('');
        setPoliceRegisterMode(false);
        setPoliceRegisterForm({
          username: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          station_id: ''
        });
        setPoliceData({ username: '', password: '', station_id: '' });
        alert('Registration successful! Please log in with your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetError = () => setError('');

  return (
    <div className="auth-container">
      <div className="auth-card-wrapper">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-header-logo">
              <span className="icon-shield">🛡</span>
              <span>CRIME-MS</span>
            </div>
            <h1>Crime Management</h1>
            <p>Secure Law Enforcement Portal</p>
          </div>

          {/* Tab Navigation */}
          <div className="auth-tabs">
            <div className="auth-tab-item">
              <button
                className={`auth-tab-button ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => { setActiveTab('admin'); resetError(); }}
              >
                <span>👤</span> Admin
              </button>
            </div>
            <div className="auth-tab-item">
              <button
                className={`auth-tab-button ${activeTab === 'user' ? 'active' : ''}`}
                onClick={() => { setActiveTab('user'); resetError(); }}
              >
                <span>👨</span> User
              </button>
            </div>
            <div className="auth-tab-item">
              <button
                className={`auth-tab-button ${activeTab === 'police' ? 'active' : ''}`}
                onClick={() => { setActiveTab('police'); resetError(); }}
              >
                <span>👮</span> Police
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="auth-content">
            {error && (
              <div className="auth-alert error">
                <span>⚠</span> {error}
              </div>
            )}

            {/* Admin Tab */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminLogin}>
                <div className="auth-form-group">
                  <label className="auth-form-label">Username</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Enter admin username"
                    value={adminData.username}
                    onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                    required
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-form-label">Password</label>
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="Enter password"
                    value={adminData.password}
                    onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? <span className="auth-loading"><span className="spinner"></span>Logging in...</span> : 'Login as Admin'}
                </button>
              </form>
            )}

            {/* User Tab */}
            {activeTab === 'user' && (
              <>
                {userRegisterMode ? (
                  <form onSubmit={handleUserRegister}>
                    <div className="auth-form-group">
                      <label className="auth-form-label">Username</label>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="Create a username"
                        value={userRegisterForm.username}
                        onChange={(e) => setUserRegisterForm({ ...userRegisterForm, username: e.target.value })}
                        required
                      />
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">Email</label>
                      <input
                        type="email"
                        className="auth-input"
                        placeholder="Enter your email"
                        value={userRegisterForm.email}
                        onChange={(e) => setUserRegisterForm({ ...userRegisterForm, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">Phone (Optional)</label>
                      <input
                        type="tel"
                        className="auth-input"
                        placeholder="Enter phone number"
                        value={userRegisterForm.phone}
                        onChange={(e) => setUserRegisterForm({ ...userRegisterForm, phone: e.target.value })}
                      />
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">Password</label>
                      <input
                        type="password"
                        className="auth-input"
                        placeholder="Create password (min 6 chars)"
                        value={userRegisterForm.password}
                        onChange={(e) => setUserRegisterForm({ ...userRegisterForm, password: e.target.value })}
                        required
                      />
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="auth-input"
                        placeholder="Confirm password"
                        value={userRegisterForm.confirmPassword}
                        onChange={(e) => setUserRegisterForm({ ...userRegisterForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <button
                      type="button"
                      className="auth-submit-btn secondary"
                      onClick={() => {
                        setUserRegisterMode(false);
                        resetError();
                      }}
                    >
                      Back to Login
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleUserLogin}>
                    <div className="auth-form-group">
                      <label className="auth-form-label">Username</label>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="Enter your username"
                        value={userData.username}
                        onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                        required
                      />
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">Password</label>
                      <input
                        type="password"
                        className="auth-input"
                        placeholder="Enter password"
                        value={userData.password}
                        onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                        required
                      />
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                      {loading ? <span className="auth-loading"><span className="spinner"></span>Logging in...</span> : 'Login as User'}
                    </button>

                    <div className="auth-footer">
                      <p className="auth-footer-text">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          className="auth-footer-link"
                          onClick={() => {
                            setUserRegisterMode(true);
                            resetError();
                          }}
                        >
                          Register here
                        </button>
                      </p>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* Police Tab */}
            {activeTab === 'police' && (
              <>
                {policeRegisterMode ? (
                  <form onSubmit={handlePoliceRegister}>
                    <div className="auth-form-group">
                      <label className="auth-form-label">Username</label>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="Create a username"
                        value={policeRegisterForm.username}
                        onChange={(e) => setPoliceRegisterForm({ ...policeRegisterForm, username: e.target.value })}
                        required
                      />
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">Email</label>
                      <input
                        type="email"
                        className="auth-input"
                        placeholder="Enter your email"
                        value={policeRegisterForm.email}
                        onChange={(e) => setPoliceRegisterForm({ ...policeRegisterForm, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">Phone (Optional)</label>
                      <input
                        type="tel"
                        className="auth-input"
                        placeholder="Enter phone number"
                        value={policeRegisterForm.phone}
                        onChange={(e) => setPoliceRegisterForm({ ...policeRegisterForm, phone: e.target.value })}
                      />
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">Police Station</label>
                      <select
                        className="auth-select"
                        value={policeRegisterForm.station_id}
                        onChange={(e) => setPoliceRegisterForm({ ...policeRegisterForm, station_id: e.target.value })}
                        disabled={stationsLoading}
                        required
                      >
                        <option value="">
                          {stationsLoading ? 'Loading stations...' : 'Select your station'}
                        </option>
                        {stations.map((station) => (
                          <option key={station.id} value={station.station_id || station.id}>
                            {station.station_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">Password</label>
                      <input
                        type="password"
                        className="auth-input"
                        placeholder="Create password (min 6 chars)"
                        value={policeRegisterForm.password}
                        onChange={(e) => setPoliceRegisterForm({ ...policeRegisterForm, password: e.target.value })}
                        required
                      />
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="auth-input"
                        placeholder="Confirm password"
                        value={policeRegisterForm.confirmPassword}
                        onChange={(e) => setPoliceRegisterForm({ ...policeRegisterForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <button
                      type="button"
                      className="auth-submit-btn secondary"
                      onClick={() => {
                        setPoliceRegisterMode(false);
                        resetError();
                      }}
                    >
                      Back to Login
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handlePoliceLogin}>
                    <div className="auth-form-group">
                      <label className="auth-form-label">Username</label>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="Enter your username"
                        value={policeData.username}
                        onChange={(e) => setPoliceData({ ...policeData, username: e.target.value })}
                        required
                      />
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">Password</label>
                      <input
                        type="password"
                        className="auth-input"
                        placeholder="Enter password"
                        value={policeData.password}
                        onChange={(e) => setPoliceData({ ...policeData, password: e.target.value })}
                        required
                      />
                    </div>

                    <div className="auth-form-group">
                      <label className="auth-form-label">Police Station</label>
                      <select
                        className="auth-select"
                        value={policeData.station_id}
                        onChange={(e) => setPoliceData({ ...policeData, station_id: e.target.value })}
                        disabled={stationsLoading}
                        required
                      >
                        <option value="">
                          {stationsLoading ? 'Loading stations...' : 'Select your station'}
                        </option>
                        {stations.map((station) => (
                          <option key={station.id} value={station.station_id || station.id}>
                            {station.station_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading || !policeData.station_id}>
                      {loading ? <span className="auth-loading"><span className="spinner"></span>Logging in...</span> : 'Login as Police Officer'}
                    </button>

                    <div className="auth-footer">
                      <p className="auth-footer-text">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          className="auth-footer-link"
                          onClick={() => {
                            setPoliceRegisterMode(true);
                            resetError();
                          }}
                        >
                          Register here
                        </button>
                      </p>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '30px', textAlign: 'center', color: 'white', fontSize: '0.85rem', opacity: 0.8 }}>
          <p>© 2026 Crime Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
