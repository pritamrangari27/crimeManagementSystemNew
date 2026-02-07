import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
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
  const [crimesByLocation, setCrimesByLocation] = useState([]);
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
                    Crime Analysis Dashboard
                  </h2>
                  <p className="text-muted mb-0">Real-time crime statistics and comprehensive analysis</p>
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
              <div className="stat-card p-4 bg-white rounded-3 shadow-sm border-0" style={{ borderLeft: '4px solid #e74a3b' }}>
                <h6 className="text-muted text-uppercase fw-bold mb-2" style={{ fontSize: '0.75rem' }}>Total Crimes</h6>
                <div className="d-flex justify-content-between align-items-end">
                  <h3 className="fw-bold mb-0" style={{ color: '#e74a3b' }}>{totalCrimes}</h3>
                  <i className="fas fa-exclamation-triangle" style={{ fontSize: '2rem', opacity: 0.15 }}></i>
                </div>
              </div>
            </Col>

            <Col lg={3} md={6} className="mb-4">
              <div className="stat-card p-4 bg-white rounded-3 shadow-sm border-0" style={{ borderLeft: '4px solid #4e73df' }}>
                <h6 className="text-muted text-uppercase fw-bold mb-2" style={{ fontSize: '0.75rem' }}>Total FIRs</h6>
                <div className="d-flex justify-content-between align-items-end">
                  <h3 className="fw-bold mb-0" style={{ color: '#4e73df' }}>{totalFIRs}</h3>
                  <i className="fas fa-file-alt" style={{ fontSize: '2rem', opacity: 0.15 }}></i>
                </div>
              </div>
            </Col>

            <Col lg={3} md={6} className="mb-4">
              <div className="stat-card p-4 bg-white rounded-3 shadow-sm border-0" style={{ borderLeft: '4px solid #f6c23e' }}>
                <h6 className="text-muted text-uppercase fw-bold mb-2" style={{ fontSize: '0.75rem' }}>Avg Crime Rate</h6>
                <div className="d-flex justify-content-between align-items-end">
                  <div>
                    <h3 className="fw-bold mb-0" style={{ color: '#f6c23e' }}>{totalCrimes > 0 ? (totalCrimes / 12).toFixed(1) : 0}</h3>
                    <small className="text-muted">/month</small>
                  </div>
                  <i className="fas fa-chart-line" style={{ fontSize: '2rem', opacity: 0.15 }}></i>
                </div>
              </div>
            </Col>

            <Col lg={3} md={6} className="mb-4">
              <div className="stat-card p-4 bg-white rounded-3 shadow-sm border-0" style={{ borderLeft: '4px solid #1cc88a' }}>
                <h6 className="text-muted text-uppercase fw-bold mb-2" style={{ fontSize: '0.75rem' }}>Case Resolution</h6>
                <div className="d-flex justify-content-between align-items-end">
                  <h3 className="fw-bold mb-0" style={{ color: '#1cc88a' }}>{totalFIRs > 0 ? ((firStatus.find(f => f.status === 'Approved')?.count || 0) / totalFIRs * 100).toFixed(1) : 0}%</h3>
                  <i className="fas fa-check-circle" style={{ fontSize: '2rem', opacity: 0.15 }}></i>
                </div>
              </div>
            </Col>
          </Row>

          {/* Crime Type Analysis with Chart */}
          <Row className="mb-5">
            <Col lg={7}>
              <div className="bg-white p-4 rounded-3 shadow-sm">
                <div className="mb-4">
                  <h5 className="fw-bold mb-3">
                    <i className="fas fa-chart-bar me-2 text-primary"></i>Crimes by Type Distribution
                  </h5>
                  <Form.Group className="mb-0">
                    <Form.Select
                      value={selectedCrimeType}
                      onChange={(e) => setSelectedCrimeType(e.target.value)}
                      style={{ maxWidth: '300px' }}
                    >
                      <option value="">All Crime Types</option>
                      {CRIME_TYPES.map((crime) => (
                        <option key={crime.value} value={crime.value}>
                          {crime.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                {crimesByType.length > 0 ? (
                  <div>
                    {/* Bar Chart Visualization */}
                    <div className="mb-4" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                      {crimesByType.map((crime, idx) => {
                        const percentage = (crime.count / totalCrimes) * 100;
                        return (
                          <div key={idx} className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="fw-bold" style={{ fontSize: '0.95rem' }}>{crime.crime_type}</span>
                              <span className="badge bg-primary">{crime.count}</span>
                            </div>
                            <div className="progress" style={{ height: '25px', borderRadius: '5px' }}>
                              <div
                                className="progress-bar bg-gradient"
                                role="progressbar"
                                style={{
                                  width: `${percentage}%`,
                                  background: `linear-gradient(90deg, #667eea 0%, #764ba2 100%)`,
                                  fontSize: '0.85rem',
                                  fontWeight: 'bold',
                                  color: 'white'
                                }}
                                aria-valuenow={percentage}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              >
                                {percentage > 5 && `${percentage.toFixed(1)}%`}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted text-center py-4">No crime data available</p>
                )}
              </div>
            </Col>

            {/* FIR Status Analysis */}
            <Col lg={5}>
              <div className="bg-white p-4 rounded-3 shadow-sm h-100">
                <h5 className="fw-bold mb-4">
                  <i className="fas fa-tasks me-2 text-success"></i>FIR Status Summary
                </h5>

                {firStatus.length > 0 ? (
                  <div className="space-y-3">
                    {firStatus.map((status, idx) => {
                      const percentage = (status.count / totalFIRs) * 100;
                      const statusColor = status.status === 'Approved' ? '#1cc88a' : status.status === 'Rejected' ? '#e74a3b' : '#f6c23e';
                      return (
                        <div key={idx} className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              {status.status === 'Approved' && <span className="badge bg-success me-2">✓</span>}
                              {status.status === 'Rejected' && <span className="badge bg-danger me-2">✕</span>}
                              {status.status === 'Pending' && <span className="badge bg-warning me-2">⟳</span>}
                              <span className="fw-bold">{status.status}</span>
                            </div>
                            <strong style={{ color: statusColor }}>{status.count}</strong>
                          </div>
                          <div className="progress" style={{ height: '20px', borderRadius: '5px' }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: statusColor,
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
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
                  <p className="text-muted text-center py-4">No FIR data available</p>
                )}
              </div>
            </Col>
          </Row>

          {/* Crime Location Analysis */}
          <Row>
            <Col>
              <div className="bg-white p-4 rounded-3 shadow-sm">
                <h5 className="fw-bold mb-4">
                  <i className="fas fa-map-marker-alt me-2 text-warning"></i>Crimes by Location
                </h5>

                {crimesByLocation.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                          <th className="fw-bold">Location</th>
                          <th className="fw-bold">State</th>
                          <th className="text-center fw-bold">Count</th>
                          <th className="text-center fw-bold">Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {crimesByLocation.map((loc, idx) => {
                          const percentage = (loc.count / totalCrimes) * 100;
                          return (
                            <tr key={idx}>
                              <td className="fw-bold">{loc.city}</td>
                              <td>{loc.state}</td>
                              <td className="text-center">
                                <span className="badge bg-info">{loc.count}</span>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-secondary">{percentage.toFixed(1)}%</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted text-center py-4">No location data available</p>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default CrimeAnalysis;
