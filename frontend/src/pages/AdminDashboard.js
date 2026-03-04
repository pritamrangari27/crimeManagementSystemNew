import React, { useEffect, useState } from 'react';
import { Container, Button, Modal, Table, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../api/client';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import '../styles/dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPolice: 0,
    totalCriminals: 0,
    totalStations: 0,
    totalFIRs: 0,
    pendingFIRs: 0,
    approvedFIRs: 0,
    rejectedFIRs: 0
  });
  const [loading, setLoading] = useState(true);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getStats();
        if (response.data.status === 'success') {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const handleShowRecentActivities = async () => {
    setShowActivitiesModal(true);
    setActivitiesLoading(true);
    try {
      const response = await dashboardAPI.getActivity(10, '1hour');
      if (response.data.status === 'success') {
        setActivities(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="with-sidebar d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Police Officers', value: stats.totalPolice, icon: 'fas fa-users-cog', color: '#10b981', bg: 'rgba(16,185,129,0.10)' },
    { label: 'Total Criminals',       value: stats.totalCriminals, icon: 'fas fa-user-secret', color: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
    { label: 'Total Stations',        value: stats.totalStations,  icon: 'fas fa-building',    color: '#06b6d4', bg: 'rgba(6,182,212,0.10)' },
    { label: 'Total FIRs',            value: stats.totalFIRs,      icon: 'fas fa-file-alt',    color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  ];

  const statusCards = [
    { label: 'Approved FIRs', value: stats.approvedFIRs, color: '#10b981', route: '/admin/firs?status=Approved', variant: 'success' },
    { label: 'Sent FIRs',     value: stats.pendingFIRs,  color: '#06b6d4', route: '/admin/firs?status=Sent',     variant: 'info',    pulse: true },
    { label: 'Rejected FIRs', value: stats.rejectedFIRs, color: '#ef4444', route: '/admin/firs?status=Rejected', variant: 'danger',  pulse: stats.rejectedFIRs > 0 },
  ];

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
        <Container fluid className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'calc(100vh - var(--banner-height, 38px) - 50px)' }}>
          <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto' }}>

            {/* ── Header ── */}
            <div className="dash-header">
              <div>
                <h2><i className="fas fa-chart-line me-2" style={{ color: '#10b981' }}></i>Admin Dashboard</h2>
                <p>Welcome back! Here's an overview of your system.</p>
              </div>
              <Button 
                size="sm" 
                className="fw-bold" 
                style={{ backgroundColor: '#06b6d4', borderColor: '#06b6d4', borderRadius: 8 }}
                onClick={handleShowRecentActivities}
              >
                <i className="fas fa-history me-1"></i> Recent 1 Hour
              </Button>
            </div>

            {/* ── Primary stat cards (4-col bento) ── */}
            <div className="bento-grid cols-4 stagger-enter" style={{ marginBottom: 'var(--grid-gap)' }}>
              {statCards.map((s, i) => (
                <div key={i} className="bento-card" style={{ padding: 'var(--card-pad-sm)' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="bento-stat-label">{s.label}</div>
                      <div className="bento-stat-value" style={{ color: s.color }}>{s.value || 0}</div>
                    </div>
                    <div className="bento-stat-icon" style={{ background: s.bg, color: s.color }}>
                      <i className={s.icon}></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Status overview (3-col bento) ── */}
            <div className="bento-grid cols-3 stagger-enter">
              {statusCards.map((s, i) => (
                <div key={i} className="bento-card" style={{ textAlign: 'center', padding: 'var(--card-pad)' }}>
                  <div className="bento-stat-label" style={{ marginBottom: 6 }}>
                    {s.pulse && <span className="pulse-dot" style={{ background: s.color, color: s.color }}></span>}
                    {s.label}
                  </div>
                  <div className="status-card-value" style={{ color: s.color, marginBottom: 10 }}>
                    {s.value || 0}
                  </div>
                  <Button
                    variant={`outline-${s.variant}`}
                    size="sm"
                    className="w-100 fw-bold"
                    style={{ borderRadius: 8, fontSize: '0.78rem' }}
                    onClick={() => navigate(s.route)}
                  >
                    <i className="fas fa-arrow-right me-1"></i> View Details
                  </Button>
                </div>
              ))}
            </div>

          </div>

          {/* ── Recent Activities Modal ── */}
          <Modal show={showActivitiesModal} onHide={() => setShowActivitiesModal(false)} centered size="lg" dialogClassName="activities-modal">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', padding: '14px 20px', borderBottom: 'none' }}>
              <Modal.Title style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>
                <i className="fas fa-history me-2"></i>Last 1 Hour Activities (Last 10)
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '0', background: '#ffffff', maxHeight: '600px', overflowY: 'auto' }}>
              {activitiesLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                  <Spinner animation="border" role="status" style={{ color: '#06b6d4', marginRight: '10px' }} />
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Loading activities...</span>
                </div>
              ) : activities && activities.length > 0 ? (
                <Table hover responsive style={{ marginBottom: '0' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <i className="fas fa-user me-2" style={{ color: '#06b6d4' }}></i>User
                      </th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <i className="fas fa-exclamation-circle me-2" style={{ color: '#f59e0b' }}></i>Activity
                      </th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <i className="fas fa-clock me-2" style={{ color: '#10b981' }}></i>Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity, index) => (
                      <tr key={index} style={{ 
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background 0.2s ease',
                        fontSize: '0.85rem'
                      }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                        <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 600 }}>
                          {activity.user ? (
                            <>
                              <i className="fas fa-user-circle me-2" style={{ color: '#06b6d4' }}></i>
                              {activity.user}
                            </>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>System</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          {activity.icon && <i className={`${activity.icon} me-2`}></i>}
                          <span className="fw-bold">{activity.action}</span>
                          <br />
                          <small style={{ color: '#94a3b8', marginTop: '4px', display: 'block' }}>{activity.description}</small>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString('en-IN') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: '0.9rem' }}>
                  <i className="fas fa-inbox me-2" style={{ fontSize: '1.5rem', opacity: 0.5 }}></i>
                  No activities in the last hour
                </div>
              )}
            </Modal.Body>
            <Modal.Footer style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '10px 20px' }}>
              <Button variant="outline-secondary" size="sm" onClick={() => setShowActivitiesModal(false)} style={{ borderRadius: '8px', fontWeight: 600 }}>
                <i className="fas fa-times me-1"></i>Close
              </Button>
            </Modal.Footer>
          </Modal>

        </Container>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
