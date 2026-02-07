import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../api/client';
import Sidebar from '../components/Sidebar';
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
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getStats();
        if (response.data.status === 'success') {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set default stats if API fails
      }

      try {
        const actResponse = await dashboardAPI.getActivity(10);
        if (actResponse.data.status === 'success') {
          setActivities(actResponse.data.activities || []);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      }

      setLoading(false);
    };

    fetchStats();

    // Refresh activities every 30 seconds for real-time updates
    const interval = setInterval(() => {
      dashboardAPI.getActivity(10)
        .then(actResponse => {
          if (actResponse.data.status === 'success') {
            setActivities(actResponse.data.activities || []);
          }
        })
        .catch(error => console.error('Error refreshing activities:', error));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <Col md={6} lg={3} className="mb-4">
      <Card className={`stat-card border-0 shadow-sm ${color}`}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="text-muted mb-1 small fw-bold text-uppercase">{title}</p>
              <h3 className="fw-bold mb-0">{value || 0}</h3>
            </div>
            <div className={`stat-icon ${color}`}>
              <i className={`${icon} fa-2x`}></i>
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
      <Sidebar userRole="Admin" />
      
      <div className="with-sidebar">
        <Container fluid className="dashboard-container py-5 px-4">
          {/* Page Header */}
          <Row className="mb-5">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="fw-bold mb-1">
                    <i className="fas fa-chart-line me-2 text-primary"></i>
                    Admin Dashboard
                  </h2>
                  <p className="text-muted mb-0">Welcome back! Here's an overview of your system.</p>
                </div>
              </div>
            </Col>
          </Row>

          {/* Stat Cards */}
          <Row className="mb-5">
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
          <Row className="mb-5">
            <Col lg={4} className="mb-4">
              <Card className="border-0 shadow-sm stat-card success">
                <Card.Body className="text-center p-4">
                  <h6 className="text-muted small fw-bold text-uppercase mb-2">Approved FIRs</h6>
                  <h2 className="fw-bold text-success mb-2">{stats.approvedFIRs || 0}</h2>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => navigate('/admin/firs')}
                    className="w-100"
                  >
                    <i className="fas fa-arrow-right me-1"></i> View Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} className="mb-4">
              <Card className="border-0 shadow-sm stat-card warning">
                <Card.Body className="text-center p-4">
                  <h6 className="text-muted small fw-bold text-uppercase mb-2">Pending FIRs</h6>
                  <h2 className="fw-bold text-warning mb-2">{stats.pendingFIRs || 0}</h2>
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={() => navigate('/admin/firs')}
                    className="w-100"
                  >
                    <i className="fas fa-arrow-right me-1"></i> View Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} className="mb-4">
              <Card className="border-0 shadow-sm stat-card danger">
                <Card.Body className="text-center p-4">
                  <h6 className="text-muted small fw-bold text-uppercase mb-2">Rejected FIRs</h6>
                  <h2 className="fw-bold text-danger mb-2">{stats.rejectedFIRs || 0}</h2>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => navigate('/admin/firs')}
                    className="w-100"
                  >
                    <i className="fas fa-arrow-right me-1"></i> View Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Activity Feed and Quick Actions */}
          <Row>
            {/* Recent Activities */}
            <Col lg={7} className="mb-4">
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-gradient border-0 p-4 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold text-white">
                    <i className="fas fa-history me-2"></i> Recent Activities
                  </h5>
                  <small className="text-white-50">Live feed (updates every 30s)</small>
                </Card.Header>
                <Card.Body className="p-0">
                  {activities && activities.length > 0 ? (
                    <div className="activity-feed">
                      {activities.map((activity, index) => (
                        <div key={index} className="activity-item p-3 border-bottom" style={{
                          backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff',
                          transition: 'background-color 0.2s'
                        }}>
                          <div className="d-flex align-items-start">
                            <div className="activity-icon me-3" style={{
                              width: '40px',
                              height: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '50%',
                              backgroundColor: '#0ea5e9',
                              color: 'white'
                            }}>
                              <i className={`${activity.icon || 'fas fa-info-circle'}`}></i>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-1 fw-bold" style={{ color: '#1a1a1a', fontSize: '0.95rem' }}>
                                {activity.action}
                              </h6>
                              <p className="text-muted small mb-1" style={{ fontSize: '0.85rem' }}>
                                {activity.description}
                              </p>
                              <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                                <i className="fas fa-clock me-1"></i>
                                {activity.timestamp}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="fas fa-inbox fa-3x mb-3" style={{ opacity: 0.3 }}></i>
                      <p className="mb-0">No recent activities</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Quick Actions */}
            <Col lg={5} className="mb-4">
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-gradient border-0 p-4">
                  <h5 className="mb-0 fw-bold text-white">
                    <i className="fas fa-bolt me-2"></i> Quick Actions
                  </h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="d-grid gap-2">
                    <Button
                      href="/admin/criminals/add"
                      className="btn-lg fw-bold rounded-2"
                      style={{ background: 'linear-gradient(135deg, #4e73df, #36b9cc)' }}
                    >
                      <i className="fas fa-user-plus me-2"></i> Add Criminal
                    </Button>

                    <Button
                      href="/admin/police/add"
                      className="btn-lg fw-bold rounded-2"
                      style={{ background: 'linear-gradient(135deg, #1cc88a, #17a076)' }}
                    >
                      <i className="fas fa-user-tie me-2"></i> Add Police Officer
                    </Button>

                    <Button
                      href="/admin/stations/add"
                      className="btn-lg fw-bold rounded-2"
                      style={{ background: 'linear-gradient(135deg, #f6c23e, #f8b63d)' }}
                    >
                      <i className="fas fa-building me-2"></i> Add Police Station
                    </Button>

                    <Button
                      href="/admin/crime-analysis"
                      className="btn-lg fw-bold rounded-2"
                      style={{ background: 'linear-gradient(135deg, #36b9cc, #2e8b9e)' }}
                    >
                      <i className="fas fa-chart-bar me-2"></i> View Crime Analysis
                    </Button>
                  </div>

                  <hr className="my-4" />

                  <h6 className="fw-bold mb-3">System Overview</h6>
                  <div className="small">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Police Officers:</span>
                      <span className="fw-bold">{stats.totalPolice}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Criminals Registered:</span>
                      <span className="fw-bold">{stats.totalCriminals}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Police Stations:</span>
                      <span className="fw-bold">{stats.totalStations}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Total FIRs:</span>
                      <span className="fw-bold">{stats.totalFIRs}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default AdminDashboard;
