import React, { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { firsAPI } from '../api/client';
import '../styles/dashboard.css';

const PoliceDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('authUser'));
  const stationId = user?.station_id;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await firsAPI.getByStation(stationId);
        const data = response.data;
        if (data.status === 'success' && Array.isArray(data.data)) {
          const firs = data.data;
          setStats({
            total_firs: firs.length,
            sent_firs: firs.filter(f => f.status === 'Sent').length,
            approved_firs: firs.filter(f => f.status === 'Approved').length,
            rejected_firs: firs.filter(f => f.status === 'Rejected').length
          });
        }
      } catch (error) {
        console.error('Error fetching FIR stats:', error);
        setStats({ total_firs: 0, sent_firs: 0, approved_firs: 0, rejected_firs: 0 });
      } finally {
        setLoading(false);
      }
    };
    if (stationId) fetchStats();
  }, [stationId]);

  if (loading) {
    return <div className="text-center py-5"><span className="spinner-border"></span> Loading...</div>;
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
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
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
              </div>
            </div>

            {/* Station Information */}
            <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', fontWeight: 700, fontSize: '0.8rem', borderBottom: '1.5px solid #e2e8f0', color: '#0f172a' }}>
                <i className="fas fa-info-circle me-2" style={{ color: '#06b6d4' }}></i>Station Information
              </div>
              <div style={{ padding: '10px 16px' }}>
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

        </Container>
      </div>
      <Footer />
    </>
  );
};

export default PoliceDashboard;
