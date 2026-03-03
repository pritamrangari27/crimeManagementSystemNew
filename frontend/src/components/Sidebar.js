import React, { useState, useEffect, useRef } from 'react';
import { Nav, Modal, Button, Table, Badge, Form } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, getUserRole, clearAuth, updateAuthUser } from '../utils/authService';
import { dashboardAPI } from '../api/client';
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
  const user = getCurrentUser();
  const userRole = getUserRole();
  const [activities, setActivities] = useState([]);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [actSlideIndex, setActSlideIndex] = useState(0);

  // Fetch recent activities for Admin
  useEffect(() => {
    if (userRole !== 'Admin') return;

    const fetchActivities = async () => {
      try {
        const response = await dashboardAPI.getActivity(15);
        if (response.data.status === 'success') {
          setActivities(response.data.activities || []);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, [userRole]);

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

        {/* Recent Activities - Admin Only */}
        {userRole === 'Admin' && (
          <div className="sidebar-activities">
            <div className="sidebar-activities-header">
              <i className="fas fa-history me-2"></i>
              <span>Recent Activities</span>
              {activities.length > 0 && (
                <button
                  className="view-all-btn"
                  onClick={() => { setActSlideIndex(0); setShowActivitiesModal(true); }}
                >
                  View All
                </button>
              )}
            </div>
            <div className="sidebar-activities-list">
              {activities.length > 0 ? (
                activities.slice(0, 2).map((activity, idx) => (
                  <div key={idx} className="sidebar-activity-item">
                    <div className="activity-icon-small">
                      <i className={activity.icon || 'fas fa-info-circle'}></i>
                    </div>
                    <div className="activity-details">
                      <p className="activity-action">{activity.action}</p>
                      <p className="activity-desc">{activity.description}</p>
                      <span className="activity-time">
                        <i className="fas fa-clock me-1"></i>{activity.timestamp}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-3" style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                  <i className="fas fa-inbox mb-2" style={{ fontSize: '1.2rem', opacity: 0.4 }}></i>
                  <p className="mb-0">No recent activities</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activities Slider Modal */}
        <Modal show={showActivitiesModal} onHide={() => setShowActivitiesModal(false)} centered size="md" dialogClassName="activities-modal">
          <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderBottom: 'none', padding: '14px 20px' }}>
            <Modal.Title style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>
              <i className="fas fa-history me-2" style={{ color: '#10b981' }}></i>
              Recent Activities
              <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '2px 10px', borderRadius: '12px', fontSize: '0.72rem', marginLeft: '10px', fontWeight: 600 }}>
                {actSlideIndex + 1} / {activities.length}
              </span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: '#f8fafc', padding: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
            {activities.length > 0 && (
              <>
                <div style={{ overflow: 'hidden', width: '100%' }}>
                  <div style={{
                    display: 'flex',
                    transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
                    transform: `translateX(-${actSlideIndex * 100}%)`
                  }}>
                    {activities.map((activity, idx) => (
                      <div key={idx} style={{ minWidth: '100%', padding: '32px 48px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: '360px' }}>
                          <div style={{
                            width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white', fontSize: '1.4rem', marginBottom: '16px',
                            boxShadow: '0 6px 20px rgba(16,185,129,0.35)'
                          }}>
                            <i className={activity.icon || 'fas fa-info-circle'}></i>
                          </div>
                          <h6 className="mb-2 fw-bold" style={{ color: '#0f172a', fontSize: '1.05rem' }}>{activity.action}</h6>
                          <p className="mb-3" style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.5 }}>{activity.description}</p>
                          <span style={{ background: '#e2e8f0', color: '#64748b', padding: '4px 14px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500 }}>
                            <i className="fas fa-clock me-1"></i>{activity.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {activities.length > 1 && (
                  <>
                    <button onClick={() => setActSlideIndex((actSlideIndex - 1 + activities.length) % activities.length)} style={{
                      position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)',
                      width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #10b981',
                      background: 'rgba(255,255,255,0.95)', color: '#10b981', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem',
                      zIndex: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.2s'
                    }}>
                      <i className="fas fa-arrow-left"></i>
                    </button>
                    <button onClick={() => setActSlideIndex((actSlideIndex + 1) % activities.length)} style={{
                      position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)',
                      width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #10b981',
                      background: 'rgba(255,255,255,0.95)', color: '#10b981', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem',
                      zIndex: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.2s'
                    }}>
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </>
                )}
              </>
            )}
            {activities.length === 0 && (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 20px' }}>
                <i className="fas fa-inbox fa-2x mb-3" style={{ opacity: 0.5 }}></i>
                <p className="mb-0" style={{ fontSize: '0.9rem' }}>No activities in the last 1 hour</p>
              </div>
            )}
          </Modal.Body>
          {activities.length > 1 && (
            <Modal.Footer style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'center', padding: '10px', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {activities.map((_, idx) => (
                  <button key={idx} onClick={() => setActSlideIndex(idx)} style={{
                    width: actSlideIndex === idx ? '22px' : '8px', height: '8px', borderRadius: '4px',
                    border: 'none', background: actSlideIndex === idx ? '#10b981' : '#cbd5e1',
                    cursor: 'pointer', transition: 'all 0.3s ease', padding: 0
                  }} />
                ))}
              </div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
                <i className="fas fa-clock me-1" style={{ fontSize: '0.6rem' }}></i>
                All activities in last 1 hour
              </span>
            </Modal.Footer>
          )}
          {activities.length <= 1 && (
            <Modal.Footer style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'center', padding: '10px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
                <i className="fas fa-clock me-1" style={{ fontSize: '0.6rem' }}></i>
                All activities in last 1 hour
              </span>
            </Modal.Footer>
          )}
        </Modal>

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
                      clearAuth();
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
        <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered size="md" dialogClassName="profile-modal">
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
                    // Update auth storage with new data
                    updateAuthUser(editFormData);
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
          dialogClassName="password-modal"
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
