import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card, Nav, Tab } from 'react-bootstrap';
import { authAPI } from '../api/client';
import '../styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('admin');
  const [stationsLoading, setStationsLoading] = useState(true);

  // Admin Login State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // User Login State
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRegisterMode, setUserRegisterMode] = useState(false);
  const [userRegisterData, setUserRegisterData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Police Login State
  const [policeUsername, setPoliceUsername] = useState('');
  const [policePassword, setPolicePassword] = useState('');
  const [policeStations, setPoliceStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [policeRegisterMode, setPoliceRegisterMode] = useState(false);
  const [policeRegisterData, setPoliceRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    station_id: ''
  });

  // Fetch police stations on component mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setStationsLoading(true);
        const response = await fetch('http://localhost:3000/api/stations/all');
        const data = await response.json();
        if (data.status === 'success' && Array.isArray(data.data)) {
          setPoliceStations(data.data);
        }
      } catch (err) {
        console.log('Could not fetch stations:', err);
        // Fallback stations if API fails
        setPoliceStations([
          { station_id: 'PS001', station_name: 'Central Police Station' },
          { station_id: 'PS002', station_name: 'East Police Station' },
          { station_id: 'PS003', station_name: 'West Police Station' }
        ]);
      } finally {
        setStationsLoading(false);
      }
    };

    fetchStations();
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(adminUsername, adminPassword, 'Admin');
      if (response.data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token || '');
        localStorage.setItem('role', 'Admin');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(userUsername, userPassword, 'User');
      if (response.data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token || '');
        localStorage.setItem('role', 'User');
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'User login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUserRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!userRegisterData.username || !userRegisterData.email || !userRegisterData.password) {
      setError('All fields are required');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userRegisterData.email)) {
      setError('Invalid email format');
      return;
    }
    
    if (userRegisterData.password !== userRegisterData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.userRegister(
        userRegisterData.username,
        userRegisterData.password,
        userRegisterData.email,
        userRegisterData.phone
      );
      if (response.data.status === 'success') {
        setError('');
        setUserRegisterMode(false);
        setUserRegisterData({ username: '', email: '', phone: '', password: '', confirmPassword: '' });
        alert('Registration successful! Please log in.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePoliceLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(policeUsername, policePassword, 'Police');
      if (response.data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token || '');
        localStorage.setItem('role', 'Police');
        localStorage.setItem('station_id', selectedStation);
        navigate('/police/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Police login failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePoliceRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!policeRegisterData.username || !policeRegisterData.email || !policeRegisterData.password) {
      setError('All fields are required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(policeRegisterData.email)) {
      setError('Invalid email format');
      return;
    }

    if (!policeRegisterData.station_id) {
      setError('Please select a police station');
      return;
    }

    if (policeRegisterData.password !== policeRegisterData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.policeRegister(
        policeRegisterData.username,
        policeRegisterData.password,
        policeRegisterData.email,
        policeRegisterData.phone,
        policeRegisterData.station_id
      );
      if (response.data.status === 'success') {
        setError('');
        setPoliceRegisterMode(false);
        setPoliceRegisterData({ username: '', password: '', confirmPassword: '', email: '', phone: '', station_id: '' });
        alert('Police registration successful! Please log in.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Police registration failed');
    } finally {
      setLoading(false);
    }
  };

  const tabStyle = {
    borderRadius: '5px 5px 0 0',
    fontWeight: '600',
    fontSize: '1rem'
  };

  return (
    <Container fluid className="auth-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0 overflow-hidden">
            <Card.Header className="bg-gradient p-0 border-0">
              <h2 className="text-center mb-0 py-4 fw-bold text-white" style={{
                background: 'linear-gradient(135deg, #4e73df, #36b9cc)',
                fontSize: '1.8rem'
              }}>
                <i className="fas fa-shield-alt me-2"></i> Crime Management System
              </h2>
            </Card.Header>

            <Card.Body className="p-0">
              {error && (
                <Alert variant="danger" className="m-3 mb-0">
                  <i className="fas fa-exclamation-circle me-2"></i> {error}
                </Alert>
              )}

              <Tab.Container id="auth-tabs" activeKey={activeTab} onSelect={(k) => { setActiveTab(k); setError(''); }}>
                <Nav variant="pills" className="border-bottom px-4 pt-3">
                  <Nav.Item>
                    <Nav.Link
                      eventKey="admin"
                      style={{
                        ...tabStyle,
                        borderBottom: activeTab === 'admin' ? '3px solid #4e73df' : '1px solid #e9ecef'
                      }}
                      className={activeTab === 'admin' ? 'text-primary' : 'text-muted'}
                    >
                      <i className="fas fa-user-shield me-2"></i> Admin
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="user"
                      style={{
                        ...tabStyle,
                        borderBottom: activeTab === 'user' ? '3px solid #4e73df' : '1px solid #e9ecef'
                      }}
                      className={activeTab === 'user' ? 'text-primary' : 'text-muted'}
                    >
                      <i className="fas fa-user me-2"></i> User
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="police"
                      style={{
                        ...tabStyle,
                        borderBottom: activeTab === 'police' ? '3px solid #4e73df' : '1px solid #e9ecef'
                      }}
                      className={activeTab === 'police' ? 'text-primary' : 'text-muted'}
                    >
                      <i className="fas fa-user-tie me-2"></i> Police Officer
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  {/* ADMIN LOGIN */}
                  <Tab.Pane eventKey="admin">
                    <div className="p-5">
                      <Form onSubmit={handleAdminLogin}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-bold mb-2">
                            <i className="fas fa-user me-2"></i> Username
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter admin username"
                            value={adminUsername}
                            onChange={(e) => setAdminUsername(e.target.value)}
                            required
                            className="form-control-lg"
                          />
                        </Form.Group>

                        <Form.Group className="mb-4">
                          <Form.Label className="fw-bold mb-2">
                            <i className="fas fa-lock me-2"></i> Password
                          </Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Enter password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            required
                            className="form-control-lg"
                          />
                        </Form.Group>

                        <Button
                          variant="primary"
                          type="submit"
                          className="w-100 fw-bold py-2"
                          size="lg"
                          disabled={loading}
                        >
                          {loading ? <span><i className="fas fa-spinner fa-spin me-2"></i>Logging in...</span> : 'Login as Admin'}
                        </Button>
                      </Form>
                    </div>
                  </Tab.Pane>

                  {/* USER LOGIN / REGISTER */}
                  <Tab.Pane eventKey="user">
                    <div className="p-5">
                      {userRegisterMode ? (
                        <>
                          <h5 className="mb-4 fw-bold">Create New Account</h5>
                          <Form onSubmit={handleUserRegister}>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-bold">Username</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Enter username"
                                value={userRegisterData.username}
                                onChange={(e) => setUserRegisterData({
                                  ...userRegisterData,
                                  username: e.target.value
                                })}
                                required
                              />
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label className="fw-bold">Email</Form.Label>
                              <Form.Control
                                type="email"
                                placeholder="Enter email"
                                value={userRegisterData.email}
                                onChange={(e) => setUserRegisterData({
                                  ...userRegisterData,
                                  email: e.target.value
                                })}
                                required
                              />
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label className="fw-bold">Phone</Form.Label>
                              <Form.Control
                                type="tel"
                                placeholder="Enter phone number"
                                value={userRegisterData.phone}
                                onChange={(e) => setUserRegisterData({
                                  ...userRegisterData,
                                  phone: e.target.value
                                })}
                              />
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label className="fw-bold">Password</Form.Label>
                              <Form.Control
                                type="password"
                                placeholder="Enter password"
                                value={userRegisterData.password}
                                onChange={(e) => setUserRegisterData({
                                  ...userRegisterData,
                                  password: e.target.value
                                })}
                                required
                              />
                            </Form.Group>

                            <Form.Group className="mb-4">
                              <Form.Label className="fw-bold">Confirm Password</Form.Label>
                              <Form.Control
                                type="password"
                                placeholder="Confirm password"
                                value={userRegisterData.confirmPassword}
                                onChange={(e) => setUserRegisterData({
                                  ...userRegisterData,
                                  confirmPassword: e.target.value
                                })}
                                required
                              />
                            </Form.Group>

                            <Button
                              variant="success"
                              type="submit"
                              className="w-100 fw-bold mb-3"
                              disabled={loading}
                            >
                              {loading ? 'Creating Account...' : 'Register'}
                            </Button>

                            <Button
                              variant="outline-secondary"
                              className="w-100 fw-bold"
                              onClick={() => {
                                setUserRegisterMode(false);
                                setError('');
                              }}
                            >
                              Back to Login
                            </Button>
                          </Form>
                        </>
                      ) : (
                        <>
                          <Form onSubmit={handleUserLogin}>
                            <Form.Group className="mb-4">
                              <Form.Label className="fw-bold mb-2">
                                <i className="fas fa-user me-2"></i> Username
                              </Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Enter username"
                                value={userUsername}
                                onChange={(e) => setUserUsername(e.target.value)}
                                required
                                className="form-control-lg"
                              />
                            </Form.Group>

                            <Form.Group className="mb-4">
                              <Form.Label className="fw-bold mb-2">
                                <i className="fas fa-lock me-2"></i> Password
                              </Form.Label>
                              <Form.Control
                                type="password"
                                placeholder="Enter password"
                                value={userPassword}
                                onChange={(e) => setUserPassword(e.target.value)}
                                required
                                className="form-control-lg"
                              />
                            </Form.Group>

                            <Button
                              variant="primary"
                              type="submit"
                              className="w-100 fw-bold py-2 mb-3"
                              size="lg"
                              disabled={loading}
                            >
                              {loading ? <span><i className="fas fa-spinner fa-spin me-2"></i>Logging in...</span> : 'Login as User'}
                            </Button>
                          </Form>

                          <div className="text-center">
                            <p className="text-muted mb-0">Don't have an account?</p>
                            <Button
                              variant="link"
                              className="text-primary fw-bold text-decoration-none p-0"
                              onClick={() => {
                                setUserRegisterMode(true);
                                setError('');
                              }}
                            >
                              Register here
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </Tab.Pane>

                  {/* POLICE LOGIN / REGISTER */}
                  <Tab.Pane eventKey="police">
                    <div className="p-5">
                      {policeRegisterMode ? (
                        <>
                          <h5 className="mb-4 fw-bold">Police Officer Registration</h5>
                          <Form onSubmit={handlePoliceRegister}>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-bold">Username</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Enter username"
                                value={policeRegisterData.username}
                                onChange={(e) => setPoliceRegisterData({
                                  ...policeRegisterData,
                                  username: e.target.value
                                })}
                                required
                              />
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label className="fw-bold">Email</Form.Label>
                              <Form.Control
                                type="email"
                                placeholder="Enter email"
                                value={policeRegisterData.email}
                                onChange={(e) => setPoliceRegisterData({
                                  ...policeRegisterData,
                                  email: e.target.value
                                })}
                                required
                              />
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label className="fw-bold">Phone</Form.Label>
                              <Form.Control
                                type="tel"
                                placeholder="Enter phone number"
                                value={policeRegisterData.phone}
                                onChange={(e) => setPoliceRegisterData({
                                  ...policeRegisterData,
                                  phone: e.target.value
                                })}
                              />
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label className="fw-bold">Police Station</Form.Label>
                              <Form.Select
                                value={policeRegisterData.station_id}
                                onChange={(e) => setPoliceRegisterData({
                                  ...policeRegisterData,
                                  station_id: e.target.value
                                })}
                                required
                                disabled={stationsLoading}
                              >
                                <option value="">{stationsLoading ? 'Loading stations...' : '-- Select Police Station --'}</option>
                                {policeStations.map((station) => {
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

                            <Form.Group className="mb-3">
                              <Form.Label className="fw-bold">Password</Form.Label>
                              <Form.Control
                                type="password"
                                placeholder="Enter password"
                                value={policeRegisterData.password}
                                onChange={(e) => setPoliceRegisterData({
                                  ...policeRegisterData,
                                  password: e.target.value
                                })}
                                required
                              />
                            </Form.Group>

                            <Form.Group className="mb-4">
                              <Form.Label className="fw-bold">Confirm Password</Form.Label>
                              <Form.Control
                                type="password"
                                placeholder="Confirm password"
                                value={policeRegisterData.confirmPassword}
                                onChange={(e) => setPoliceRegisterData({
                                  ...policeRegisterData,
                                  confirmPassword: e.target.value
                                })}
                                required
                              />
                            </Form.Group>

                            <Button
                              variant="success"
                              type="submit"
                              className="w-100 fw-bold mb-3"
                              disabled={loading}
                            >
                              {loading ? 'Creating Account...' : 'Register'}
                            </Button>

                            <Button
                              variant="outline-secondary"
                              className="w-100 fw-bold"
                              onClick={() => {
                                setPoliceRegisterMode(false);
                                setError('');
                              }}
                            >
                              Back to Login
                            </Button>
                          </Form>
                        </>
                      ) : (
                        <>
                          <Form onSubmit={handlePoliceLogin}>
                            <Form.Group className="mb-4">
                              <Form.Label className="fw-bold mb-2">
                                <i className="fas fa-user me-2"></i> Username
                              </Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Enter police username"
                                value={policeUsername}
                                onChange={(e) => setPoliceUsername(e.target.value)}
                                required
                                className="form-control-lg"
                              />
                            </Form.Group>

                            <Form.Group className="mb-4">
                              <Form.Label className="fw-bold mb-2">
                                <i className="fas fa-lock me-2"></i> Password
                              </Form.Label>
                              <Form.Control
                                type="password"
                                placeholder="Enter password"
                                value={policePassword}
                                onChange={(e) => setPolicePassword(e.target.value)}
                                required
                                className="form-control-lg"
                              />
                            </Form.Group>

                            <Form.Group className="mb-4">
                              <Form.Label className="fw-bold mb-2">
                                <i className="fas fa-building me-2"></i> Police Station
                              </Form.Label>
                              <Form.Select
                                value={selectedStation}
                                onChange={(e) => setSelectedStation(e.target.value)}
                                required
                                className="form-select-lg"
                                disabled={stationsLoading}
                              >
                                <option value="">{stationsLoading ? 'Loading stations...' : '-- Select Police Station --'}</option>
                                {policeStations.map((station) => {
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

                            <Button
                              variant="primary"
                              type="submit"
                              className="w-100 fw-bold py-2 mb-3"
                              size="lg"
                              disabled={loading || !selectedStation}
                            >
                              {loading ? <span><i className="fas fa-spinner fa-spin me-2"></i>Logging in...</span> : 'Login as Police Officer'}
                            </Button>
                          </Form>

                          <div className="text-center">
                            <p className="text-muted mb-0">Don't have an account?</p>
                            <Button
                              variant="link"
                              className="text-primary fw-bold text-decoration-none p-0"
                              onClick={() => {
                                setPoliceRegisterMode(true);
                                setError('');
                              }}
                            >
                              Register here
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
