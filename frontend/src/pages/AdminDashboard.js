import React, { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
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
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
