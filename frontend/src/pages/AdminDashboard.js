import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, firsAPI } from '../api/client';
import Sidebar from '../components/Sidebar';
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
  const [activityIndex, setActivityIndex] = useState(0);

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
    setActivityIndex(0);
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

  const handlePreviousActivity = () => {
    setActivityIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextActivity = () => {
    setActivityIndex(prev => Math.min(activities.length - 1, prev + 1));
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
            <div style={{ marginBottom: 24 }}>
              {/* Title */}
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>
                <i className="fas fa-chart-line me-2" style={{ color: '#10b981' }}></i>Admin Dashboard
              </h2>
              
              {/* Welcome Message */}
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 14 }}>
                Welcome back, <strong>{user?.username || 'Admin'}</strong>! Here's your system overview.
              </p>
              
              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <button className="mgmt-btn-primary" style={{ fontSize: '0.75rem', backgroundColor: '#06b6d4', borderColor: '#06b6d4', padding: '6px 10px', flex: '1', minWidth: '90px' }}
                  onClick={handleShowRecentActivities}>
                  <i className="fas fa-history me-1"></i>Activity
                </button>
                <button className="mgmt-btn-primary" style={{ fontSize: '0.75rem', backgroundColor: '#7c3aed', borderColor: '#7c3aed', padding: '6px 10px', flex: '1', minWidth: '90px' }}
                  onClick={() => navigate('/admin/analytics')}>
                  <i className="fas fa-chart-pie me-1"></i>Analytics
                </button>
                <button className="mgmt-btn-primary" style={{ fontSize: '0.75rem', backgroundColor: '#10b981', borderColor: '#10b981', padding: '6px 10px', flex: '1', minWidth: '90px' }}
                  onClick={() => navigate('/admin/export')}>
                  <i className="fas fa-download me-1"></i>Export
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
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, animation: 'fadeIn 0.25s ease-out' }}>
              <div style={{ background: '#ffffff', borderRadius: '16px', width: '92%', maxWidth: '500px', maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)', transform: 'translateZ(0)' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #0891b2 100%)', padding: '12px 18px', borderBottom: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 'none', animation: 'slideInDown 0.35s ease-out', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', animation: 'shimmer 2s infinite' }}></div>
                  <h5 style={{ color: 'white', fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
                    <i className="fas fa-history" style={{ fontSize: '1.1rem' }}></i>Recent Activities
                  </h5>
                  <button onClick={() => setShowActivitiesModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: '1.3rem', cursor: 'pointer', padding: '2px 6px', borderRadius: '6px', transition: 'all 0.2s ease', position: 'relative', zIndex: 1 }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}>
                    ✕
                  </button>
                </div>
                
                {/* Body */}
                <div style={{ padding: '14px', background: '#ffffff', maxHeight: 'calc(70vh - 70px)', overflowY: 'hidden', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {activitiesLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 20px', gap: '12px' }}>
                      <div style={{ width: '24px', height: '24px', border: '3px solid #06b6d4', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
                      <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem' }}>Loading...</span>
                    </div>
                  ) : activities && activities.length > 0 ? (
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      {/* Left Arrow */}
                      <button
                        onClick={handlePreviousActivity}
                        disabled={activityIndex === 0}
                        style={{
                          background: activityIndex === 0 ? '#f1f5f9' : 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          cursor: activityIndex === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: activityIndex === 0 ? '#cbd5e1' : 'white',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease',
                          boxShadow: activityIndex === 0 ? 'none' : '0 6px 16px rgba(6,182,212,0.4)',
                          flexShrink: 0,
                          animation: 'slideInLeft 0.4s ease-out',
                          fontWeight: 600
                        }}
                        title="Previous Activity"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>

                      {/* Activity Card */}
                      <div style={{ flex: 1, minHeight: '160px' }}>
                        {activities[activityIndex] && (
                          <div style={{
                            background: '#ffffff',
                            border: '1.5px solid #e0e7ff',
                            borderRadius: '12px',
                            padding: '14px',
                            boxShadow: '0 4px 16px rgba(6,182,212,0.08)',
                            transition: 'all 0.3s ease',
                            animation: 'slideInUp 0.4s ease-out',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'
                          }}>
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1.5px solid #e0e7ff' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                {activities[activityIndex].icon ? (
                                  <i className={`${activities[activityIndex].icon}`} style={{ fontSize: '1.1rem', color: '#0ea5e9', flexShrink: 0 }}></i>
                                ) : (
                                  <i className="fas fa-circle-check" style={{ fontSize: '1.1rem', color: '#10b981', flexShrink: 0 }}></i>
                                )}
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {activities[activityIndex].action}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.7rem', background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)', color: 'white', padding: '3px 8px', borderRadius: '12px', fontWeight: 600, flexShrink: 0, animation: 'pulse 2s ease-in-out infinite' }}>
                                {activityIndex + 1}/{activities.length}
                              </span>
                            </div>

                            {/* User */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                              <i className="fas fa-user-circle" style={{ color: '#0891b2', fontSize: '0.95rem' }}></i>
                              <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                                {activities[activityIndex].user ? activities[activityIndex].user : 'System'}
                              </span>
                            </div>

                            {/* Description */}
                            <div style={{
                              fontSize: '0.8rem',
                              color: '#64748b',
                              marginBottom: '10px',
                              flex: 1,
                              lineHeight: '1.5',
                              background: 'rgba(6,182,212,0.05)',
                              padding: '10px',
                              borderRadius: '8px',
                              overflow: 'hidden'
                            }}>
                              {activities[activityIndex].description || 'No description'}
                            </div>

                            {/* Date & Time */}
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#64748b',
                              fontWeight: 500,
                              padding: '8px 10px',
                              background: 'linear-gradient(135deg, #f0f9ff 0%, rgba(6,182,212,0.05) 100%)',
                              borderRadius: '8px',
                              marginTop: 'auto',
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '10px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <i className="fas fa-calendar-alt" style={{ color: '#0ea5e9', fontSize: '0.8rem' }}></i>
                                <span>{
                                  activities[activityIndex].timestamp 
                                    ? new Date(activities[activityIndex].timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                                    : activities[activityIndex].created_at 
                                    ? new Date(activities[activityIndex].created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                                    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                                }</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <i className="fas fa-clock" style={{ color: '#06b6d4', fontSize: '0.8rem' }}></i>
                                <span>{
                                  activities[activityIndex].timestamp 
                                    ? new Date(activities[activityIndex].timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                                    : activities[activityIndex].created_at 
                                    ? new Date(activities[activityIndex].created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                                    : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                                }</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Arrow */}
                      <button
                        onClick={handleNextActivity}
                        disabled={activityIndex === activities.length - 1}
                        style={{
                          background: activityIndex === activities.length - 1 ? '#f1f5f9' : 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          cursor: activityIndex === activities.length - 1 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: activityIndex === activities.length - 1 ? '#cbd5e1' : 'white',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease',
                          boxShadow: activityIndex === activities.length - 1 ? 'none' : '0 6px 16px rgba(6,182,212,0.4)',
                          flexShrink: 0,
                          animation: 'slideInRight 0.4s ease-out',
                          fontWeight: 600
                        }}
                        title="Next Activity"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: '0.9rem', width: '100%' }}>
                      <i className="fas fa-inbox" style={{ fontSize: '2.5rem', opacity: 0.2, marginBottom: '8px' }}></i>
                      No activities yet
                    </div>
                  )}
                </div>
                
                {/* Footer */}
                <div style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%)', borderTop: '1px solid #e0e7ff', padding: '10px 18px', display: 'flex', justifyContent: 'flex-end', gap: '8px', animation: 'slideInUp 0.3s ease-out 0.05s backwards' }}>
                  <button className="mgmt-btn-back" onClick={() => setShowActivitiesModal(false)} style={{ borderRadius: '8px', fontWeight: 600, padding: '6px 16px', fontSize: '0.85rem' }}>
                    <i className="fas fa-times me-1"></i>Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
