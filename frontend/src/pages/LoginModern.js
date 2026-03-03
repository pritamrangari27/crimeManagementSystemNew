import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, stationsAPI } from '../api/client';
import { setAuthUser } from '../utils/authService';
import '../styles/auth-modern.css';

const LoginModern = () => {
  const [activeTab, setActiveTab] = useState('user');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerType, setRegisterType] = useState('user');

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
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [stations, setStations] = useState([]);
  const [showPasswords, setShowPasswords] = useState({
    userLogin: false,
    adminLogin: false,
    policeLogin: false,
    userRegPass: false,
    userRegConfirm: false,
    policeRegPass: false,
    policeRegConfirm: false
  });
  const navigate = useNavigate();

  const togglePassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Fetch stations
  useEffect(() => {
    if (stations.length === 0 && (activeTab === 'police' || (showRegisterModal && registerType === 'police'))) {
      const fetchStations = async () => {
        try {
          const response = await stationsAPI.getAll();
          if (response.data.status === 'success' && Array.isArray(response.data.data)) {
            setStations(response.data.data);
          }
        } catch (err) {
          // Silent fail - stations list optional
        }
      };
      fetchStations();
    }
  }, [activeTab, stations.length, showRegisterModal, registerType]);

  const clearErrors = () => {
    setError('');
    setSuccess('');
  };

  const clearModalErrors = () => {
    setModalError('');
    setModalSuccess('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    clearErrors();
  };

  const openRegisterModal = (type) => {
    setRegisterType(type);
    setShowRegisterModal(true);
    clearModalErrors();
  };

  const closeRegisterModal = () => {
    setShowRegisterModal(false);
    clearModalErrors();
    setUserRegister({ username: '', email: '', password: '', confirmPassword: '', phone: '' });
    setPoliceRegister({ username: '', email: '', password: '', confirmPassword: '', phone: '', station_id: '' });
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
      const response = await authAPI.login(adminLogin.username, adminLogin.password, 'Admin');
      
      if (response.data.status === 'success') {
        setAuthUser(response.data.user, 'Admin', response.data.token);
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
        errorMessage = 'Incorrect username or password';
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
      const response = await authAPI.login(userLogin.username, userLogin.password, 'User');
      
      if (response.data.status === 'success') {
        setAuthUser(response.data.user, 'User', response.data.token);
        setSuccess('✓ Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/user/dashboard');
        }, 1500);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      let errorMessage = 'Login failed. ';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage += 'Request timeout. Backend may be slow or not responding.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage += 'Network error. Is the backend running on port 3000?';
      } else if (!err.response) {
        errorMessage += 'Cannot reach backend server. Check if it\'s running on port 3000.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Incorrect username or password';
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
      const response = await authAPI.login(policeLogin.username, policeLogin.password, 'Police');
      
      if (response.data.status === 'success') {
        setAuthUser(response.data.user, 'Police', response.data.token);
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
        errorMessage = 'Incorrect username or password';
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
    clearModalErrors();

    if (!userRegister.username || !userRegister.email || !userRegister.password) {
      setModalError('All fields are required');
      return;
    }

    if (userRegister.password !== userRegister.confirmPassword) {
      setModalError('Passwords do not match');
      return;
    }

    if (userRegister.password.length < 6) {
      setModalError('Password must be at least 6 characters');
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
        setModalSuccess(`Welcome ${userRegister.username}! Registration successful.`);
        const savedUsername = userRegister.username;
        setTimeout(() => {
          closeRegisterModal();
          setActiveTab('user');
          setUserLogin({ username: savedUsername, password: '' });
          setSuccess('Registration successful! Please login with your credentials.');
        }, 2000);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('User register error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePoliceRegister = async (e) => {
    e.preventDefault();
    clearModalErrors();

    if (!policeRegister.username || !policeRegister.email || !policeRegister.password || !policeRegister.station_id) {
      setModalError('All fields are required');
      return;
    }

    if (policeRegister.password !== policeRegister.confirmPassword) {
      setModalError('Passwords do not match');
      return;
    }

    if (policeRegister.password.length < 6) {
      setModalError('Password must be at least 6 characters');
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
        setModalSuccess(`Welcome Officer ${policeRegister.username}! Registration successful.`);
        const savedUsername = policeRegister.username;
        const savedStationId = policeRegister.station_id;
        setTimeout(() => {
          closeRegisterModal();
          setActiveTab('police');
          setPoliceLogin({ username: savedUsername, password: '', station_id: savedStationId });
          setSuccess('Registration successful! Please login with your credentials.');
        }, 2000);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                ✓ User
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
                🛡 Police
              </button>
            </div>

            {/* Global Alerts */}
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* ===== USER TAB ===== */}
            {activeTab === 'user' && (
              <div className="auth-tab-content active">
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
                    <div className="password-wrapper">
                      <input
                        type={showPasswords.userLogin ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Enter your password"
                        value={userLogin.password}
                        onChange={(e) => setUserLogin({ ...userLogin, password: e.target.value })}
                        required
                      />
                      <button type="button" className="password-toggle" onClick={() => togglePassword('userLogin')} tabIndex={-1}>
                        <i className={`fas ${showPasswords.userLogin ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading && <span className="loading-spinner"></span>}
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>

                <div className="form-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <p style={{ margin: 0 }}>Don't have an account?</p>
                  <button
                    type="button"
                    className="btn-register-link"
                    onClick={() => openRegisterModal('user')}
                  >
                    🔐 Create New Account
                  </button>
                </div>
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
                    <div className="password-wrapper">
                      <input
                        type={showPasswords.adminLogin ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Enter admin password"
                        value={adminLogin.password}
                        onChange={(e) => setAdminLogin({ ...adminLogin, password: e.target.value })}
                        required
                      />
                      <button type="button" className="password-toggle" onClick={() => togglePassword('adminLogin')} tabIndex={-1}>
                        <i className={`fas ${showPasswords.adminLogin ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
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
                    <div className="password-wrapper">
                      <input
                        type={showPasswords.policeLogin ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Enter your password"
                        value={policeLogin.password}
                        onChange={(e) => setPoliceLogin({ ...policeLogin, password: e.target.value })}
                        required
                      />
                      <button type="button" className="password-toggle" onClick={() => togglePassword('policeLogin')} tabIndex={-1}>
                        <i className={`fas ${showPasswords.policeLogin ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
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
                    onClick={() => openRegisterModal('police')}
                  >
                    🔐 Create New Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.3px' }}>
          <p>&copy; {new Date().getFullYear()} Crime Management System. All rights reserved.</p>
        </div>
      </div>

      {/* ===== REGISTRATION MODAL ===== */}
      {showRegisterModal && (
        <div className="register-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeRegisterModal(); }}>
          <div className="register-modal">
            <div className="register-modal-header">
              <h3>{registerType === 'user' ? '👤 User Registration' : '🛡 Police Registration'}</h3>
              <button className="register-modal-close" onClick={closeRegisterModal}>&times;</button>
            </div>

            <div className="register-modal-body">
              {modalError && <div className="alert alert-danger">{modalError}</div>}
              {modalSuccess && <div className="alert alert-success">{modalSuccess}</div>}

              {registerType === 'user' ? (
                <form onSubmit={handleUserRegister}>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input type="text" className="form-control" placeholder="Choose a username"
                      value={userRegister.username}
                      onChange={(e) => setUserRegister({ ...userRegister, username: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="Enter your email"
                      value={userRegister.email}
                      onChange={(e) => setUserRegister({ ...userRegister, email: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone (Optional)</label>
                    <input type="tel" className="form-control" placeholder="Enter your phone number"
                      value={userRegister.phone}
                      onChange={(e) => setUserRegister({ ...userRegister, phone: e.target.value })} />
                  </div>
                  <div className="register-modal-row">
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <div className="password-wrapper">
                        <input type={showPasswords.userRegPass ? 'text' : 'password'} className="form-control" placeholder="Create a password"
                          value={userRegister.password}
                          onChange={(e) => setUserRegister({ ...userRegister, password: e.target.value })} required />
                        <button type="button" className="password-toggle" onClick={() => togglePassword('userRegPass')} tabIndex={-1}>
                          <i className={`fas ${showPasswords.userRegPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm Password</label>
                      <div className="password-wrapper">
                        <input type={showPasswords.userRegConfirm ? 'text' : 'password'} className="form-control" placeholder="Confirm password"
                          value={userRegister.confirmPassword}
                          onChange={(e) => setUserRegister({ ...userRegister, confirmPassword: e.target.value })} required />
                        <button type="button" className="password-toggle" onClick={() => togglePassword('userRegConfirm')} tabIndex={-1}>
                          <i className={`fas ${showPasswords.userRegConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading && <span className="loading-spinner"></span>}
                    {loading ? 'Registering...' : 'Create Account'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePoliceRegister}>
                  <div className="register-modal-row">
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <input type="text" className="form-control" placeholder="Choose a username"
                        value={policeRegister.username}
                        onChange={(e) => setPoliceRegister({ ...policeRegister, username: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" placeholder="Enter your email"
                        value={policeRegister.email}
                        onChange={(e) => setPoliceRegister({ ...policeRegister, email: e.target.value })} required />
                    </div>
                  </div>
                  <div className="register-modal-row">
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input type="tel" className="form-control" placeholder="Enter your phone"
                        value={policeRegister.phone}
                        onChange={(e) => setPoliceRegister({ ...policeRegister, phone: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Police Station</label>
                      <select className="form-select" value={policeRegister.station_id}
                        onChange={(e) => setPoliceRegister({ ...policeRegister, station_id: e.target.value })} required>
                        <option value="">-- Select Station --</option>
                        {stations.map((station) => (
                          <option key={station.id} value={station.id}>{station.station_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="register-modal-row">
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <div className="password-wrapper">
                        <input type={showPasswords.policeRegPass ? 'text' : 'password'} className="form-control" placeholder="Create a password"
                          value={policeRegister.password}
                          onChange={(e) => setPoliceRegister({ ...policeRegister, password: e.target.value })} required />
                        <button type="button" className="password-toggle" onClick={() => togglePassword('policeRegPass')} tabIndex={-1}>
                          <i className={`fas ${showPasswords.policeRegPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm Password</label>
                      <div className="password-wrapper">
                        <input type={showPasswords.policeRegConfirm ? 'text' : 'password'} className="form-control" placeholder="Confirm password"
                          value={policeRegister.confirmPassword}
                          onChange={(e) => setPoliceRegister({ ...policeRegister, confirmPassword: e.target.value })} required />
                        <button type="button" className="password-toggle" onClick={() => togglePassword('policeRegConfirm')} tabIndex={-1}>
                          <i className={`fas ${showPasswords.policeRegConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading && <span className="loading-spinner"></span>}
                    {loading ? 'Registering...' : 'Register as Officer'}
                  </button>
                </form>
              )}

              <div className="form-footer" style={{ marginTop: '0.75rem' }}>
                <button type="button" className="btn-register-link" onClick={closeRegisterModal}>
                  🔑 Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginModern;
