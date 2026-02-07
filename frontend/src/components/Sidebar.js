import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/sidebar.css';

const Sidebar = ({ userRole = 'Admin' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  const isActive = (path) => location.pathname === path;

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/admin/criminals', label: 'Manage Criminals', icon: 'fas fa-user-secret' },
    { path: '/admin/police', label: 'Manage Police', icon: 'fas fa-users-cog' },
    { path: '/admin/stations', label: 'Manage Stations', icon: 'fas fa-building' },
    { path: '/admin/firs', label: 'FIR Management', icon: 'fas fa-file-alt' },
    { path: '/admin/crime-analysis', label: 'Crime Analysis', icon: 'fas fa-chart-bar' },
    { path: '/admin/profile', label: 'My Profile', icon: 'fas fa-user-circle' },
    { path: '/change-password', label: 'Change Password', icon: 'fas fa-key' },
  ];

  const policeMenuItems = [
    { path: '/police/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/police/firs/sent', label: 'New FIRs', icon: 'fas fa-inbox' },
    { path: '/police/firs/approved', label: 'Approved FIRs', icon: 'fas fa-check-circle' },
    { path: '/police/firs/rejected', label: 'Rejected FIRs', icon: 'fas fa-times-circle' },
    { path: '/police/profile', label: 'My Profile', icon: 'fas fa-user-circle' },
    { path: '/change-password', label: 'Change Password', icon: 'fas fa-key' },
  ];

  const userMenuItems = [
    { path: '/user/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/fir/form', label: 'File New FIR', icon: 'fas fa-file-invoice' },
    { path: '/fir/list', label: 'My FIRs', icon: 'fas fa-list' },
    { path: '/profile', label: 'My Profile', icon: 'fas fa-user-circle' },
    { path: '/change-password', label: 'Change Password', icon: 'fas fa-key' },
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
          <h5 className="mb-0 text-white">
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

        {/* Sidebar Footer - Logout */}
        <div className="sidebar-footer">
          <Nav.Link
            onClick={() => {
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              localStorage.removeItem('station_id');
              navigate('/login');
            }}
            className="sidebar-link logout-link"
          >
            <i className="fas fa-sign-out-alt me-2"></i>
            <span>Logout</span>
          </Nav.Link>
        </div>
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
