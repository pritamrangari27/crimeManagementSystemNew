import React, { useEffect, useState, useCallback } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { firsAPI } from '../api/client';
import useFIRRealtime from '../utils/useFIRRealtime';
import '../styles/dashboard.css';

const PoliceDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realtimeFIRs, setRealtimeFIRs] = useState([]);
  const user = JSON.parse(localStorage.getItem('authUser'));
  const stationId = user?.station_id;

  // Callback for real-time FIR inserts
  const handleNewFIR = useCallback((newFir) => {
    // Update stats
    setStats((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        total_firs: prev.total_firs + 1,
        sent_firs: newFir.status === 'Sent' ? prev.sent_firs + 1 : prev.sent_firs,
        approved_firs: newFir.status === 'Approved' ? prev.approved_firs + 1 : prev.approved_firs,
        rejected_firs: newFir.status === 'Rejected' ? prev.rejected_firs + 1 : prev.rejected_firs,
      };
    });

    // Add to live feed (keep latest 10)
    setRealtimeFIRs((prev) => [newFir, ...prev].slice(0, 10));

    // Show toast notification
    toast.info(
      <div>
        <strong>New FIR Received</strong>
        <div style={{ fontSize: '0.82rem', marginTop: 2 }}>
          {newFir.crime_type || 'Unknown'} — filed by {newFir.complainant_name || newFir.name || 'Unknown'}
        </div>
      </div>,
      {
        position: 'top-right',
        autoClose: 6000,
        icon: '🚨',
      }
    );
  }, []);

  // Subscribe to real-time FIR inserts for this station
  useFIRRealtime({ stationId, onNewFIR: handleNewFIR });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        let response;
        
        // Police officers see only their assigned FIRs
        if (user?.role === 'Police') {
          response = await firsAPI.getMyAssigned();
        } else {
          // Admin sees all FIRs for the station
          response = await firsAPI.getByStation(stationId);
        }
        
        const data = response.data;
        if (data.status === 'success' && Array.isArray(data.data)) {
          const firs = data.data;
          setStats({
            total_firs: firs.length,
            sent_firs: firs.filter(f => f.status === 'Sent').length,
            approved_firs: firs.filter(f => f.status === 'Approved').length,
            rejected_firs: firs.filter(f => f.status === 'Rejected').length
          });
          // Seed live feed with recent FIRs
          setRealtimeFIRs(firs.slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching FIR stats:', error);
        setStats({ total_firs: 0, sent_firs: 0, approved_firs: 0, rejected_firs: 0 });
      } finally {
        setLoading(false);
      }
    };
    if (stationId || user?.role === 'Police') fetchStats();
  }, [stationId]);

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
    { label: 'New FIRs',  value: stats?.sent_firs,     icon: 'fas fa-file-alt',     color: '#f6c23e', bg: 'rgba(246,194,62,0.12)', pulse: true },
    { label: 'Approved',  value: stats?.approved_firs,  icon: 'fas fa-check-circle',  color: '#1cc88a', bg: 'rgba(28,200,138,0.12)' },
    { label: 'Rejected',  value: stats?.rejected_firs,  icon: 'fas fa-times-circle',  color: '#e74a3b', bg: 'rgba(231,74,59,0.12)',  pulse: stats?.rejected_firs > 0 },
    { label: 'Total FIRs', value: stats?.total_firs,    icon: 'fas fa-chart-bar',     color: '#4e73df', bg: 'rgba(78,115,223,0.12)' },
  ];

  const infoRows = [
    { label: 'Station ID', value: stationId,            icon: 'fas fa-building',  color: '#06b6d4' },
    { label: 'Officer',    value: user?.username,        icon: 'fas fa-user',      color: '#10b981' },
    { label: 'Email',      value: user?.email || 'N/A',  icon: 'fas fa-envelope',  color: '#8b5cf6' },
    { label: 'Phone',      value: user?.phone || 'N/A',  icon: 'fas fa-phone',     color: '#f59e0b' },
  ];

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
        <Container fluid className="dashboard-container">

          {/* ── Header ── */}
          <div className="dash-header">
            <div>
              <h2><i className="fas fa-shield-alt me-2" style={{ color: '#10b981' }}></i>Police Dashboard</h2>
              <p>Welcome back, {user?.username || 'Officer'}!</p>
            </div>
            <Button variant="outline-primary" size="sm" className="fw-bold" style={{ borderRadius: 8 }}
              onClick={() => navigate('/police/profile')}>
              <i className="fas fa-user me-1"></i> My Profile
            </Button>
          </div>

          {/* ── Stat cards (4-col bento) ── */}
          <div className="bento-grid cols-4 stagger-enter" style={{ marginBottom: 'var(--grid-gap)' }}>
            {statCards.map((s, i) => (
              <div key={i} className="bento-card" style={{ padding: 'var(--card-pad-sm)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="bento-stat-label">
                      {s.pulse && <span className="pulse-dot" style={{ background: s.color, color: s.color }}></span>}
                      {s.label}
                    </div>
                    <div className="bento-stat-value" style={{ color: s.color }}>{s.value || 0}</div>
                  </div>
                  <div className="bento-stat-icon" style={{ background: s.bg, color: s.color }}>
                    <i className={s.icon}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Quick actions + Station info (2-col bento) ── */}
          <div className="bento-grid cols-2 stagger-enter">

            {/* Quick Actions */}
            <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', fontWeight: 700, fontSize: '0.8rem', borderBottom: '1.5px solid #e2e8f0', color: '#0f172a' }}>
                <i className="fas fa-bolt me-2" style={{ color: '#f59e0b' }}></i>Quick Actions
              </div>
              <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="action-btn" onClick={() => navigate('/police/firs/sent')}>
                  <div className="action-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                    <i className="fas fa-file-import"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>View New FIRs</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>Sent — Action Required</div>
                  </div>
                  {stats?.sent_firs > 0 && (
                    <span className="ms-auto" style={{ background: '#f59e0b', color: '#fff', borderRadius: 20, padding: '2px 9px', fontSize: '0.72rem', fontWeight: 700 }}>
                      {stats.sent_firs}
                    </span>
                  )}
                </button>
                <button className="action-btn" onClick={() => navigate('/police/firs/approved')}>
                  <div className="action-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                    <i className="fas fa-check-square"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>View Approved FIRs</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>Already processed</div>
                  </div>
                </button>
                <button className="action-btn" onClick={() => navigate('/police/criminals')}>
                  <div className="action-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                    <i className="fas fa-user-secret"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>Criminal Records</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>Search & manage</div>
                  </div>
                </button>

              </div>
            </div>

            {/* Station Information */}
            <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', fontWeight: 700, fontSize: '0.8rem', borderBottom: '1.5px solid #e2e8f0', color: '#0f172a' }}>
                <i className="fas fa-info-circle me-2" style={{ color: '#06b6d4' }}></i>Station Information
              </div>
              <div style={{ padding: '6px 14px' }}>
                {infoRows.map((r, i) => (
                  <div key={i} className="info-row">
                    <i className={r.icon} style={{ color: r.color, width: 16, textAlign: 'center', fontSize: '0.78rem' }}></i>
                    <span className="info-label">{r.label}</span>
                    <span className="info-value">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Live FIR Feed ── */}
          <div className="bento-grid cols-1 stagger-enter" style={{ marginTop: 'var(--grid-gap)' }}>
            <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', fontWeight: 700, fontSize: '0.8rem', borderBottom: '1.5px solid #e2e8f0', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>
                  <i className="fas fa-satellite-dish me-2" style={{ color: '#ef4444' }}></i>Live FIR Feed
                  <span className="pulse-dot" style={{ background: '#22c55e', marginLeft: 8, display: 'inline-block', width: 8, height: 8, borderRadius: '50%' }}></span>
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>Real-time via Supabase</span>
              </div>
              <div style={{ padding: '8px 14px', maxHeight: 200, overflowY: 'auto' }}>
                {realtimeFIRs.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', padding: '18px 0' }}>
                    <i className="fas fa-clock me-2"></i>Waiting for new FIRs…
                  </div>
                ) : (
                  realtimeFIRs.map((fir, idx) => (
                    <div key={fir.id || idx}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '8px 0', borderBottom: idx < realtimeFIRs.length - 1 ? '1px solid #f1f5f9' : 'none',
                        animation: idx === 0 ? 'fadeInDown 0.35s ease' : undefined,
                      }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'rgba(239,68,68,0.10)', color: '#ef4444',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', flexShrink: 0
                      }}>
                        <i className="fas fa-file-alt"></i>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {fir.crime_type || 'Unknown Crime'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          Filed by {fir.complainant_name || fir.name || 'Unknown'} {fir.created_at ? `• ${new Date(fir.created_at).toLocaleTimeString()}` : ''}
                        </div>
                      </div>
                      <span style={{
                        background: '#fef3c7', color: '#d97706', borderRadius: 20,
                        padding: '2px 10px', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0
                      }}>
                        {fir.status || 'Sent'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </Container>
        <ToastContainer />
      </div>
      <Footer />
    </>
  );
};

export default PoliceDashboard;
