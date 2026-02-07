import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../api/client';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get auth data from localStorage
    const storedUser = localStorage.getItem('authUser');
    const storedRole = localStorage.getItem('userRole');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, [location]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data from localStorage
      localStorage.removeItem('authUser');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const isAdmin = userRole === 'Admin';
  const isPolice = userRole === 'Police';
  const isUser = userRole === 'User';

  return (
    <Navbar bg="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container fluid>
        <Navbar.Brand onClick={() => {
          if (isAdmin) navigate('/admin/dashboard');
          else if (isPolice) navigate('/police/dashboard');
          else navigate('/user/dashboard');
        }} style={{ cursor: 'pointer' }} className="fw-bold text-white">
          🚔 Crime Management System
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {isAdmin && (
              <>
                <Nav.Link onClick={() => navigate('/admin/dashboard')} className="text-light" style={{ cursor: 'pointer' }}>
                  Dashboard
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/admin/criminals')} className="text-light" style={{ cursor: 'pointer' }}>
                  Criminals
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/admin/police')} className="text-light" style={{ cursor: 'pointer' }}>
                  Police
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/admin/stations')} className="text-light" style={{ cursor: 'pointer' }}>
                  Stations
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/admin/firs')} className="text-light" style={{ cursor: 'pointer' }}>
                  FIRs
                </Nav.Link>
              </>
            )}

            {isPolice && (
              <>
                <Nav.Link onClick={() => navigate('/police/dashboard')} className="text-light" style={{ cursor: 'pointer' }}>
                  Dashboard
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/police/firs/sent')} className="text-light" style={{ cursor: 'pointer' }}>
                  My FIRs
                </Nav.Link>
              </>
            )}

            {isUser && (
              <>
                <Nav.Link onClick={() => navigate('/user/dashboard')} className="text-light" style={{ cursor: 'pointer' }}>
                  Dashboard
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/fir/form')} className="text-light" style={{ cursor: 'pointer' }}>
                  File FIR
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/fir/list')} className="text-light" style={{ cursor: 'pointer' }}>
                  My FIRs
                </Nav.Link>
              </>
            )}

            {user && userRole && (
              <Dropdown className="ms-3">
                <Dropdown.Toggle variant="success" id="dropdown-basic" className="text-white">
                  👤 {user.username || 'User'}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => {
                    if (isAdmin) navigate('/admin/profile');
                    else if (isPolice) navigate('/police/profile');
                    else navigate('/profile');
                  }} style={{ cursor: 'pointer' }}>
                    My Profile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate('/change-password')} style={{ cursor: 'pointer' }}>
                    Change Password
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger" style={{ cursor: 'pointer' }}>
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
