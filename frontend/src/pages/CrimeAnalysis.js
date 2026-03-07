import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { dashboardAPI } from '../api/client';
import '../styles/dashboard.css';

ChartJS.register(
  CategoryScale, LinearScale, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

const CHART_COLORS = [
  '#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe',
  '#43e97b', '#fa709a', '#fee140', '#e74c3c', '#3498db',
  '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'
];

const CrimeAnalysis = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  const [crimesByType, setCrimesByType] = useState([]);
  const [crimesByMonth, setCrimesByMonth] = useState([]);
  const [firsByMonth, setFirsByMonth] = useState([]);
  const [firStatus, setFirStatus] = useState([]);
  const [crimesByLocation, setCrimesByLocation] = useState([]);

  useEffect(() => {
    if (role !== 'Admin') {
      navigate('/login');
      return;
    }

    const fetchAll = async () => {
      try {
        setLoading(true);
        const [statsRes, typeRes, monthRes, firsMonthRes, firRes, locRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getCrimesByType(),
          dashboardAPI.getCrimesByMonth(),
          dashboardAPI.getFIRsByMonth(),
          dashboardAPI.getFIRStatus(),
          dashboardAPI.getCrimesByLocation()
        ]);

        if (statsRes.data.status === 'success') setStats(statsRes.data.data || {});
        if (typeRes.data.status === 'success') setCrimesByType(typeRes.data.data || []);
        if (monthRes.data.status === 'success') setCrimesByMonth(monthRes.data.data || []);
        if (firsMonthRes.data.status === 'success') setFirsByMonth(firsMonthRes.data.data || []);
        if (firRes.data.status === 'success') setFirStatus(firRes.data.data || []);
        if (locRes.data.status === 'success') setCrimesByLocation(locRes.data.data || []);
        setError('');
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [role, navigate]);

  if (role !== 'Admin') return null;

  // ---------- Chart Data ----------

  const totalCrimes = crimesByType.reduce((s, c) => s + Number(c.count || 0), 0);
  const totalFIRs = firStatus.reduce((s, f) => s + Number(f.count || 0), 0);
  const approvedCount = Number(firStatus.find(f => f.status === 'Approved')?.count || 0);
  const resolutionRate = totalFIRs > 0 ? ((approvedCount / totalFIRs) * 100).toFixed(1) : 0;

  // Line — Crimes & FIRs by Month
  const allMonths = [...new Set([
    ...crimesByMonth.map(c => c.month),
    ...firsByMonth.map(f => f.month)
  ])].sort();

  const monthLabels = allMonths.map(m => {
    const [y, mo] = m.split('-');
    const date = new Date(y, mo - 1);
    return date.toLocaleString('default', { month: 'short', year: '2-digit' });
  });

  const crimeMonthMap = Object.fromEntries(crimesByMonth.map(c => [c.month, Number(c.count)]));
  const firMonthMap = Object.fromEntries(firsByMonth.map(f => [f.month, Number(f.count)]));

  const monthlyChart = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Crimes',
        data: allMonths.map(m => crimeMonthMap[m] || 0),
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#e74c3c'
      },
      {
        label: 'FIRs Filed',
        data: allMonths.map(m => firMonthMap[m] || 0),
        borderColor: '#4facfe',
        backgroundColor: 'rgba(79, 172, 254, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#4facfe'
      }
    ]
  };

  // Doughnut — Crimes by Location
  const locationChart = {
    labels: crimesByLocation.map(l => l.city || l.state || 'Unknown'),
    datasets: [{
      data: crimesByLocation.map(l => l.count),
      backgroundColor: crimesByLocation.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  // ---------- Chart Options ----------

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12 }, usePointStyle: true } },
      title: { display: true, text: 'Monthly Crime & FIR Trends', font: { size: 14, weight: 'bold' }, color: '#1a202c' }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { ticks: { font: { size: 11 } }, grid: { display: false } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 16, usePointStyle: true } },
      title: { display: true, text: 'Crimes by Location', font: { size: 14, weight: 'bold' }, color: '#1a202c' }
    }
  };

  // ---------- Render ----------

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="with-sidebar d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
          <div className="text-center">
            <div className="page-loader"><div className="spinner"></div></div>
            <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>Loading analytics...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
        <Container fluid className="dashboard-container">
          <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto' }}>

          {/* Header */}
          <div className="dash-header" style={{ marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: '1.35rem' }}>
                <i className="fas fa-chart-pie me-2" style={{ color: '#667eea' }}></i>
                Crime Analytics
              </h2>
              <p style={{ margin: 0 }}>Real-time crime statistics with interactive charts</p>
            </div>
            <Button variant="outline-dark" size="sm" onClick={() => navigate(-1)} style={{ borderRadius: 8 }} className="fw-bold">
              <i className="fas fa-arrow-left me-1"></i>Back
            </Button>
          </div>

          {error && <Alert variant="danger" className="mb-3" style={{ borderRadius: '10px' }}>{error}</Alert>}

          {/* Summary Cards (4-col bento) */}
          <div className="bento-grid cols-4 stagger-enter" style={{ marginBottom: 'var(--grid-gap)' }}>
            {[
              { label: 'Total Crimes', value: totalCrimes, icon: 'fas fa-exclamation-triangle', color: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
              { label: 'Total FIRs', value: totalFIRs, icon: 'fas fa-file-alt', color: '#4e73df', bg: 'rgba(78,115,223,0.10)' },
              { label: 'Avg / Month', value: totalCrimes > 0 ? (totalCrimes / Math.max(allMonths.length, 1)).toFixed(1) : 0, icon: 'fas fa-chart-line', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
              { label: 'Resolution Rate', value: `${resolutionRate}%`, icon: 'fas fa-check-circle', color: '#10b981', bg: 'rgba(16,185,129,0.10)' }
            ].map((s, i) => (
              <div key={i} className="bento-card" style={{ padding: 'var(--card-pad-sm)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="bento-stat-label">{s.label}</div>
                    <div className="bento-stat-value" style={{ color: s.color }}>{s.value}</div>
                  </div>
                  <div className="bento-stat-icon" style={{ background: s.bg, color: s.color }}>
                    <i className={s.icon}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 1: Monthly Trends + Crimes by Location */}
          <div className="bento-grid cols-2 stagger-enter" style={{ marginBottom: 'var(--grid-gap)' }}>
            <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', fontWeight: 700, fontSize: '0.8rem', borderBottom: '1.5px solid #e2e8f0', color: '#0f172a' }}>
                <i className="fas fa-chart-line me-2" style={{ color: '#e74c3c' }}></i>Monthly Crime & FIR Trends
              </div>
              <div style={{ padding: 16, height: 320 }}>
                {allMonths.length > 0
                  ? <Line data={monthlyChart} options={lineOptions} />
                  : <p className="text-muted text-center pt-5">No monthly data available</p>}
              </div>
            </div>
            <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', fontWeight: 700, fontSize: '0.8rem', borderBottom: '1.5px solid #e2e8f0', color: '#0f172a' }}>
                <i className="fas fa-map-marked-alt me-2" style={{ color: '#f59e0b' }}></i>Crimes by Location
              </div>
              <div style={{ padding: 16, height: 320 }}>
                {crimesByLocation.length > 0
                  ? <Doughnut data={locationChart} options={doughnutOptions} />
                  : <p className="text-muted text-center pt-5">No location data available</p>}
              </div>
            </div>
          </div>

          </div>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default CrimeAnalysis;
