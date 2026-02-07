import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { dashboardAPI } from '../api/client';
import '../styles/dashboard.css';

const CrimeAnalysis = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const role = localStorage.getItem('userRole');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [crimesByType, setCrimesByType] = useState([]);
  const [crimesByLocation, setCrimesByLocation] = useState([]);
  const [firStatus, setFirStatus] = useState([]);
  const [totalCrimes, setTotalCrimes] = useState(0);
  const [totalFIRs, setTotalFIRs] = useState(0);

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
        const [crimeTypeRes, crimeLocRes, firStatusRes] = await Promise.all([
          dashboardAPI.getCrimesByType(),
          dashboardAPI.getCrimesByLocation(),
          dashboardAPI.getFIRStatus()
        ]);

        if (crimeTypeRes.data.status === 'success') {
          setCrimesByType(crimeTypeRes.data.data || []);
          const total = crimeTypeRes.data.data?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
          setTotalCrimes(total);
        }

        if (crimeLocRes.data.status === 'success') {
          setCrimesByLocation(crimeLocRes.data.data || []);
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
      <div className="d-flex">
        <Sidebar userRole={role} />
        <div className="with-sidebar w-100">
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="text-muted mt-3">Loading crime analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar userRole={role} />
      
      <div className="with-sidebar">
        <Container fluid className="dashboard-container py-5 px-4">
          {/* Page Header */}
          <Row className="mb-5">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="fw-bold mb-1">
                    <i className="fas fa-chart-pie me-2 text-primary"></i>
                    Crime Analysis
                  </h2>
                  <p className="text-muted mb-0">Comprehensive crime statistics and trends</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
                  <i className="fas fa-arrow-left me-2"></i>Back
                </Button>
              </div>
            </Col>
          </Row>

          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

          {/* Summary Cards */}
          <Row className="mb-5">
            <Col lg={3} md={6} className="mb-4">
              <Card className="stat-card border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted text-uppercase fw-bold mb-2">Total Crimes</h6>
                      <h3 className="fw-bold" style={{ color: '#e74a3b' }}>
                        {totalCrimes}
                      </h3>
                    </div>
                    <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-4">
              <Card className="stat-card border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted text-uppercase fw-bold mb-2">Total FIRs</h6>
                      <h3 className="fw-bold" style={{ color: '#4e73df' }}>
                        {totalFIRs}
                      </h3>
                    </div>
                    <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>
                      <i className="fas fa-file-alt"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-4">
              <Card className="stat-card border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted text-uppercase fw-bold mb-2">Avg Crime Rate</h6>
                      <h3 className="fw-bold" style={{ color: '#f6c23e' }}>
                        {totalCrimes > 0 ? (totalCrimes / 12).toFixed(1) : 0}
                      </h3>
                      <small className="text-muted">/month</small>
                    </div>
                    <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>
                      <i className="fas fa-chart-line"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-4">
              <Card className="stat-card border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted text-uppercase fw-bold mb-2">Case Resolution</h6>
                      <h3 className="fw-bold" style={{ color: '#1cc88a' }}>
                        {totalFIRs > 0 ? ((firStatus.find(f => f.status === 'Approved')?.count || 0) / totalFIRs * 100).toFixed(1) : 0}%
                      </h3>
                    </div>
                    <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>
                      <i className="fas fa-check-circle"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Crime Type Analysis */}
          <Row className="mb-5">
            <Col lg={6}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-primary text-white fw-bold">
                  <i className="fas fa-list me-2"></i>Crimes by Type
                </Card.Header>
                <Card.Body>
                  {crimesByType.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Crime Type</th>
                            <th className="text-end">Count</th>
                            <th className="text-end">Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {crimesByType.map((crime, idx) => (
                            <tr key={idx}>
                              <td className="fw-bold">{crime.crime_type}</td>
                              <td className="text-end fw-bold">{crime.count}</td>
                              <td className="text-end">
                                <span className="badge bg-info">
                                  {((crime.count / totalCrimes) * 100).toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted">No crime data available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* FIR Status Analysis */}
            <Col lg={6}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-success text-white fw-bold">
                  <i className="fas fa-tasks me-2"></i>FIR Status Summary
                </Card.Header>
                <Card.Body>
                  {firStatus.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Status</th>
                            <th className="text-end">Count</th>
                            <th className="text-end">Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {firStatus.map((status, idx) => (
                            <tr key={idx}>
                              <td className="fw-bold">
                                {status.status === 'Approved' && <span className="badge bg-success me-2">✓</span>}
                                {status.status === 'Rejected' && <span className="badge bg-danger me-2">✕</span>}
                                {status.status === 'Pending' && <span className="badge bg-warning me-2">⟳</span>}
                                {status.status}
                              </td>
                              <td className="text-end fw-bold">{status.count}</td>
                              <td className="text-end">
                                <span className="badge bg-primary">
                                  {((status.count / totalFIRs) * 100).toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted">No FIR data available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Crime Location Analysis */}
          <Row>
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-warning text-dark fw-bold">
                  <i className="fas fa-map-marker-alt me-2"></i>Crimes by Location
                </Card.Header>
                <Card.Body>
                  {crimesByLocation.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Location</th>
                            <th>State</th>
                            <th className="text-end">Count</th>
                            <th className="text-end">Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {crimesByLocation.map((loc, idx) => (
                            <tr key={idx}>
                              <td className="fw-bold">{loc.city}</td>
                              <td>{loc.state}</td>
                              <td className="text-end fw-bold">{loc.count}</td>
                              <td className="text-end">
                                <span className="badge bg-secondary">
                                  {((loc.count / totalCrimes) * 100).toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted">No location data available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default CrimeAnalysis;
