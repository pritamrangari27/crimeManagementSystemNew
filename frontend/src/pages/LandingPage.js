import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, stationsAPI } from '../api/client';
import { setAuthUser } from '../utils/authService';
import '../styles/landing-page.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null); // null, 'login', 'register'
  const [activeLoginTab, setActiveLoginTab] = useState('user');
  const [registerType, setRegisterType] = useState('user');
  const [loading, setLoading] = useState(false);

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
      {/* Header/Navbar */}
      <header className="landing-header">
        <div className="header-container">
          <div className="header-logo">
            <h1>🚔 Crime Management System</h1>
          </div>
          <div className="header-buttons">
            <button className="btn-header btn-login" onClick={openLoginModal}>
              Login
            </button>
            <button className="btn-header btn-register" onClick={() => openRegisterModal('user')}>
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h2 className="hero-title">Secure Crime Management & FIR Filing</h2>
          <p className="hero-subtitle">
            Empowering citizens and law enforcement with AI-powered crime reporting, real-time tracking, and data-driven insights.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-large" onClick={() => openRegisterModal('user')}>
              File a Report
            </button>
            <button className="btn btn-secondary btn-large" onClick={openLoginModal}>
              Login to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Online FIR Filing</h3>
              <p>File First Information Reports online anytime, anywhere with auto-generated FIR numbers.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Classification</h3>
              <p>Intelligent crime type detection using advanced machine learning algorithms.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Geo-Tagged Reports</h3>
              <p>Location-based incident tracking with precise latitude and longitude support.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Real-time Notifications</h3>
              <p>Get instant updates on FIR status, case progress, and police responses.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>24/7 AI Chatbot</h3>
              <p>Round-the-clock assistance for FIR guidance, legal FAQs, and safety tips.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytics Dashboard</h3>
              <p>Crime heatmaps, trend analysis, and comprehensive reporting for law enforcement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="how-container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Register</h3>
              <p>Create your account as a citizen, police officer, or administrator.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Report</h3>
              <p>File your FIR with detailed information about the incident.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Track</h3>
              <p>Monitor your case status and receive real-time updates.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Resolve</h3>
              <p>Work with authorities for case resolution and closure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat">
            <h3>10,000+</h3>
            <p>FIRs Filed</p>
          </div>
          <div className="stat">
            <h3>500+</h3>
            <p>Police Officers</p>
          </div>
          <div className="stat">
            <h3>50+</h3>
            <p>Stations Covered</p>
          </div>
          <div className="stat">
            <h3>98%</h3>
            <p>Case Resolution</p>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {activeModal === 'login' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            
            <div className="modal-header">
              <h2>Login to Your Account</h2>
            </div>

            {/* Login Tabs */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${activeLoginTab === 'user' ? 'active' : ''}`}
                onClick={() => setActiveLoginTab('user')}
              >
                ✓ Citizen
              </button>
              <button
                className={`auth-tab ${activeLoginTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveLoginTab('admin')}
              >
                ⚙ Admin
              </button>
              <button
                className={`auth-tab ${activeLoginTab === 'police' ? 'active' : ''}`}
                onClick={() => setActiveLoginTab('police')}
              >
                🛡 Police
              </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* User Login */}
            {activeLoginTab === 'user' && (
              <form onSubmit={handleUserLogin} className="login-form">
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

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            )}

            {/* Admin Login */}
            {activeLoginTab === 'admin' && (
              <form onSubmit={handleAdminLogin} className="login-form">
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
                      placeholder="Enter your password"
                      value={adminLogin.password}
                      onChange={(e) => setAdminLogin({ ...adminLogin, password: e.target.value })}
                      required
                    />
                    <button type="button" className="password-toggle" onClick={() => togglePassword('adminLogin')} tabIndex={-1}>
                      <i className={`fas ${showPasswords.adminLogin ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login as Admin'}
                </button>
              </form>
            )}

            {/* Police Login */}
            {activeLoginTab === 'police' && (
              <form onSubmit={handlePoliceLogin} className="login-form">
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

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login as Officer'}
                </button>
              </form>
            )}

            <div className="form-footer">
              <p>Don't have an account? 
                <button type="button" className="btn-link" onClick={() => openRegisterModal('user')}>
                  Register here
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {activeModal === 'register' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            
            <div className="modal-header">
              <h2>
                {registerType === 'user' ? 'Register as Citizen' : 'Register as Police Officer'}
              </h2>
            </div>

            <div className="register-type-selector">
              <button
                className={`type-btn ${registerType === 'user' ? 'active' : ''}`}
                onClick={() => setRegisterType('user')}
              >
                Citizen Account
              </button>
              <button
                className={`type-btn ${registerType === 'police' ? 'active' : ''}`}
                onClick={() => setRegisterType('police')}
              >
                Police Account
              </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Citizen Register */}
            {registerType === 'user' && (
              <form onSubmit={handleUserRegister} className="register-form">
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

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="password-wrapper">
                      <input
                        type={showPasswords.userRegPass ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Create a password"
                        value={userRegister.password}
                        onChange={(e) => setUserRegister({ ...userRegister, password: e.target.value })}
                        required
                      />
                      <button type="button" className="password-toggle" onClick={() => togglePassword('userRegPass')} tabIndex={-1}>
                        <i className={`fas ${showPasswords.userRegPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div className="password-wrapper">
                      <input
                        type={showPasswords.userRegConfirm ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Confirm password"
                        value={userRegister.confirmPassword}
                        onChange={(e) => setUserRegister({ ...userRegister, confirmPassword: e.target.value })}
                        required
                      />
                      <button type="button" className="password-toggle" onClick={() => togglePassword('userRegConfirm')} tabIndex={-1}>
                        <i className={`fas ${showPasswords.userRegConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? 'Registering...' : 'Create Account'}
                </button>
              </form>
            )}

            {/* Police Register */}
            {registerType === 'police' && (
              <form onSubmit={handlePoliceRegister} className="register-form">
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
                  <label className="form-label">Phone (Optional)</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Enter your phone number"
                    value={policeRegister.phone}
                    onChange={(e) => setPoliceRegister({ ...policeRegister, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Police Station</label>
                  <select
                    className="form-control"
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
                    <label className="form-label">Password</label>
                    <div className="password-wrapper">
                      <input
                        type={showPasswords.policeRegPass ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Create a password"
                        value={policeRegister.password}
                        onChange={(e) => setPoliceRegister({ ...policeRegister, password: e.target.value })}
                        required
                      />
                      <button type="button" className="password-toggle" onClick={() => togglePassword('policeRegPass')} tabIndex={-1}>
                        <i className={`fas ${showPasswords.policeRegPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div className="password-wrapper">
                      <input
                        type={showPasswords.policeRegConfirm ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Confirm password"
                        value={policeRegister.confirmPassword}
                        onChange={(e) => setPoliceRegister({ ...policeRegister, confirmPassword: e.target.value })}
                        required
                      />
                      <button type="button" className="password-toggle" onClick={() => togglePassword('policeRegConfirm')} tabIndex={-1}>
                        <i className={`fas ${showPasswords.policeRegConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? 'Registering...' : 'Create Officer Account'}
                </button>
              </form>
            )}

            <div className="form-footer">
              <p>Already have an account? 
                <button type="button" className="btn-link" onClick={openLoginModal}>
                  Login here
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p>&copy; 2024 Crime Management System. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
