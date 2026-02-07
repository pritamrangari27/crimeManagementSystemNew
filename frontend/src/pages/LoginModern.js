import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import '../styles/auth-modern.css';

const LoginModern = () => {
  const [activeTab, setActiveTab] = useState('user');
  const [isRegistering, setIsRegistering] = useState(false);

  // Login States
  const [adminLogin, setAdminLogin] = useState({ username: '', password: '' });
  const [userLogin, setUserLogin] = useState({ username: '', password: '' });
  const [policeLogin, setPoliceLogin] = useState({ username: '', password: '', station_id: '' });

  // Register States
  const [userRegister, setUserRegister] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [policeRegister, setPoliceRegister] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    station_id: ''
  });

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stations, setStations] = useState([]);
  const navigate = useNavigate();

  // Fetch stations
  useEffect(() => {
    if (activeTab === 'police' && stations.length === 0) {
      const fetchStations = async () => {
        try {
          const response = await fetch('http://localhost:3000/api/stations/all');
          const data = await response.json();
          if (data.status === 'success' && Array.isArray(data.data)) {
            setStations(data.data);
          }
        } catch (err) {
          console.log('Could not fetch stations:', err);
        }
      };
      fetchStations();
    }
  }, [activeTab, stations.length]);

  const clearErrors = () => {
    setError('');
    setSuccess('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsRegistering(false);
    clearErrors();
  };

  // ===== LOGIN HANDLERS =====
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!adminLogin.username || !adminLogin.password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    try {
      console.log('=== ADMIN LOGIN ATTEMPT ===');
      const response = await authAPI.login(adminLogin.username, adminLogin.password, 'Admin');
      
      if (response.data.status === 'success') {
        localStorage.setItem('authUser', JSON.stringify(response.data.user));
        localStorage.setItem('userRole', 'Admin');
        // Store token if provided in response
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        setSuccess('✓ Admin login successful! Redirecting...');
        setTimeout(() => navigate('/admin/dashboard'), 1500);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      let errorMessage = 'Login failed. ';
      
      if (!err.response) {
        errorMessage += 'Cannot reach backend. Check if it\'s running on port 3000.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid admin credentials';
      } else {
        errorMessage += err.response?.data?.message || err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!userLogin.username || !userLogin.password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    try {
      console.log('=== USER LOGIN ATTEMPT ===');
      console.log('Username:', userLogin.username);
      console.log('Calling: authAPI.login()');
      
      const response = await authAPI.login(userLogin.username, userLogin.password, 'User');
      
      console.log('Login response received:', response.data);
      
      if (response.data.status === 'success') {
        console.log('Login successful! User:', response.data.user);
        localStorage.setItem('authUser', JSON.stringify(response.data.user));
        localStorage.setItem('userRole', 'User');
        // Store token if provided in response
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        setSuccess('✓ Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/user/dashboard');
        }, 1500);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('=== USER LOGIN ERROR ===');
      console.error('Error object:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      
      let errorMessage = 'Login failed. ';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage += 'Request timeout. Backend may be slow or not responding.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage += 'Network error. Is the backend running on port 3000?';
      } else if (!err.response) {
        errorMessage += 'Cannot reach backend server. Check if it\'s running on port 3000.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Invalid request';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage += err.response?.data?.message || err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePoliceLogin = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!policeLogin.username || !policeLogin.password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    try {
      console.log('=== POLICE LOGIN ATTEMPT ===');
      const response = await authAPI.login(policeLogin.username, policeLogin.password, 'Police');
      
      if (response.data.status === 'success') {
        localStorage.setItem('authUser', JSON.stringify(response.data.user));
        localStorage.setItem('userRole', 'Police');
        // Store token if provided in response
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        setSuccess('✓ Police login successful! Redirecting...');
        setTimeout(() => navigate('/police/dashboard'), 1500);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Police login error:', err);
      let errorMessage = 'Login failed. ';
      
      if (!err.response) {
        errorMessage += 'Cannot reach backend. Check if it\'s running on port 3000.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid police credentials';
      } else {
        errorMessage += err.response?.data?.message || err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ===== REGISTER HANDLERS =====
  const handleUserRegister = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!userRegister.username || !userRegister.email || !userRegister.password) {
      setError('All fields are required');
      return;
    }

    if (userRegister.password !== userRegister.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (userRegister.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register(
        userRegister.username,
        userRegister.password,
        userRegister.email,
        userRegister.phone,
        'User'
      );
      if (response.data.status === 'success') {
        setSuccess(`Welcome ${userRegister.username}! Registration successful. Please login now.`);
        setIsRegistering(false);
        setUserRegister({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: ''
        });
        setUserLogin({ username: userRegister.username, password: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('User register error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePoliceRegister = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!policeRegister.username || !policeRegister.email || !policeRegister.password || !policeRegister.station_id) {
      setError('All fields are required');
      return;
    }

    if (policeRegister.password !== policeRegister.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (policeRegister.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register(
        policeRegister.username,
        policeRegister.password,
        policeRegister.email,
        policeRegister.phone,
        'Police',
        policeRegister.station_id
      );
      if (response.data.status === 'success') {
        setSuccess(`Welcome Officer ${policeRegister.username}! Registration successful. Please login now.`);
        setIsRegistering(false);
        setPoliceRegister({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          station_id: ''
        });
        setPoliceLogin({ 
          username: policeRegister.username, 
          password: '',
          station_id: policeRegister.station_id
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Police register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-page-title">
        <h1>Crime Management System</h1>
        <p className="auth-page-subtitle">Secure Access Portal</p>
      </div>
      
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-card-body">
            {/* Tab Navigation */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${activeTab === 'user' ? 'active' : ''}`}
                onClick={() => handleTabChange('user')}
              >
                ✓ Citizen
              </button>
              <button
                className={`auth-tab ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => handleTabChange('admin')}
              >
                ⚙ Administrator
              </button>
              <button
                className={`auth-tab ${activeTab === 'police' ? 'active' : ''}`}
                onClick={() => handleTabChange('police')}
              >
                🛡 Law Officer
              </button>
            </div>

            {/* Global Alerts */}
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* ===== USER TAB ===== */}
            {activeTab === 'user' && (
              <div className="auth-tab-content active">
                {!isRegistering ? (
                  <>
                    <h3 className="auth-card-title">User Login</h3>
                    <form onSubmit={handleUserLogin}>
                      <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter your username"
                          value={userLogin.username}
                          onChange={(e) => setUserLogin({ ...userLogin, username: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter your password"
                          value={userLogin.password}
                          onChange={(e) => setUserLogin({ ...userLogin, password: e.target.value })}
                          required
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading && <span className="loading-spinner"></span>}
                        {loading ? 'Logging in...' : 'Login'}
                      </button>
                    </form>

                    <div className="form-footer">
                      <p>Don't have an account?</p>
                      <button
                        type="button"
                        className="btn-register-link"
                        onClick={() => setIsRegistering(true)}
                      >
                        🔐 Create New Account
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="auth-card-title">Create User Account</h3>
                    <form onSubmit={handleUserRegister}>
                      <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Choose a username"
                          value={userRegister.username}
                          onChange={(e) => setUserRegister({ ...userRegister, username: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Enter your email"
                          value={userRegister.email}
                          onChange={(e) => setUserRegister({ ...userRegister, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Phone (Optional)</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="Enter your phone number"
                          value={userRegister.phone}
                          onChange={(e) => setUserRegister({ ...userRegister, phone: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Create a password"
                          value={userRegister.password}
                          onChange={(e) => setUserRegister({ ...userRegister, password: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Confirm your password"
                          value={userRegister.confirmPassword}
                          onChange={(e) => setUserRegister({ ...userRegister, confirmPassword: e.target.value })}
                          required
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading && <span className="loading-spinner"></span>}
                        {loading ? 'Registering...' : 'Register'}
                      </button>
                    </form>

                    <div className="form-footer">
                      <p>Already have an account?</p>
                      <button
                        type="button"
                        className="btn-register-link"
                        onClick={() => setIsRegistering(false)}
                      >
                        🔑 Back to Login
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ===== ADMIN TAB ===== */}
            {activeTab === 'admin' && (
              <div className="auth-tab-content active">
                <h3 className="auth-card-title">Admin Login</h3>
                <form onSubmit={handleAdminLogin}>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter admin username"
                      value={adminLogin.username}
                      onChange={(e) => setAdminLogin({ ...adminLogin, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter admin password"
                      value={adminLogin.password}
                      onChange={(e) => setAdminLogin({ ...adminLogin, password: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading && <span className="loading-spinner"></span>}
                    {loading ? 'Logging in...' : 'Login as Admin'}
                  </button>
                </form>

                <div className="form-footer">
                  <small>For administrators only. Contact support for admin access.</small>
                </div>
              </div>
            )}

            {/* ===== POLICE TAB ===== */}
            {activeTab === 'police' && (
              <div className="auth-tab-content active">
                {!isRegistering ? (
                  <>
                    <h3 className="auth-card-title">Police Login</h3>
                    <form onSubmit={handlePoliceLogin}>
                      <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter your username"
                          value={policeLogin.username}
                          onChange={(e) => setPoliceLogin({ ...policeLogin, username: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter your password"
                          value={policeLogin.password}
                          onChange={(e) => setPoliceLogin({ ...policeLogin, password: e.target.value })}
                          required
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading && <span className="loading-spinner"></span>}
                        {loading ? 'Logging in...' : 'Login as Officer'}
                      </button>
                    </form>

                    <div className="form-footer">
                      New officer?{' '}
                      <button
                        type="button"
                        className="btn-register-link"
                        onClick={() => setIsRegistering(true)}
                      >
                        🔐 Create New Account
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="auth-card-title">Police Officer Registration</h3>
                    <form onSubmit={handlePoliceRegister}>
                      <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Choose a username"
                          value={policeRegister.username}
                          onChange={(e) => setPoliceRegister({ ...policeRegister, username: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Enter your email"
                          value={policeRegister.email}
                          onChange={(e) => setPoliceRegister({ ...policeRegister, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="Enter your phone number"
                          value={policeRegister.phone}
                          onChange={(e) => setPoliceRegister({ ...policeRegister, phone: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Police Station</label>
                        <select
                          className="form-select"
                          value={policeRegister.station_id}
                          onChange={(e) => setPoliceRegister({ ...policeRegister, station_id: e.target.value })}
                          required
                        >
                          <option value="">-- Select Your Station --</option>
                          {stations.map((station) => (
                            <option key={station.id} value={station.id}>
                              {station.station_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Create a password"
                          value={policeRegister.password}
                          onChange={(e) => setPoliceRegister({ ...policeRegister, password: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Confirm your password"
                          value={policeRegister.confirmPassword}
                          onChange={(e) => setPoliceRegister({ ...policeRegister, confirmPassword: e.target.value })}
                          required
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading && <span className="loading-spinner"></span>}
                        {loading ? 'Registering...' : 'Register as Officer'}
                      </button>
                    </form>

                    <div className="form-footer">
                      Already registered?{' '}
                      <button
                        type="button"
                        className="btn-register-link"
                        onClick={() => setIsRegistering(false)}
                      >
                        🔑 Back to Login
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', color: 'white', fontSize: '12px' }}>
          <p>&copy; 2024. All rights reserved.</p>
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

export default LoginModern;
