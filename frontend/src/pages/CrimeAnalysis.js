import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { dashboardAPI } from '../api/client';
import { CRIME_TYPES } from '../constants/crimeTypes';
import '../styles/dashboard.css';

const CrimeAnalysis = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const role = localStorage.getItem('userRole');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [crimesByType, setCrimesByType] = useState([]);
  const [firStatus, setFirStatus] = useState([]);
  const [totalCrimes, setTotalCrimes] = useState(0);
  const [totalFIRs, setTotalFIRs] = useState(0);
  const [selectedCrimeType, setSelectedCrimeType] = useState('');
  const [filteredCrimeData, setFilteredCrimeData] = useState([]);

  // Verify user is Admin
  useEffect(() => {
    if (role !== 'Admin') {
      navigate('/login');
    }
  }, [role, navigate]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [crimeTypeRes, firStatusRes] = await Promise.all([
          dashboardAPI.getCrimesByType(),
          dashboardAPI.getFIRStatus()
        ]);

        if (crimeTypeRes.data.status === 'success') {
          setCrimesByType(crimeTypeRes.data.data || []);
          const total = crimeTypeRes.data.data?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
          setTotalCrimes(total);
        }

        if (firStatusRes.data.status === 'success') {
          setFirStatus(firStatusRes.data.data || []);
          const total = firStatusRes.data.data?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
          setTotalFIRs(total);
        }

        setError('');
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load crime analysis data');
      } finally {
        setLoading(false);
      }
    };

    if (role === 'Admin') {
      fetchAnalytics();
    }
  }, [role]);

  if (role !== 'Admin') {
    return null;
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="with-sidebar">
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="text-muted mt-3">Loading crime analysis...</p>
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
        <Container fluid className="dashboard-container py-3 px-3">
          {/* Page Header */}
          <Row className="mb-3">
            <Col>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h2 className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: '#1a202c' }}>
                    <i className="fas fa-chart-pie me-2" style={{ color: '#667eea' }}></i>
                    Crime Analysis Dashboard
                  </h2>
                  <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                    <i className="fas fa-info-circle me-2"></i>Real-time crime statistics and comprehensive analysis
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => navigate(-1)} style={{ borderRadius: '6px', padding: '0.5rem 1.5rem' }}>
                  <i className="fas fa-arrow-left me-2"></i>Back
                </Button>
              </div>
            </Col>
          </Row>

          {error && <Alert variant="danger" className="mb-2" style={{ borderRadius: '10px', borderLeft: '4px solid #e74c3c', fontSize: '0.85rem' }}>{error}</Alert>}

          {/* Summary Cards */}
          <Row className="mb-3">
            <Col lg={3} md={6} className="mb-2">
              <div className="bg-white p-3 rounded-3 shadow-sm" style={{ borderLeft: '5px solid #e74c3c', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div>
                    <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Total Crimes</h6>
                    <h3 className="fw-bold mb-0" style={{ fontSize: '1.5rem', color: '#e74c3c' }}>{totalCrimes}</h3>
                  </div>
                  <i className="fas fa-exclamation-triangle" style={{ fontSize: '1.5rem', opacity: 0.1, color: '#e74c3c' }}></i>
                </div>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Registered crimes in system</small>
              </div>
            </Col>

            <Col lg={3} md={6} className="mb-2">
              <div className="bg-white p-3 rounded-3 shadow-sm" style={{ borderLeft: '5px solid #4e73df', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div>
                    <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Total FIRs</h6>
                    <h3 className="fw-bold mb-0" style={{ fontSize: '1.5rem', color: '#4e73df' }}>{totalFIRs}</h3>
                  </div>
                  <i className="fas fa-file-alt" style={{ fontSize: '1.5rem', opacity: 0.1, color: '#4e73df' }}></i>
                </div>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>First Information Reports filed</small>
              </div>
            </Col>

            <Col lg={3} md={6} className="mb-2">
              <div className="bg-white p-3 rounded-3 shadow-sm" style={{ borderLeft: '5px solid #f6c23e', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div>
                    <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Avg Crime Rate</h6>
                    <h3 className="fw-bold mb-0" style={{ fontSize: '1.5rem', color: '#f6c23e' }}>{totalCrimes > 0 ? (totalCrimes / 12).toFixed(1) : 0}</h3>
                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>/month</small>
                  </div>
                  <i className="fas fa-chart-line" style={{ fontSize: '1.5rem', opacity: 0.1, color: '#f6c23e' }}></i>
                </div>
              </div>
            </Col>

            <Col lg={3} md={6} className="mb-2">
              <div className="bg-white p-3 rounded-3 shadow-sm" style={{ borderLeft: '5px solid #1cc88a', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div>
                    <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Case Resolution</h6>
                    <h3 className="fw-bold mb-0" style={{ fontSize: '1.5rem', color: '#1cc88a' }}>{totalFIRs > 0 ? ((firStatus.find(f => f.status === 'Approved')?.count || 0) / totalFIRs * 100).toFixed(1) : 0}%</h3>
                  </div>
                  <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', opacity: 0.1, color: '#1cc88a' }}></i>
                </div>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Approved cases rate</small>
              </div>
            </Col>
          </Row>

          {/* Charts Section */}
          <Row className="mb-3">
            <Col lg={7}>
              <div className="bg-white p-3 rounded-3 shadow-sm" style={{ height: '100%' }}>
                <div className="mb-2">
                  <h6 className="fw-bold mb-2" style={{ fontSize: '0.95rem', color: '#1a202c' }}>
                    <i className="fas fa-chart-bar me-2" style={{ color: '#667eea' }}></i>Crimes by Type Distribution
                  </h6>
                  <Form.Group className="mb-2">
                    <Form.Select
                      value={selectedCrimeType}
                      onChange={(e) => setSelectedCrimeType(e.target.value)}
                      style={{ maxWidth: '300px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                    >
                      <option value="">📊 View All Crime Types</option>
                      {CRIME_TYPES.map((crime) => (
                        <option key={crime.value} value={crime.value}>
                          {crime.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                {crimesByType.length > 0 ? (
                  <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                    {crimesByType.map((crime, idx) => {
                      const percentage = (crime.count / totalCrimes) * 100;
                      const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];
                      return (
                        <div key={idx} className="mb-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-bold" style={{ fontSize: '0.8rem', color: '#333' }}>{crime.crime_type}</span>
                            <span className="badge" style={{ backgroundColor: colors[idx % colors.length], padding: '0.3rem 0.5rem', fontSize: '0.72rem' }}>{crime.count} cases</span>
                          </div>
                          <div className="progress" style={{ height: '20px', borderRadius: '6px', backgroundColor: '#f0f0f0' }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${percentage}%`,
                                background: `linear-gradient(90deg, ${colors[idx % colors.length]} 0%, ${colors[(idx + 1) % colors.length]} 100%)`,
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                color: 'white',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              aria-valuenow={percentage}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              {percentage > 8 && `${percentage.toFixed(1)}%`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted text-center py-3" style={{ fontSize: '0.85rem' }}>📊 No crime data available</p>
                )}
              </div>
            </Col>

            {/* FIR Status Analysis */}
            <Col lg={5}>
              <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                <h6 className="fw-bold mb-2" style={{ fontSize: '0.95rem', color: '#1a202c' }}>
                  <i className="fas fa-tasks me-2" style={{ color: '#667eea' }}></i>FIR Status Summary
                </h6>

                {firStatus.length > 0 ? (
                  <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                    {firStatus.map((status, idx) => {
                      const percentage = (status.count / totalFIRs) * 100;
                      const statusColor = status.status === 'Approved' ? '#10b981' : status.status === 'Rejected' ? '#ef4444' : '#f59e0b';
                      const statusIcon = status.status === 'Approved' ? '✓' : status.status === 'Rejected' ? '✕' : '⟳';
                      return (
                        <div key={idx} className="mb-2 p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: `4px solid ${statusColor}` }}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <span className="badge me-2" style={{ backgroundColor: statusColor, padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}>{statusIcon}</span>
                              <span className="fw-bold" style={{ color: '#333', fontSize: '0.85rem' }}>{status.status}</span>
                            </div>
                            <strong style={{ fontSize: '1.1rem', color: statusColor }}>{status.count}</strong>
                          </div>
                          <div className="progress" style={{ height: '18px', borderRadius: '6px', backgroundColor: '#e0e0e0' }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: statusColor,
                                fontSize: '0.72rem',
                                fontWeight: 'bold',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                              }}
                              aria-valuenow={percentage}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              {percentage > 5 && `${percentage.toFixed(0)}%`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted text-center py-3" style={{ fontSize: '0.85rem' }}>📋 No FIR data available</p>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default CrimeAnalysis;
