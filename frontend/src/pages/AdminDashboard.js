import React, { useEffect, useState } from 'react';
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
        <div className="with-sidebar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="page-loader"><div className="spinner"></div></div>
            <p style={{ color: '#64748b', marginTop: '8px', fontSize: '0.85rem' }}>Loading dashboard...</p>
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
        <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - var(--banner-height, 38px) - 50px)' }}>
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
                <button className="mgmt-btn-primary" style={{ fontSize: '0.85rem', backgroundColor: '#06b6d4', borderColor: '#06b6d4' }}
                  onClick={handleShowRecentActivities}>
                  <i className="fas fa-history me-1"></i> Activity Log
                </button>
                <button className="mgmt-btn-back" style={{ fontSize: '0.85rem' }}
                  onClick={() => navigate('/admin/analytics')}>
                  <i className="fas fa-chart-pie me-1"></i> Analytics
                </button>
                <button className="mgmt-btn-primary" style={{ fontSize: '0.85rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
                  onClick={() => navigate('/admin/export')}>
                  <i className="fas fa-download me-1"></i> Export Reports
                </button>
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
          {showActivitiesModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
              <div style={{ background: '#ffffff', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', padding: '14px 20px', borderBottom: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 'none' }}>
                  <h5 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                    <i className="fas fa-history me-2"></i>Recent Activities (Last 10)
                  </h5>
                  <button onClick={() => setShowActivitiesModal(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', padding: 0 }}>
                    ✕
                  </button>
                </div>
                
                {/* Body */}
                <div style={{ padding: '16px', background: '#ffffff', maxHeight: 'calc(80vh - 100px)', overflowX: 'auto', overflowY: 'hidden', flex: 1 }}>
                  {activitiesLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                      <div style={{ width: '30px', height: '30px', border: '3px solid #06b6d4', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', marginRight: '10px' }}></div>
                      <span style={{ color: '#64748b', fontWeight: 500 }}>Loading activities...</span>
                    </div>
                  ) : activities && activities.length > 0 ? (
                    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                      {activities.map((activity, index) => (
                        <div key={index} style={{
                          flex: '0 0 320px',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '16px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          minHeight: '180px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(6,182,212,0.12)';
                          e.currentTarget.style.borderColor = '#06b6d4';
                          e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}>
                          {/* Header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                              {activity.icon ? (
                                <i className={`${activity.icon}`} style={{ fontSize: '1.2rem', color: '#06b6d4' }}></i>
                              ) : (
                                <i className="fas fa-circle-check" style={{ fontSize: '1.2rem', color: '#10b981' }}></i>
                              )}
                              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {activity.action}
                              </span>
                            </div>
                          </div>

                          {/* User */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <i className="fas fa-user-circle me-1" style={{ color: '#06b6d4', fontSize: '0.9rem' }}></i>
                            <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                              {activity.user ? activity.user : 'System'}
                            </span>
                          </div>

                          {/* Description */}
                          <div style={{
                            fontSize: '0.8rem',
                            color: '#64748b',
                            marginBottom: '12px',
                            flex: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {activity.description || 'No description'}
                          </div>

                          {/* Time */}
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            fontWeight: 500,
                            padding: '8px 12px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            textAlign: 'center',
                            marginTop: 'auto'
                          }}>
                            <i className="fas fa-clock me-1" style={{ color: '#10b981' }}></i>
                            {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString('en-IN') : 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: '0.9rem', minHeight: '200px' }}>
                      <i className="fas fa-inbox me-2" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                      No recent activities
                    </div>
                  )}
                </div>
                
                {/* Footer */}
                <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '10px 20px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button className="mgmt-btn-back" onClick={() => setShowActivitiesModal(false)} style={{ borderRadius: '8px', fontWeight: 600 }}>
                    <i className="fas fa-times me-1"></i>Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
