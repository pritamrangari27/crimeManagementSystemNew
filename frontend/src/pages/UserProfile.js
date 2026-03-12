import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getUserRole, updateAuthUser } from '../utils/authService';
import { authAPI } from '../api/client';
import Sidebar from '../components/Sidebar';
import ChangePasswordModal from '../components/ChangePasswordModal';
import EditProfileModal from '../components/EditProfileModal';
import '../styles/forms.css';
import '../styles/mobile-profile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const role = getUserRole();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const refreshUserData = async () => {
    setRefreshing(true);
    try {
      const response = await authAPI.currentUser();
      if (response.data.status === 'success') {
        const freshUser = response.data.user;
        updateAuthUser(freshUser);
        // silently refreshed
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
      setError('Failed to refresh profile from database');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user || !role) { navigate('/login', { replace: true }); return; }
    if (role !== 'User') { navigate('/user/dashboard', { replace: true }); return; }
    refreshUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInitials = () =>
    (user?.username || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  if (!user || !role) {
    return <div className="text-center py-5">Verifying authentication...</div>;
  }

  const infoItemStyle = {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 14px', borderRadius: '10px',
    background: '#f8fafc', border: '1px solid #e2e8f0',
    transition: 'all 0.25s ease',
  };
  const iconCircleStyle = (color) => ({
    width: 34, height: 34, borderRadius: '50%',
    background: `${color}15`, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, color, fontSize: '0.85rem',
  });

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
      <Container fluid className="mgmt-container" style={{ background: '#ffffff' }}>
        {/* ── Page header ── */}
        <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap"
          style={{ animation: 'fadeIn 0.35s cubic-bezier(.4,0,.2,1) both' }}>
          <div>
            <h2 className="fw-bold mb-0" style={{ color: '#1a1a1a', fontSize: '1.3rem' }}>
              <i className="fas fa-user-circle me-2" style={{ color: '#0ea5e9' }}></i>My Profile
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>Manage your account settings and personal information</p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" size="sm" onClick={refreshUserData} disabled={refreshing} className="fw-bold">
              {refreshing ? <><Spinner as="span" animation="border" size="sm" className="me-1" />Refreshing...</>
                : <><i className="fas fa-sync-alt me-1"></i>Refresh</>}
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)} className="fw-bold">
              <i className="fas fa-arrow-left me-1"></i>Back
            </Button>
          </div>
        </div>

        {/* ── Alerts ── */}
        {error && <Alert variant="danger" dismissible onClose={() => setError('')} className="py-2 mb-2" style={{ fontSize: '0.85rem', animation: 'fadeInDown 0.3s ease both' }}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')} className="py-2 mb-2" style={{ fontSize: '0.85rem', animation: 'fadeInDown 0.3s ease both' }}>{success}</Alert>}

        {/* ── Unified profile card ── */}
        <Card className="border-0 overflow-hidden" style={{ borderRadius: '16px', boxShadow: '0 4px 24px rgba(14,165,233,0.10)', animation: 'fadeInUp 0.45s cubic-bezier(.4,0,.2,1) both' }}>
          {/* ── Gradient banner + avatar ── */}
          <div style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)', padding: '28px 28px 48px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'absolute', bottom: -20, left: '40%', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <div className="d-flex align-items-center gap-3 position-relative" style={{ zIndex: 1 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: '3px solid rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 700, color: '#fff', flexShrink: 0, animation: 'scaleIn 0.5s cubic-bezier(.34,1.56,.64,1) 0.15s both' }}>
                {getInitials()}
              </div>
              <div className="text-white">
                <h4 className="fw-bold mb-1" style={{ fontSize: '1.2rem', letterSpacing: '-0.3px' }}>{user?.username}</h4>
                <span style={{ opacity: 0.85, fontSize: '0.82rem' }}><i className="fas fa-envelope me-1"></i> {user?.email}</span>
                <div className="d-flex gap-2 mt-2 flex-wrap">
                  <Badge pill style={{ background: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', padding: '5px 10px' }}>
                    <i className="fas fa-user me-1"></i> Active User
                  </Badge>
                  <Badge pill bg="success" style={{ fontSize: '0.72rem', padding: '5px 10px' }}>
                    <i className="fas fa-check-circle me-1"></i> Verified
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* ── Card body ── */}
          <Card.Body className="p-0" style={{ marginTop: '-20px', position: 'relative', zIndex: 2 }}>
            <div style={{ background: '#fff', borderRadius: '16px 16px 0 0', padding: '24px 28px 20px' }}>
              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                {[
                  { label: 'Username', value: user.username, icon: 'fas fa-user', color: '#0ea5e9' },
                  { label: 'Email', value: user.email, icon: 'fas fa-envelope', color: '#0ea5e9' },
                  { label: 'Phone', value: user.phone || <span style={{ color: '#94a3b8' }}>Not provided</span>, icon: 'fas fa-phone', color: '#10b981' },
                  { label: 'Address', value: user.address || <span style={{ color: '#94a3b8' }}>Not provided</span>, icon: 'fas fa-map-marker-alt', color: '#f59e0b' },
                  { label: 'Account Type', value: <Badge bg="info" style={{ fontSize: '0.72rem', padding: '3px 8px' }}><i className="fas fa-user me-1"></i>Regular User</Badge>, icon: 'fas fa-id-card', color: '#06b6d4' },
                  { label: 'Status', value: <Badge bg="success" style={{ fontSize: '0.72rem', padding: '3px 8px' }}><i className="fas fa-check-circle me-1"></i>Active</Badge>, icon: 'fas fa-heartbeat', color: '#10b981' },
                  { label: 'Member Since', value: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), icon: 'fas fa-calendar-check', color: '#f59e0b' },
                ].map((item, i) => (
                  <div key={i} style={{ ...infoItemStyle, animation: `fadeInUp 0.4s cubic-bezier(.4,0,.2,1) ${0.05 + i * 0.06}s both` }} className="profile-info-item">
                    <div style={iconCircleStyle(item.color)}><i className={item.icon}></i></div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="d-flex gap-2 flex-wrap mt-3 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                <Button size="sm" className="fw-bold px-3" onClick={() => setShowEditProfile(true)}
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', border: 'none', borderRadius: 8, fontSize: '0.82rem' }}>
                  <i className="fas fa-edit me-1"></i> Edit Profile
                </Button>
                <Button size="sm" className="fw-bold px-3" onClick={() => setShowChangePassword(true)}
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', borderRadius: 8, fontSize: '0.82rem' }}>
                  <i className="fas fa-key me-1"></i> Change Password
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        <style>{`
          .profile-info-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(14,165,233,0.10);
            border-color: #0ea5e9 !important;
          }
        `}</style>
      </Container>
      </div>

      {/* Modals */}
      <EditProfileModal
        show={showEditProfile}
        onHide={() => setShowEditProfile(false)}
        user={user}
        onSuccess={() => {
          refreshUserData();
          setSuccess('✓ Profile updated successfully!');
          setTimeout(() => setSuccess(''), 3000);
        }}
      />
      <ChangePasswordModal
        show={showChangePassword}
        onHide={() => setShowChangePassword(false)}
      />
    </>
  );
};

export default UserProfile;
