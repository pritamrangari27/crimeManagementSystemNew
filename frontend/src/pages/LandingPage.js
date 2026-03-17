import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, stationsAPI } from '../api/client';
import { setAuthUser } from '../utils/authService';
import '../styles/landing-page.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [activeLoginTab, setActiveLoginTab] = useState('user');
  const [registerType, setRegisterType] = useState('user');
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Login States
  const [adminLogin, setAdminLogin] = useState({ username: '', password: '' });
  const [userLogin, setUserLogin] = useState({ username: '', password: '' });
  const [policeLogin, setPoliceLogin] = useState({ username: '', password: '' });

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch stations for police registration
  useEffect(() => {
    if (stations.length === 0 && activeModal === 'register' && registerType === 'police') {
      const fetchStations = async () => {
        try {
          const response = await stationsAPI.getAll();
          if (response.data.status === 'success' && Array.isArray(response.data.data)) {
            setStations(response.data.data);
          }
        } catch (err) {
          // Silent fail
        }
      };
      fetchStations();
    }
  }, [stations.length, activeModal, registerType]);

  const togglePassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const openLoginModal = () => {
    setActiveModal('login');
    setError('');
    setSuccess('');
  };

  const openRegisterModal = (type) => {
    setRegisterType(type);
    setActiveModal('register');
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setActiveModal(null);
    setError('');
    setSuccess('');
  };

  // ===== LOGIN HANDLERS =====
  const handleUserLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!userLogin.username || !userLogin.password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(userLogin.username, userLogin.password, 'User');
      
      if (response.data.status === 'success') {
        setAuthUser(response.data.user, 'User', response.data.token);
        navigate('/user/dashboard');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      let errorMessage = 'Login failed. ';
      if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
        errorMessage += 'Server may be starting up — please try again shortly.';
      } else if (!err.response) {
        errorMessage += 'Cannot reach backend server.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Wrong username or password';
      } else {
        errorMessage += err.response?.data?.message || err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!adminLogin.username || !adminLogin.password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(adminLogin.username, adminLogin.password, 'Admin');
      
      if (response.data.status === 'success') {
        setAuthUser(response.data.user, 'Admin', response.data.token);
        navigate('/admin/dashboard');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      let errorMessage = 'Login failed. ';
      if (!err.response) {
        errorMessage += 'Cannot reach backend server.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Wrong username or password';
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
    setError('');
    setSuccess('');

    if (!policeLogin.username || !policeLogin.password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(policeLogin.username, policeLogin.password, 'Police');
      
      if (response.data.status === 'success') {
        setAuthUser(response.data.user, 'Police', response.data.token);
        navigate('/police/dashboard');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      let errorMessage = 'Login failed. ';
      if (!err.response) {
        errorMessage += 'Cannot reach backend server.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Wrong username or password';
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
    setError('');
    setSuccess('');

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
        setSuccess(`Welcome ${userRegister.username}! Registration successful. Redirecting to login...`);
        setTimeout(() => {
          setUserLogin({ username: userRegister.username, password: '' });
          setUserRegister({ username: '', email: '', password: '', confirmPassword: '', phone: '' });
          setActiveModal('login');
          setActiveLoginTab('user');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePoliceRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
        setSuccess(`Welcome Officer ${policeRegister.username}! Registration successful. Redirecting to login...`);
        setTimeout(() => {
          setPoliceLogin({ username: policeRegister.username, password: '' });
          setPoliceRegister({ username: '', email: '', password: '', confirmPassword: '', phone: '', station_id: '' });
          setActiveModal('login');
          setActiveLoginTab('police');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Premium Header/Navbar */}
      <header className={`premium-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <div className="header-logo">
            <div className="logo-icon">🛡️</div>
            <h1>Crime Management</h1>
          </div>
          <div className="header-buttons">
            <button className="btn-header btn-login" onClick={openLoginModal}>
              Sign In
            </button>
            <button className="btn-header btn-register" onClick={() => openRegisterModal('user')}>
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-premium">
        <div className="hero-content">
          <div className="hero-badge">
            <span>🚀 Enterprise-Grade Security</span>
          </div>
          <h2 className="hero-title">
            Advanced Crime Management & <span className="text-accent">FIR Filing Platform</span>
          </h2>
          <p className="hero-subtitle">
            Empower law enforcement with AI-driven insights, real-time collaboration, and secure incident reporting. Transform public safety through intelligent data management.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary-lg" onClick={() => openRegisterModal('user')}>
              Start Free Trial
            </button>
            <button className="btn btn-secondary-lg" onClick={openLoginModal}>
              Schedule Demo
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-icon">📊</div>
            <p>Real-time Analytics</p>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">🔒</div>
            <p>Bank-Level Security</p>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">⚡</div>
            <p>Instant Response</p>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="features-premium">
        <div className="features-container">
          <div className="section-header">
            <h2>Comprehensive Platform Features</h2>
            <p>Everything you need to manage crime, criminal data, and FIR processing efficiently</p>
          </div>
          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">📋</span>
              </div>
              <h3>Smart Incident Reporting</h3>
              <p>File FIRs online with AI-powered crime classification and geo-tagging for precise incident tracking.</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🤖</span>
              </div>
              <h3>AI Crime Intelligence</h3>
              <p>Machine learning algorithms automatically classify crimes and identify patterns for proactive policing.</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">📍</span>
              </div>
              <h3>Location Intelligence</h3>
              <p>Geo-tagged reports and crime heatmaps for data-driven deployment and resource optimization.</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🔔</span>
              </div>
              <h3>Real-time Notifications</h3>
              <p>Instant updates on case status changes with multi-channel notification delivery.</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">👥</span>
              </div>
              <h3>Criminal Database</h3>
              <p>Comprehensive criminal records with facial recognition and identity verification.</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">📈</span>
              </div>
              <h3>Advanced Analytics</h3>
              <p>Dive deep into crime statistics, trends, and patterns with executive dashboards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-premium">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">10,000+</div>
            <div className="stat-label">FIRs Processed</div>
            <div className="stat-desc">Trusted by law enforcement</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Police Officers</div>
            <div className="stat-desc">Active users daily</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Police Stations</div>
            <div className="stat-desc">Nationwide coverage</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">98%</div>
            <div className="stat-label">Case Resolution</div>
            <div className="stat-desc">Efficiency rate</div>
          </div>
        </div>
      </section>


      {/* Login Modal */}
      {activeModal === 'login' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            
            <div className="modal-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your account</p>
            </div>

            {/* Login Tabs */}
            <div className="premium-tabs">
              <button
                className={`tab-button ${activeLoginTab === 'user' ? 'active' : ''}`}
                onClick={() => setActiveLoginTab('user')}
              >
                Citizen
              </button>
              <button
                className={`tab-button ${activeLoginTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveLoginTab('admin')}
              >
                Administrator
              </button>
              <button
                className={`tab-button ${activeLoginTab === 'police' ? 'active' : ''}`}
                onClick={() => setActiveLoginTab('police')}
              >
                Police Officer
              </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* User Login */}
            {activeLoginTab === 'user' && (
              <form onSubmit={handleUserLogin} className="premium-form">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="your.username"
                    value={userLogin.username}
                    onChange={(e) => setUserLogin({ ...userLogin, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="password-field">
                    <input
                      type={showPasswords.userLogin ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={userLogin.password}
                      onChange={(e) => setUserLogin({ ...userLogin, password: e.target.value })}
                      required
                    />
                    <button type="button" className="eye-toggle" onClick={() => togglePassword('userLogin')} tabIndex={-1}>
                      {showPasswords.userLogin ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary-block" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* Admin Login */}
            {activeLoginTab === 'admin' && (
              <form onSubmit={handleAdminLogin} className="premium-form">
                <div className="form-group">
                  <label>Admin Username</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="admin.username"
                    value={adminLogin.username}
                    onChange={(e) => setAdminLogin({ ...adminLogin, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="password-field">
                    <input
                      type={showPasswords.adminLogin ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={adminLogin.password}
                      onChange={(e) => setAdminLogin({ ...adminLogin, password: e.target.value })}
                      required
                    />
                    <button type="button" className="eye-toggle" onClick={() => togglePassword('adminLogin')} tabIndex={-1}>
                      {showPasswords.adminLogin ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary-block" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* Police Login */}
            {activeLoginTab === 'police' && (
              <form onSubmit={handlePoliceLogin} className="premium-form">
                <div className="form-group">
                  <label>Officer ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="officer.id"
                    value={policeLogin.username}
                    onChange={(e) => setPoliceLogin({ ...policeLogin, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="password-field">
                    <input
                      type={showPasswords.policeLogin ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={policeLogin.password}
                      onChange={(e) => setPoliceLogin({ ...policeLogin, password: e.target.value })}
                      required
                    />
                    <button type="button" className="eye-toggle" onClick={() => togglePassword('policeLogin')} tabIndex={-1}>
                      {showPasswords.policeLogin ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary-block" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            <div className="modal-footer">
              <p>Don't have an account? 
                <button type="button" className="link-button" onClick={() => openRegisterModal('user')}>
                  Create one now
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {activeModal === 'register' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="premium-modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            
            <div className="modal-header">
              <h2>Create Account</h2>
              <p>Join our secure platform</p>
            </div>

            <div className="register-type-toggle">
              <button
                className={`type-button ${registerType === 'user' ? 'active' : ''}`}
                onClick={() => setRegisterType('user')}
              >
                Citizen Registration
              </button>
              <button
                className={`type-button ${registerType === 'police' ? 'active' : ''}`}
                onClick={() => setRegisterType('police')}
              >
                Police Registration
              </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Citizen Register */}
            {registerType === 'user' && (
              <form onSubmit={handleUserRegister} className="premium-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John Doe"
                    value={userRegister.username}
                    onChange={(e) => setUserRegister({ ...userRegister, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="john@example.com"
                    value={userRegister.email}
                    onChange={(e) => setUserRegister({ ...userRegister, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+1 (555) 123-4567"
                    value={userRegister.phone}
                    onChange={(e) => setUserRegister({ ...userRegister, phone: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Password</label>
                    <div className="password-field">
                      <input
                        type={showPasswords.userRegPass ? 'text' : 'password'}
                        className="form-input"
                        placeholder="••••••••"
                        value={userRegister.password}
                        onChange={(e) => setUserRegister({ ...userRegister, password: e.target.value })}
                        required
                      />
                      <button type="button" className="eye-toggle" onClick={() => togglePassword('userRegPass')} tabIndex={-1}>
                        {showPasswords.userRegPass ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="password-field">
                      <input
                        type={showPasswords.userRegConfirm ? 'text' : 'password'}
                        className="form-input"
                        placeholder="••••••••"
                        value={userRegister.confirmPassword}
                        onChange={(e) => setUserRegister({ ...userRegister, confirmPassword: e.target.value })}
                        required
                      />
                      <button type="button" className="eye-toggle" onClick={() => togglePassword('userRegConfirm')} tabIndex={-1}>
                        {showPasswords.userRegConfirm ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary-block" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Citizen Account'}
                </button>
              </form>
            )}

            {/* Police Register */}
            {registerType === 'police' && (
              <form onSubmit={handlePoliceRegister} className="premium-form">
                <div className="form-group">
                  <label>Officer Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Officer Name"
                    value={policeRegister.username}
                    onChange={(e) => setPoliceRegister({ ...policeRegister, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="officer@station.com"
                    value={policeRegister.email}
                    onChange={(e) => setPoliceRegister({ ...policeRegister, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+1 (555) 123-4567"
                    value={policeRegister.phone}
                    onChange={(e) => setPoliceRegister({ ...policeRegister, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Police Station</label>
                  <select
                    className="form-input"
                    value={policeRegister.station_id}
                    onChange={(e) => setPoliceRegister({ ...policeRegister, station_id: e.target.value })}
                    required
                  >
                    <option value="">-- Select Your Station --</option>
                    {stations.map((station) => (
                      <option key={station.id} value={station.id}>{station.station_name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Password</label>
                    <div className="password-field">
                      <input
                        type={showPasswords.policeRegPass ? 'text' : 'password'}
                        className="form-input"
                        placeholder="••••••••"
                        value={policeRegister.password}
                        onChange={(e) => setPoliceRegister({ ...policeRegister, password: e.target.value })}
                        required
                      />
                      <button type="button" className="eye-toggle" onClick={() => togglePassword('policeRegPass')} tabIndex={-1}>
                        {showPasswords.policeRegPass ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="password-field">
                      <input
                        type={showPasswords.policeRegConfirm ? 'text' : 'password'}
                        className="form-input"
                        placeholder="••••••••"
                        value={policeRegister.confirmPassword}
                        onChange={(e) => setPoliceRegister({ ...policeRegister, confirmPassword: e.target.value })}
                        required
                      />
                      <button type="button" className="eye-toggle" onClick={() => togglePassword('policeRegConfirm')} tabIndex={-1}>
                        {showPasswords.policeRegConfirm ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary-block" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Officer Account'}
                </button>
              </form>
            )}

            <div className="modal-footer">
              <p>Already have an account? 
                <button type="button" className="link-button" onClick={openLoginModal}>
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="premium-footer">
        <div className="footer-container">
          <div className="footer-content">
            <p>&copy; 2024 Crime Management System. All rights reserved.</p>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#security">Security</a>
              <a href="#contact">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

