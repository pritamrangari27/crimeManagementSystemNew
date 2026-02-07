import React, { useState } from 'react';
import { Nav, Modal, Button, Table, Badge, Form } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const user = JSON.parse(localStorage.getItem('authUser'));
  const userRole = localStorage.getItem('userRole');

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
        <div className="sidebar-footer">
          <div className="sidebar-user-dropdown" style={{ borderTop: '1px solid #000000', paddingTop: '12px' }}>
            <Button
              variant="light"
              className="w-100 text-start fw-bold d-flex align-items-center justify-content-between"
              style={{ color: '#7c3aed', borderColor: '#7c3aed', padding: '10px 12px' }}
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <span>
                <i className="fas fa-user me-2"></i>
                {user?.username}
              </span>
              <i className={`fas fa-chevron-down ${showUserDropdown ? 'rotate' : ''}`} style={{ fontSize: '0.85rem', transition: 'transform 0.2s' }}></i>
            </Button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div 
                className="sidebar-dropdown-menu"
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '0.5rem',
                  marginTop: '8px',
                  border: '1px solid #e0e0e0',
                  overflow: 'hidden'
                }}
              >
                <Button
                  variant="link"
                  className="w-100 text-start py-2 px-3 fw-bold text-decoration-none"
                  style={{ color: '#7c3aed', fontSize: '0.95rem' }}
                  onClick={() => {
                    setShowProfileModal(true);
                    setShowUserDropdown(false);
                  }}
                >
                  <i className="fas fa-id-card me-2"></i>
                  Profile
                </Button>
                <div style={{ borderTop: '1px solid #e0e0e0' }}></div>
                <Button
                  variant="link"
                  className="w-100 text-start py-2 px-3 fw-bold text-decoration-none text-danger"
                  style={{ fontSize: '0.95rem' }}
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
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Modal */}
        <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered size="lg">
          <Modal.Header closeButton style={{ backgroundColor: '#0ea5e9', borderColor: '#0284c7' }}>
            <Modal.Title style={{ color: 'white' }}>
              <i className="fas fa-id-card me-2"></i>
              My Profile
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: '24px' }}>
            {isEditingProfile ? (
              // Edit Form
              <div>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      <i className="fas fa-user me-2" style={{ color: '#0ea5e9' }}></i>Username
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={editFormData.username || user?.username || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                      className="border-2"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      <i className="fas fa-envelope me-2" style={{ color: '#0ea5e9' }}></i>Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={editFormData.email || user?.email || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="border-2"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      <i className="fas fa-phone me-2" style={{ color: '#0ea5e9' }}></i>Phone Number
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      value={editFormData.phone || user?.phone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="border-2"
                      style={{ borderColor: '#e0e0e0' }}
                    />
                  </Form.Group>

                  {userRole === 'User' && (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">
                        <i className="fas fa-map-marker-alt me-2" style={{ color: '#0ea5e9' }}></i>Address
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editFormData.address || user?.address || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                        placeholder="Enter your address"
                        className="border-2"
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </Form.Group>
                  )}

                  {userRole === 'Admin' && (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">
                        <i className="fas fa-building me-2" style={{ color: '#0ea5e9' }}></i>Department
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={editFormData.department || user?.department || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                        placeholder="Enter your department"
                        className="border-2"
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
                <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #e0e0e0' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: '#0ea5e9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: 'white',
                      border: '4px solid white',
                      boxShadow: '0 2px 8px rgba(14, 165, 233, 0.2)'
                    }}
                  >
                    {user?.username?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U'}
                  </div>
                  <h5 style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#1a1a1a' }}>
                    {user?.username}
                  </h5>
                  <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                    <i className="fas fa-envelope me-2" style={{ color: '#0ea5e9' }}></i>
                    {user?.email}
                  </p>
                </div>

                {/* Status Badges */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  {userRole === 'User' && (
                    <>
                      <Badge bg="light" text="dark" className="me-2 p-2" style={{ fontSize: '0.85rem' }}>
                        <i className="fas fa-user me-1"></i> Active User
                      </Badge>
                      <Badge bg="success" text="dark" className="p-2" style={{ fontSize: '0.85rem' }}>
                        <i className="fas fa-check-circle me-1"></i> Verified
                      </Badge>
                    </>
                  )}
                  {userRole === 'Admin' && (
                    <>
                      <Badge bg="light" text="dark" className="me-2 p-2" style={{ fontSize: '0.85rem' }}>
                        <i className="fas fa-crown me-1"></i> Administrator
                      </Badge>
                      <Badge bg="success" text="dark" className="p-2" style={{ fontSize: '0.85rem' }}>
                        <i className="fas fa-check-circle me-1"></i> Active
                      </Badge>
                    </>
                  )}
                  {userRole === 'Police' && (
                    <>
                      <Badge bg="light" text="dark" className="me-2 p-2" style={{ fontSize: '0.85rem' }}>
                        <i className="fas fa-id-badge me-1"></i> Badge: {user?.badge_number || 'N/A'}
                      </Badge>
                      <Badge bg="success" text="dark" className="p-2" style={{ fontSize: '0.85rem' }}>
                        <i className="fas fa-check-circle me-1"></i> On Duty
                      </Badge>
                    </>
                  )}
                </div>

                {/* Profile Information Table */}
                <Table borderless responsive style={{ fontSize: '0.9rem', marginBottom: '0' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ width: '40%', paddingBottom: '12px', paddingTop: '8px', fontWeight: 'bold' }}>
                        <i className="fas fa-user me-2" style={{ color: '#0ea5e9' }}></i>Username
                      </td>
                      <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>{user?.username}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ paddingBottom: '12px', paddingTop: '8px', fontWeight: 'bold' }}>
                        <i className="fas fa-envelope me-2" style={{ color: '#0ea5e9' }}></i>Email
                      </td>
                      <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>{user?.email}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ paddingBottom: '12px', paddingTop: '8px', fontWeight: 'bold' }}>
                        <i className="fas fa-phone me-2" style={{ color: '#0ea5e9' }}></i>Phone Number
                      </td>
                      <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                        {user?.phone || <span style={{ color: '#999' }}>Not provided</span>}
                      </td>
                    </tr>
                    {userRole === 'User' && (
                      <tr>
                        <td style={{ paddingTop: '8px', fontWeight: 'bold' }}>
                          <i className="fas fa-map-marker-alt me-2" style={{ color: '#0ea5e9' }}></i>Address
                        </td>
                        <td style={{ paddingTop: '8px' }}>
                          {user?.address || <span style={{ color: '#999' }}>Not provided</span>}
                        </td>
                      </tr>
                    )}
                    {userRole === 'Admin' && (
                      <tr>
                        <td style={{ paddingTop: '8px', fontWeight: 'bold' }}>
                          <i className="fas fa-building me-2" style={{ color: '#0ea5e9' }}></i>Department
                        </td>
                        <td style={{ paddingTop: '8px' }}>
                          {user?.department || <span style={{ color: '#999' }}>Not provided</span>}
                        </td>
                      </tr>
                    )}
                    {userRole === 'Police' && (
                      <tr>
                        <td style={{ paddingTop: '8px', fontWeight: 'bold' }}>
                          <i className="fas fa-id-badge me-2" style={{ color: '#0ea5e9' }}></i>Badge Number
                        </td>
                        <td style={{ paddingTop: '8px' }}>
                          {user?.badge_number || 'N/A'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </>
            )}
          </Modal.Body>
          <Modal.Footer style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
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
                    navigate('/change-password');
                  }}
                >
                  <i className="fas fa-key me-2"></i>Change Password
                </Button>
              </>
            )}
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
