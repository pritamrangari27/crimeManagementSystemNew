import React, { useState, useEffect, useRef } from 'react';
import { Nav, Modal, Button, Table, Badge, Form } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const popupRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const user = JSON.parse(localStorage.getItem('authUser'));
  const userRole = localStorage.getItem('userRole');

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  const isActive = (path) => location.pathname === path;

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/admin/criminals', label: 'Manage Criminals', icon: 'fas fa-user-secret' },
    { path: '/admin/police', label: 'Manage Police', icon: 'fas fa-users-cog' },
    { path: '/admin/stations', label: 'Manage Stations', icon: 'fas fa-building' },
    { path: '/admin/firs', label: 'FIR Management', icon: 'fas fa-file-alt' },
    { path: '/admin/crime-analysis', label: 'Crime Analysis', icon: 'fas fa-chart-bar' },
  ];

  const policeMenuItems = [
    { path: '/police/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/police/firs/sent', label: 'New FIRs', icon: 'fas fa-inbox' },
    { path: '/police/firs/approved', label: 'Approved FIRs', icon: 'fas fa-check-circle' },
    { path: '/police/firs/rejected', label: 'Rejected FIRs', icon: 'fas fa-times-circle' },
  ];

  const userMenuItems = [
    { path: '/user/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/fir/list', label: 'My FIRs', icon: 'fas fa-list' },
  ];

  const getMenuItems = () => {
    switch (userRole) {
      case 'Admin':
        return adminMenuItems;
      case 'Police':
        return policeMenuItems;
      case 'User':
        return userMenuItems;
      default:
        return adminMenuItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="sidebar-toggle-mobile d-lg-none">
        <button 
          className="btn btn-primary"
          onClick={() => setIsMobile(!isMobile)}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isMobile ? 'active' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <h5 className="mb-0">
            <i className="fas fa-shield-alt me-2"></i>
            Crime Management
          </h5>
        </div>

        {/* Sidebar Nav */}
        <Nav className="flex-column sidebar-nav">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsMobile(false);
              }}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <i className={`${item.icon} me-2`}></i>
              <span>{item.label}</span>
            </Nav.Link>
          ))}
        </Nav>

        {/* Sidebar Footer - User Profile Dropdown */}
        <div className="sidebar-footer" ref={popupRef}>
          <div className="sidebar-user-dropdown" style={{ paddingTop: '12px' }}>
            <Button
              variant="light"
              className="w-100 text-start fw-bold d-flex align-items-center justify-content-between"
              style={{ color: '#7c3aed', padding: '10px 12px' }}
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <span>
                <i className="fas fa-user me-2"></i>
                {user?.username}
              </span>
              <i className={`fas fa-chevron-down ${showUserDropdown ? 'rotate' : ''}`} style={{ fontSize: '0.85rem', transition: 'transform 0.2s' }}></i>
            </Button>

            {/* Popup Card at Bottom Left */}
            {showUserDropdown && (
              <div className="user-popup-card">
                <button
                  className="user-popup-button"
                  onClick={() => {
                    setShowProfileModal(true);
                    setShowUserDropdown(false);
                  }}
                >
                  <i className="fas fa-id-card"></i>
                  Profile
                </button>
                <button
                  className="user-popup-button logout"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to logout?')) {
                      localStorage.removeItem('authUser');
                      localStorage.removeItem('token');
                      localStorage.removeItem('userRole');
                      localStorage.removeItem('station_id');
                      setShowUserDropdown(false);
                      navigate('/login');
                    }
                  }}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Modal */}
        <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered size="md">
          <Modal.Header closeButton style={{ backgroundColor: '#0ea5e9', borderColor: '#0284c7', padding: '12px 16px' }}>
            <Modal.Title style={{ color: 'white', fontSize: '1.1rem' }}>
              <i className="fas fa-id-card me-2"></i>
              My Profile
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: '20px' }}>
            {isEditingProfile ? (
              // Edit Form
              <div>
                <Form>
                  <Form.Group className="mb-2">
                    <Form.Label className="fw-bold" style={{ fontSize: '0.9rem' }}>
                      <i className="fas fa-user me-2" style={{ color: '#0ea5e9' }}></i>Username
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={editFormData.username || user?.username || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                      className="border-2"
                      size="sm"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label className="fw-bold" style={{ fontSize: '0.9rem' }}>
                      <i className="fas fa-envelope me-2" style={{ color: '#0ea5e9' }}></i>Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={editFormData.email || user?.email || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="border-2"
                      size="sm"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label className="fw-bold" style={{ fontSize: '0.9rem' }}>
                      <i className="fas fa-phone me-2" style={{ color: '#0ea5e9' }}></i>Phone Number
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      value={editFormData.phone || user?.phone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="border-2"
                      size="sm"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </Form.Group>

                  {userRole === 'User' && (
                    <Form.Group className="mb-2">
                      <Form.Label className="fw-bold" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-map-marker-alt me-2" style={{ color: '#0ea5e9' }}></i>Address
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={editFormData.address || user?.address || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                        placeholder="Enter your address"
                        className="border-2"
                        style={{ borderColor: '#e0e0e0', fontSize: '0.9rem' }}
                      />
                    </Form.Group>
                  )}

                  {userRole === 'Admin' && (
                    <Form.Group className="mb-2">
                      <Form.Label className="fw-bold" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-building me-2" style={{ color: '#0ea5e9' }}></i>Department
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={editFormData.department || user?.department || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                        placeholder="Enter your department"
                        className="border-2"
                        size="sm"
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </Form.Group>
                  )}
                </Form>
              </div>
            ) : (
              // View Mode
              <>
                {/* Profile Header with Avatar */}
                <div style={{ textAlign: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #e0e0e0' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#0ea5e9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: 'white',
                      border: '3px solid white',
                      boxShadow: '0 2px 8px rgba(14, 165, 233, 0.2)'
                    }}
                  >
                    {user?.username?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U'}
                  </div>
                  <h5 style={{ margin: '0 0 2px 0', fontWeight: 'bold', color: '#1a1a1a', fontSize: '1rem' }}>
                    {user?.username}
                  </h5>
                  <p style={{ margin: '0', fontSize: '0.85rem', color: '#666' }}>
                    <i className="fas fa-envelope me-1" style={{ color: '#0ea5e9' }}></i>
                    {user?.email}
                  </p>
                </div>

                {/* Status Badges */}
                <div style={{ textAlign: 'center', marginBottom: '10px', fontsize: '0.85rem' }}>
                  {userRole === 'User' && (
                    <>
                      <Badge bg="light" text="dark" className="me-1" style={{ fontSize: '0.75rem', padding: '4px 6px' }}>
                        <i className="fas fa-user me-1"></i>User
                      </Badge>
                      <Badge bg="success" text="dark" style={{ fontSize: '0.75rem', padding: '4px 6px' }}>
                        <i className="fas fa-check-circle me-1"></i>Verified
                      </Badge>
                    </>
                  )}
                  {userRole === 'Admin' && (
                    <>
                      <Badge bg="light" text="dark" className="me-1" style={{ fontSize: '0.75rem', padding: '4px 6px' }}>
                        <i className="fas fa-crown me-1"></i>Admin
                      </Badge>
                      <Badge bg="success" text="dark" style={{ fontSize: '0.75rem', padding: '4px 6px' }}>
                        <i className="fas fa-check-circle me-1"></i>Active
                      </Badge>
                    </>
                  )}
                  {userRole === 'Police' && (
                    <>
                      <Badge bg="light" text="dark" className="me-1" style={{ fontSize: '0.75rem', padding: '4px 6px' }}>
                        <i className="fas fa-id-badge me-1"></i>Badge: {user?.badge_number || 'N/A'}
                      </Badge>
                      <Badge bg="success" text="dark" style={{ fontSize: '0.75rem', padding: '4px 6px' }}>
                        <i className="fas fa-check-circle me-1"></i>On Duty
                      </Badge>
                    </>
                  )}
                </div>

                {/* Profile Information Table */}
                <Table borderless responsive style={{ fontSize: '0.85rem', marginBottom: '0' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ width: '40%', paddingBottom: '6px', paddingTop: '4px', fontWeight: 'bold' }}>
                        <i className="fas fa-user me-1" style={{ color: '#0ea5e9' }}></i>Username
                      </td>
                      <td style={{ paddingBottom: '6px', paddingTop: '4px' }}>{user?.username}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ paddingBottom: '6px', paddingTop: '4px', fontWeight: 'bold' }}>
                        <i className="fas fa-envelope me-1" style={{ color: '#0ea5e9' }}></i>Email
                      </td>
                      <td style={{ paddingBottom: '6px', paddingTop: '4px' }}>{user?.email}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ paddingBottom: '6px', paddingTop: '4px', fontWeight: 'bold' }}>
                        <i className="fas fa-phone me-1" style={{ color: '#0ea5e9' }}></i>Phone
                      </td>
                      <td style={{ paddingBottom: '6px', paddingTop: '4px' }}>
                        {user?.phone || <span style={{ color: '#999' }}>N/A</span>}
                      </td>
                    </tr>
                    {userRole === 'User' && (
                      <tr>
                        <td style={{ paddingTop: '4px', fontWeight: 'bold' }}>
                          <i className="fas fa-map-marker-alt me-1" style={{ color: '#0ea5e9' }}></i>Address
                        </td>
                        <td style={{ paddingTop: '4px' }}>
                          {user?.address || <span style={{ color: '#999' }}>N/A</span>}
                        </td>
                      </tr>
                    )}
                    {userRole === 'Admin' && (
                      <tr>
                        <td style={{ paddingTop: '4px', fontWeight: 'bold' }}>
                          <i className="fas fa-building me-1" style={{ color: '#0ea5e9' }}></i>Department
                        </td>
                        <td style={{ paddingTop: '4px' }}>
                          {user?.department || <span style={{ color: '#999' }}>N/A</span>}
                        </td>
                      </tr>
                    )}
                    {userRole === 'Police' && (
                      <tr>
                        <td style={{ paddingTop: '4px', fontWeight: 'bold' }}>
                          <i className="fas fa-id-badge me-1" style={{ color: '#0ea5e9' }}></i>Badge
                        </td>
                        <td style={{ paddingTop: '4px' }}>
                          {user?.badge_number || 'N/A'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </>
            )}
          </Modal.Body>
          <Modal.Footer style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '12px 16px', borderTop: '1px solid #e0e0e0' }}>
            {isEditingProfile ? (
              <>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => {
                    setIsEditingProfile(false);
                    setEditFormData({});
                  }}
                >
                  <i className="fas fa-times me-2"></i>Cancel
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => {
                    // Update localStorage with new data
                    const updatedUser = {
                      ...user,
                      ...editFormData
                    };
                    localStorage.setItem('authUser', JSON.stringify(updatedUser));
                    setIsEditingProfile(false);
                    setEditFormData({});
                    // Optional: Show success message
                    alert('Profile updated successfully!');
                  }}
                >
                  <i className="fas fa-save me-2"></i>Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => {
                    setIsEditingProfile(true);
                    setEditFormData({
                      username: user?.username || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      address: user?.address || '',
                      department: user?.department || ''
                    });
                  }}
                >
                  <i className="fas fa-edit me-2"></i>Edit Info
                </Button>
                <Button 
                  variant="info" 
                  size="sm" 
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowChangePasswordModal(true);
                    setPasswordFormData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setPasswordError('');
                  }}
                >
                  <i className="fas fa-key me-2"></i>Change Password
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal>

        {/* Change Password Modal */}
        <Modal 
          show={showChangePasswordModal} 
          onHide={() => {
            setShowChangePasswordModal(false);
            setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordError('');
          }}
          centered
          backdrop="static"
        >
          <Modal.Header closeButton style={{ borderBottom: '1px solid #e0e0e0' }}>
            <Modal.Title style={{ color: '#0ea5e9', fontWeight: 'bold' }}>
              <i className="fas fa-key me-2"></i>Change Password
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: '20px' }}>
            {passwordError && (
              <div className="alert alert-danger" role="alert">
                <i className="fas fa-exclamation-circle me-2"></i>{passwordError}
              </div>
            )}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 'bold', color: '#1a1a1a' }}>
                  <i className="fas fa-lock me-2" style={{ color: '#0ea5e9' }}></i>Current Password
                </Form.Label>
                <Form.Control 
                  type="password"
                  placeholder="Enter your current password"
                  value={passwordFormData.currentPassword}
                  onChange={(e) => {
                    setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value });
                    setPasswordError('');
                  }}
                  style={{ 
                    borderColor: passwordError ? '#ef4444' : '#e0e0e0',
                    borderRadius: '0.5rem'
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 'bold', color: '#1a1a1a' }}>
                  <i className="fas fa-key me-2" style={{ color: '#0ea5e9' }}></i>New Password
                </Form.Label>
                <Form.Control 
                  type="password"
                  placeholder="Enter your new password"
                  value={passwordFormData.newPassword}
                  onChange={(e) => {
                    setPasswordFormData({ ...passwordFormData, newPassword: e.target.value });
                    setPasswordError('');
                  }}
                  style={{ 
                    borderColor: passwordError ? '#ef4444' : '#e0e0e0',
                    borderRadius: '0.5rem'
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 'bold', color: '#1a1a1a' }}>
                  <i className="fas fa-lock me-2" style={{ color: '#0ea5e9' }}></i>Confirm Password
                </Form.Label>
                <Form.Control 
                  type="password"
                  placeholder="Confirm your new password"
                  value={passwordFormData.confirmPassword}
                  onChange={(e) => {
                    setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value });
                    setPasswordError('');
                  }}
                  style={{ 
                    borderColor: passwordError ? '#ef4444' : '#e0e0e0',
                    borderRadius: '0.5rem'
                  }}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer style={{ display: 'flex', gap: '8px', justifyContent: 'center', borderTop: '1px solid #e0e0e0' }}>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {
                setShowChangePasswordModal(false);
                setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordError('');
              }}
            >
              <i className="fas fa-times me-2"></i>Cancel
            </Button>
            <Button 
              variant="success" 
              size="sm"
              onClick={() => {
                // Validation
                if (!passwordFormData.currentPassword) {
                  setPasswordError('Current password is required');
                  return;
                }
                if (!passwordFormData.newPassword) {
                  setPasswordError('New password is required');
                  return;
                }
                if (passwordFormData.newPassword.length < 6) {
                  setPasswordError('New password must be at least 6 characters');
                  return;
                }
                if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
                  setPasswordError('Passwords do not match');
                  return;
                }
                
                // Simulate password update (in real app, call API)
                alert('Password changed successfully!');
                setShowChangePasswordModal(false);
                setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordError('');
              }}
            >
              <i className="fas fa-save me-2"></i>Update Password
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      {/* Overlay for mobile */}
      {isMobile && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobile(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
