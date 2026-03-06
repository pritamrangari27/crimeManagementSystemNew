import React, { useEffect, useState } from 'react';
import { Container, Button, Modal, Table, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, firsAPI } from '../api/client';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import '../styles/dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('authUser'));
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
  const [activityPage, setActivityPage] = useState(0);
  const [recentFIRs, setRecentFIRs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, firsRes] = await Promise.all([
          dashboardAPI.getStats(),
          firsAPI.search('')
        ]);
        if (statsRes.data.status === 'success') setStats(statsRes.data.data);
        if (firsRes.data.status === 'success' && Array.isArray(firsRes.data.data)) {
          const sorted = firsRes.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setRecentFIRs(sorted.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleShowRecentActivities = async () => {
    setShowActivitiesModal(true);
    setActivitiesLoading(true);
    setActivityPage(0);
    try {
      const response = await dashboardAPI.getActivity(10, '');
      if (response.data.status === 'success') {
        setActivities(response.data.activities || response.data.data || []);
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
      <>
        <Sidebar />
        <div className="with-sidebar d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
          <div className="text-center">
            <div className="page-loader"><div className="spinner"></div></div>
            <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  const statCards = [
    { label: 'Police Officers', value: stats.totalPolice, icon: 'fas fa-users-cog', color: '#10b981', bg: 'rgba(16,185,129,0.10)', route: '/admin/police' },
    { label: 'Criminals',       value: stats.totalCriminals, icon: 'fas fa-user-secret', color: '#ef4444', bg: 'rgba(239,68,68,0.10)', route: '/admin/criminals' },
    { label: 'Stations',        value: stats.totalStations,  icon: 'fas fa-building',    color: '#06b6d4', bg: 'rgba(6,182,212,0.10)', route: '/admin/stations' },
    { label: 'Total FIRs',      value: stats.totalFIRs,      icon: 'fas fa-file-alt',    color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', route: '/admin/firs' },
  ];




  const statusColor = (s) => s === 'Approved' ? '#10b981' : s === 'Rejected' ? '#ef4444' : '#06b6d4';
  const statusBg = (s) => s === 'Approved' ? 'rgba(16,185,129,0.12)' : s === 'Rejected' ? 'rgba(239,68,68,0.12)' : 'rgba(6,182,212,0.12)';

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
        <Container fluid className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - var(--banner-height, 38px) - 50px)' }}>
          <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto' }}>

            {/* ── Header ── */}
            <div className="dash-header" style={{ marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: '1.35rem' }}>
                  <i className="fas fa-chart-line me-2" style={{ color: '#10b981' }}></i>Admin Dashboard
                </h2>
                <p style={{ margin: 0 }}>Welcome back, <strong>{user?.username || 'Admin'}</strong>! Here's your system overview.</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="sm" className="fw-bold" style={{ backgroundColor: '#06b6d4', borderColor: '#06b6d4', borderRadius: 8 }}
                  onClick={handleShowRecentActivities}>
                  <i className="fas fa-history me-1"></i> Activity Log
                </Button>
                <Button size="sm" variant="outline-dark" className="fw-bold" style={{ borderRadius: 8 }}
                  onClick={() => navigate('/admin/analytics')}>
                  <i className="fas fa-chart-pie me-1"></i> Analytics
                </Button>
                <Button size="sm" className="fw-bold" style={{ backgroundColor: '#10b981', borderColor: '#10b981', borderRadius: 8 }}
                  onClick={() => navigate('/admin/export')}>
                  <i className="fas fa-download me-1"></i> Export Reports
                </Button>
              </div>
            </div>

            {/* ── Primary stat cards (4-col bento) ── */}
            <div className="bento-grid cols-4 stagger-enter" style={{ marginBottom: 'var(--grid-gap)' }}>
              {statCards.map((s, i) => (
                <div key={i} className="bento-card" style={{ padding: 'var(--card-pad-sm)', cursor: 'pointer' }}
                  onClick={() => navigate(s.route)}>
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

            {/* ── Recent FIRs ── */}
            <div className="bento-grid cols-1 stagger-enter">
              <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', fontWeight: 700, fontSize: '0.8rem', borderBottom: '1.5px solid #e2e8f0', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span><i className="fas fa-file-alt me-2" style={{ color: '#f59e0b' }}></i>Recent FIRs</span>
                  <button onClick={() => navigate('/admin/firs')} style={{ background: 'none', border: 'none', color: '#06b6d4', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}>
                    View All <i className="fas fa-arrow-right ms-1"></i>
                  </button>
                </div>
                <div style={{ padding: '6px 0', maxHeight: 280, overflowY: 'auto' }}>
                  {recentFIRs.length > 0 ? recentFIRs.map((fir, idx) => (
                    <div key={fir.id || idx}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderBottom: idx < recentFIRs.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s ease', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: statusBg(fir.status), color: statusColor(fir.status), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', flexShrink: 0 }}>
                        <i className="fas fa-file-alt"></i>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#0f172a' }}>
                          {fir.fir_number || `FIR-${String(fir.id).padStart(4, '0')}`}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {fir.crime_type} {fir.created_at ? `• ${new Date(fir.created_at).toLocaleDateString()}` : ''}
                        </div>
                      </div>
                      <span style={{ background: statusBg(fir.status), color: statusColor(fir.status), borderRadius: 20, padding: '2px 10px', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0 }}>
                        {fir.status}
                      </span>
                    </div>
                  )) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', padding: '24px 0' }}>
                      <i className="fas fa-inbox me-2" style={{ opacity: 0.5 }}></i>No recent FIRs
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* ── Recent Activities Modal ── */}
          <Modal show={showActivitiesModal} onHide={() => setShowActivitiesModal(false)} centered size="lg" dialogClassName="activities-modal">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', padding: '14px 20px', borderBottom: 'none' }}>
              <Modal.Title style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>
                <i className="fas fa-history me-2"></i>Recent Activities
                {activities.length > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.8, marginLeft: 8 }}>({activityPage + 1} / {activities.length})</span>}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '24px', background: '#ffffff', minHeight: '260px' }}>
              {activitiesLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
                  <Spinner animation="border" role="status" style={{ color: '#06b6d4', marginRight: '10px' }} />
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Loading activities...</span>
                </div>
              ) : activities && activities.length > 0 ? (
                <div style={{ position: 'relative' }}>
                  {/* Left Arrow */}
                  <button
                    onClick={() => setActivityPage(p => Math.max(0, p - 1))}
                    disabled={activityPage === 0}
                    style={{
                      position: 'absolute', left: '-8px', top: '50%', transform: 'translateY(-50%)',
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: activityPage === 0 ? '#f1f5f9' : '#06b6d4', border: 'none',
                      color: activityPage === 0 ? '#94a3b8' : '#fff',
                      cursor: activityPage === 0 ? 'default' : 'pointer',
                      boxShadow: activityPage === 0 ? 'none' : '0 4px 12px rgba(6,182,212,0.3)',
                      fontSize: '0.9rem', zIndex: 2, transition: 'all 0.2s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>

                  {/* Activity Card */}
                  <div style={{ margin: '0 40px', overflow: 'hidden' }}>
                    {(() => {
                      const a = activities[activityPage];
                      if (!a) return null;
                      const actionColors = {
                        'FIR Filed': '#10b981', 'FIR Approved': '#059669', 'FIR Rejected': '#ef4444',
                        'Login': '#3b82f6', 'Register': '#8b5cf6', 'Update': '#f59e0b'
                      };
                      const actionColor = Object.entries(actionColors).find(([k]) => (a.action || '').toLowerCase().includes(k.toLowerCase()))?.[1] || '#06b6d4';
                      return (
                        <div key={activityPage} style={{
                          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                          borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                          animation: 'actSlideIn 0.3s ease'
                        }}>
                          {/* Top Row: Icon + Action */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                            <div style={{
                              width: '48px', height: '48px', borderRadius: '14px',
                              background: `${actionColor}15`, color: actionColor,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '1.2rem', flexShrink: 0
                            }}>
                              <i className={a.icon || 'fas fa-bolt'}></i>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{a.action}</div>
                              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                                <i className="far fa-clock me-1"></i>
                                {a.timestamp ? new Date(a.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                              </div>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ background: '#f0f9ff', borderRadius: '10px', padding: '12px 14px', border: '1px solid #e0f2fe' }}>
                              <div style={{ fontSize: '0.68rem', color: '#0369a1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                <i className="fas fa-user me-1"></i>User
                              </div>
                              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem' }}>
                                {a.user || 'System'}
                              </div>
                            </div>
                            <div style={{ background: '#fff7ed', borderRadius: '10px', padding: '12px 14px', border: '1px solid #ffedd5' }}>
                              <div style={{ fontSize: '0.68rem', color: '#c2410c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                <i className="fas fa-tag me-1"></i>Type
                              </div>
                              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem' }}>
                                {a.entity_type || a.action?.split(' ')[0] || 'Activity'}
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          {a.description && (
                            <div style={{
                              marginTop: '14px', background: '#f8fafc', borderRadius: '10px',
                              padding: '12px 14px', borderLeft: `3px solid ${actionColor}`,
                              fontSize: '0.84rem', color: '#475569', lineHeight: 1.6
                            }}>
                              {a.description}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Right Arrow */}
                  <button
                    onClick={() => setActivityPage(p => Math.min(activities.length - 1, p + 1))}
                    disabled={activityPage >= activities.length - 1}
                    style={{
                      position: 'absolute', right: '-8px', top: '50%', transform: 'translateY(-50%)',
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: activityPage >= activities.length - 1 ? '#f1f5f9' : '#06b6d4', border: 'none',
                      color: activityPage >= activities.length - 1 ? '#94a3b8' : '#fff',
                      cursor: activityPage >= activities.length - 1 ? 'default' : 'pointer',
                      boxShadow: activityPage >= activities.length - 1 ? 'none' : '0 4px 12px rgba(6,182,212,0.3)',
                      fontSize: '0.9rem', zIndex: 2, transition: 'all 0.2s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>

                  {/* Dot Indicators */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '18px' }}>
                    {activities.map((_, i) => (
                      <button key={i} onClick={() => setActivityPage(i)} style={{
                        width: i === activityPage ? '20px' : '8px', height: '8px',
                        borderRadius: '4px', border: 'none', cursor: 'pointer',
                        background: i === activityPage ? '#06b6d4' : '#cbd5e1',
                        transition: 'all 0.25s ease'
                      }} />
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', color: '#94a3b8' }}>
                  <i className="fas fa-inbox" style={{ fontSize: '2.5rem', opacity: 0.4, marginBottom: '12px' }}></i>
                  <span style={{ fontSize: '0.9rem' }}>No recent activities</span>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '10px 20px' }}>
              <Button variant="outline-secondary" size="sm" onClick={() => setShowActivitiesModal(false)} style={{ borderRadius: '8px', fontWeight: 600 }}>
                <i className="fas fa-times me-1"></i>Close
              </Button>
            </Modal.Footer>
          </Modal>

          <style>{`
            @keyframes actSlideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
          `}</style>

        </Container>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
