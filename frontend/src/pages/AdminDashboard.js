import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  const [activities, setActivities] = useState([]);
  const [activityIndex, setActivityIndex] = useState(0);
  const sliderInterval = useRef(null);

  const startSlider = useCallback(() => {
    if (sliderInterval.current) clearInterval(sliderInterval.current);
    sliderInterval.current = setInterval(() => {
      setActivityIndex(prev => (prev + 1) % Math.max(activities.length, 1));
    }, 4000);
  }, [activities.length]);

  useEffect(() => {
    if (activities.length > 1) {
      startSlider();
    }
    return () => { if (sliderInterval.current) clearInterval(sliderInterval.current); };
  }, [activities.length, startSlider]);

  const goToSlide = (idx) => {
    setActivityIndex(idx);
    startSlider();
  };
  const goPrev = () => { goToSlide((activityIndex - 1 + activities.length) % activities.length); };
  const goNext = () => { goToSlide((activityIndex + 1) % activities.length); };

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
      <Sidebar />
      
      <div className="with-sidebar">
        <Container fluid className="dashboard-container py-5 px-4">
          {/* Page Header */}
          <Row className="mb-5">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="fw-bold mb-1">
                    <i className="fas fa-chart-line me-2" style={{ color: '#10b981' }}></i>
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
              <Card className="border-0 shadow-sm stat-card info">
                <Card.Body className="text-center p-4">
                  <h6 className="text-muted small fw-bold text-uppercase mb-2">Sent FIRs</h6>
                  <h2 className="fw-bold text-info mb-2">{stats.pendingFIRs || 0}</h2>
                  <Button
                    variant="outline-info"
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

          {/* Recent Activities Slider & System Overview */}
          <Row className="align-items-stretch">
            {/* Recent Activities - Modern Slider */}
            <Col lg={7} className="mb-4 d-flex">
              <Card className="border-0 shadow-sm w-100" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <Card.Header className="border-0 p-4 d-flex justify-content-between align-items-center" style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                }}>
                  <h5 className="mb-0 fw-bold text-white" style={{ fontSize: '1.1rem' }}>
                    <i className="fas fa-history me-2" style={{ color: '#10b981' }}></i> Recent Activities
                  </h5>
                  <span style={{
                    background: 'rgba(16,185,129,0.15)',
                    color: '#10b981',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    <i className="fas fa-circle me-1" style={{ fontSize: '0.5rem', verticalAlign: 'middle' }}></i>
                    Live &middot; {activities.length} events
                  </span>
                </Card.Header>
                <Card.Body className="p-0" style={{ background: '#f8fafc', minHeight: '220px', position: 'relative' }}>
                  {activities && activities.length > 0 ? (
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      {/* Slider Content */}
                      <div style={{
                        display: 'flex',
                        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: `translateX(-${activityIndex * 100}%)`,
                      }}>
                        {activities.map((activity, index) => (
                          <div key={index} style={{ minWidth: '100%', boxSizing: 'border-box', padding: '28px 32px' }}>
                            <div className="d-flex align-items-start">
                              <div style={{
                                width: '52px',
                                height: '52px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                fontSize: '1.2rem',
                                flexShrink: 0,
                                boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                              }}>
                                <i className={`${activity.icon || 'fas fa-info-circle'}`}></i>
                              </div>
                              <div className="ms-3 flex-grow-1">
                                <h6 className="mb-1 fw-bold" style={{ color: '#0f172a', fontSize: '1.05rem' }}>
                                  {activity.action}
                                </h6>
                                <p className="mb-2" style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                  {activity.description}
                                </p>
                                <span style={{
                                  background: '#e2e8f0',
                                  color: '#64748b',
                                  padding: '3px 10px',
                                  borderRadius: '12px',
                                  fontSize: '0.78rem',
                                  fontWeight: 500
                                }}>
                                  <i className="fas fa-clock me-1"></i>
                                  {activity.timestamp}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Navigation Arrows */}
                      {activities.length > 1 && (
                        <>
                          <button onClick={goPrev} style={{
                            position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)',
                            width: '36px', height: '36px', borderRadius: '50%',
                            border: '2px solid #10b981', background: 'rgba(255,255,255,0.95)',
                            color: '#10b981', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1rem', zIndex: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                            transition: 'all 0.2s'
                          }}>
                            <i className="fas fa-arrow-left"></i>
                          </button>
                          <button onClick={goNext} style={{
                            position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)',
                            width: '36px', height: '36px', borderRadius: '50%',
                            border: '2px solid #10b981', background: 'rgba(255,255,255,0.95)',
                            color: '#10b981', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1rem', zIndex: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                            transition: 'all 0.2s'
                          }}>
                            <i className="fas fa-arrow-right"></i>
                          </button>
                        </>
                      )}

                      {/* Dots Indicator */}
                      {activities.length > 1 && (
                        <div style={{
                          display: 'flex', justifyContent: 'center', gap: '6px',
                          padding: '12px 0 18px', background: '#f8fafc'
                        }}>
                          {activities.map((_, idx) => (
                            <button key={idx} onClick={() => goToSlide(idx)} style={{
                              width: activityIndex === idx ? '24px' : '8px',
                              height: '8px',
                              borderRadius: '4px',
                              border: 'none',
                              background: activityIndex === idx ? '#10b981' : '#cbd5e1',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              padding: 0
                            }} />
                          ))}
                        </div>
                      )}
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

            {/* System Overview */}
            <Col lg={5} className="mb-4 d-flex">
              <Card className="border-0 shadow-sm w-100" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <Card.Header className="border-0 p-3 px-4" style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                }}>
                  <h5 className="mb-0 fw-bold text-white" style={{ fontSize: '1.1rem' }}>
                    <i className="fas fa-server me-2" style={{ color: '#10b981' }}></i> System Overview
                  </h5>
                </Card.Header>
                <Card.Body className="p-3" style={{ background: '#f8fafc' }}>
                  {[
                    { label: 'Police Officers', value: stats.totalPolice, icon: 'fas fa-user-shield', color: '#3b82f6' },
                    { label: 'Criminals Registered', value: stats.totalCriminals, icon: 'fas fa-user-secret', color: '#ef4444' },
                    { label: 'Police Stations', value: stats.totalStations, icon: 'fas fa-building', color: '#8b5cf6' },
                    { label: 'Total FIRs', value: stats.totalFIRs, icon: 'fas fa-file-alt', color: '#f59e0b' },
                    { label: 'Approved FIRs', value: stats.approvedFIRs, icon: 'fas fa-check-circle', color: '#10b981' },
                    { label: 'Pending FIRs', value: stats.pendingFIRs, icon: 'fas fa-hourglass-half', color: '#06b6d4' },
                    { label: 'Rejected FIRs', value: stats.rejectedFIRs, icon: 'fas fa-times-circle', color: '#ef4444' },
                  ].map((item, idx) => (
                    <div key={idx} className="d-flex align-items-center justify-content-between" style={{
                      padding: '8px 12px',
                      marginBottom: idx < 6 ? '5px' : 0,
                      background: '#ffffff',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                    >
                      <div className="d-flex align-items-center">
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '8px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `${item.color}15`, color: item.color,
                          fontSize: '0.85rem', marginRight: '10px', flexShrink: 0
                        }}>
                          <i className={item.icon}></i>
                        </div>
                        <span style={{ color: '#475569', fontWeight: 500, fontSize: '0.85rem' }}>{item.label}</span>
                      </div>
                      <span style={{
                        fontWeight: 700, fontSize: '0.95rem', color: '#0f172a',
                        background: '#f1f5f9', padding: '3px 12px', borderRadius: '8px',
                        minWidth: '38px', textAlign: 'center'
                      }}>
                        {item.value || 0}
                      </span>
                    </div>
                  ))}
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

export default AdminDashboard;
