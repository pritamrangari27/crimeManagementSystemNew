import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
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

  const StatCard = ({ title, value, icon, color }) => (
    <Col md={6} lg={3} className="mb-2">
      <Card className={`stat-card border-0 shadow-sm ${color}`}>
        <Card.Body className="py-2 px-3">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="text-muted mb-0 fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>{title}</p>
              <h3 className="fw-bold mb-0" style={{ fontSize: '1.3rem' }}>{value || 0}</h3>
            </div>
            <div className={`stat-icon ${color}`}>
              <i className={`${icon} fa-lg`}></i>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

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

  return (
    <>
      <Sidebar />
      
      <div className="with-sidebar">
        <Container fluid className="dashboard-container py-3 px-3 d-flex flex-column justify-content-center" style={{ minHeight: 'calc(100vh - var(--banner-height, 38px) - 50px)' }}>
          <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
          {/* Page Header */}
          <Row className="mb-3">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="fw-bold mb-1" style={{ fontSize: '1.4rem' }}>
                    <i className="fas fa-chart-line me-2" style={{ color: '#10b981' }}></i>
                    Admin Dashboard
                  </h2>
                  <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Welcome back! Here's an overview of your system.</p>
                </div>
              </div>
            </Col>
          </Row>

          {/* Stat Cards */}
          <Row className="mb-3">
            <StatCard
              title="Total Police Officers"
              value={stats.totalPolice}
              icon="fas fa-users-cog"
              color="primary"
            />
            <StatCard
              title="Total Criminals"
              value={stats.totalCriminals}
              icon="fas fa-user-secret"
              color="danger"
            />
            <StatCard
              title="Total Police Stations"
              value={stats.totalStations}
              icon="fas fa-building"
              color="info"
            />
            <StatCard
              title="Total FIRs"
              value={stats.totalFIRs}
              icon="fas fa-file-alt"
              color="warning"
            />
          </Row>

          {/* Second Row - Status Overview */}
          <Row className="mb-3">
            <Col lg={4} className="mb-2">
              <Card className="border-0 shadow-sm stat-card success">
                <Card.Body className="text-center py-3 px-3">
                  <h6 className="text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Approved FIRs</h6>
                  <h2 className="fw-bold text-success mb-2" style={{ fontSize: '1.5rem' }}>{stats.approvedFIRs || 0}</h2>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => navigate('/admin/firs?status=Approved')}
                    className="w-100"
                  >
                    <i className="fas fa-arrow-right me-1"></i> View Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} className="mb-2">
              <Card className="border-0 shadow-sm stat-card info">
                <Card.Body className="text-center py-3 px-3">
                  <h6 className="text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Sent FIRs</h6>
                  <h2 className="fw-bold text-info mb-2" style={{ fontSize: '1.5rem' }}>{stats.pendingFIRs || 0}</h2>
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={() => navigate('/admin/firs?status=Sent')}
                    className="w-100"
                  >
                    <i className="fas fa-arrow-right me-1"></i> View Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} className="mb-2">
              <Card className="border-0 shadow-sm stat-card danger">
                <Card.Body className="text-center py-3 px-3">
                  <h6 className="text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Rejected FIRs</h6>
                  <h2 className="fw-bold text-danger mb-2" style={{ fontSize: '1.5rem' }}>{stats.rejectedFIRs || 0}</h2>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => navigate('/admin/firs?status=Rejected')}
                    className="w-100"
                  >
                    <i className="fas fa-arrow-right me-1"></i> View Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          </div>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
