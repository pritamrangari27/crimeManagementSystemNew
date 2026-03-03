import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import '../styles/dashboard.css';

const PoliceDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('authUser'));
  const stationId = user?.station_id;
  const role = localStorage.getItem('userRole');

  // Verify user is Police
  useEffect(() => {
    if (role !== 'Police') {
      navigate('/login');
      return;
    }
  }, [role, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch FIR count by status for this police station
        const response = await fetch(
          `http://localhost:3000/api/firs/station/${stationId}`
        );
        const data = await response.json();

        if (data.status === 'success' && Array.isArray(data.data)) {
          const firs = data.data;
          const sentCount = firs.filter(f => f.status === 'Sent').length;
          const approvedCount = firs.filter(f => f.status === 'Approved').length;
          const rejectedCount = firs.filter(f => f.status === 'Rejected').length;
          const totalCount = firs.length;

          setStats({
            total_firs: totalCount,
            sent_firs: sentCount,
            approved_firs: approvedCount,
            rejected_firs: rejectedCount
          });
        }
      } catch (error) {
        console.error('Error fetching FIR stats:', error);
        // Fallback stats
        setStats({
          total_firs: 0,
          sent_firs: 0,
          approved_firs: 0,
          rejected_firs: 0
        });
      } finally {
        setLoading(false);
      }
    };

    if (stationId) {
      fetchStats();
    }
  }, [stationId]);

  if (loading) {
    return <div className="text-center py-5"><span className="spinner-border"></span> Loading...</div>;
  }

  return (
    <>
      <Sidebar />
      
      <div className="with-sidebar">
        <Container fluid className="dashboard-container py-5 px-4">
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold">Police Dashboard</h2>
            <p className="text-muted">Welcome back, {user?.username || 'Officer'}!</p>
          </Col>
          <Col md={3} className="text-end">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => navigate('/police/profile')}
            >
              <i className="fas fa-user me-2"></i> My Profile
            </Button>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={6} lg={3} className="mb-4">
            <Card className="stat-card border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted text-uppercase fw-bold mb-2">New FIRs</h6>
                    <h3 className="fw-bold" style={{ color: '#f6c23e' }}>
                      {stats?.sent_firs || 0}
                    </h3>
                  </div>
                  <i className="fas fa-file-alt fa-3x" style={{ color: '#f6c23e', opacity: 0.3 }}></i>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-4">
            <Card className="stat-card border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted text-uppercase fw-bold mb-2">Approved</h6>
                    <h3 className="fw-bold" style={{ color: '#1cc88a' }}>
                      {stats?.approved_firs || 0}
                    </h3>
                  </div>
                  <i className="fas fa-check-circle fa-3x" style={{ color: '#1cc88a', opacity: 0.3 }}></i>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-4">
            <Card className="stat-card border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted text-uppercase fw-bold mb-2">Rejected</h6>
                    <h3 className="fw-bold" style={{ color: '#e74a3b' }}>
                      {stats?.rejected_firs || 0}
                    </h3>
                  </div>
                  <i className="fas fa-times-circle fa-3x" style={{ color: '#e74a3b', opacity: 0.3 }}></i>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-4">
            <Card className="stat-card border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted text-uppercase fw-bold mb-2">Total FIRs</h6>
                    <h3 className="fw-bold" style={{ color: '#4e73df' }}>
                      {stats?.total_firs || 0}
                    </h3>
                  </div>
                  <i className="fas fa-chart-bar fa-3x" style={{ color: '#4e73df', opacity: 0.3 }}></i>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-primary text-white fw-bold">
                <i className="fas fa-bolt me-2"></i> Quick Actions
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-primary"
                    size="lg"
                    className="text-start"
                    onClick={() => navigate('/police/firs/sent')}
                  >
                    <i className="fas fa-file-import me-3"></i>
                    <div>
                      <div className="fw-bold">View New FIRs</div>
                      <small className="text-muted">Sent - Action Required</small>
                    </div>
                  </Button>
                  <Button
                    variant="outline-success"
                    size="lg"
                    className="text-start"
                    onClick={() => navigate('/police/firs/approved')}
                  >
                    <i className="fas fa-check-square me-3"></i>
                    <div>
                      <div className="fw-bold">View Approved FIRs</div>
                      <small className="text-muted">Already processed</small>
                    </div>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-info text-white fw-bold">
                <i className="fas fa-info-circle me-2"></i> Station Information
              </Card.Header>
              <Card.Body>
                <p className="mb-2">
                  <strong>Station ID:</strong> {stationId}
                </p>
                <p className="mb-2">
                  <strong>Officer:</strong> {user?.username}
                </p>
                <p className="mb-2">
                  <strong>Email:</strong> {user?.email || 'N/A'}
                </p>
                <p className="mb-0">
                  <strong>Phone:</strong> {user?.phone || 'N/A'}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default PoliceDashboard;
