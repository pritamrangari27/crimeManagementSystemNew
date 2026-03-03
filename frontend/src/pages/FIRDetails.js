import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { firsAPI } from '../api/client';
import '../styles/forms.css';

const FIRDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const role = localStorage.getItem('userRole');
  const [fir, setFir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  // Verify user is logged in
  useEffect(() => {
    if (!user || !role) {
      navigate('/login');
      return;
    }
  }, [user, role, navigate]);

  // Fetch FIR details
  useEffect(() => {
    const fetchFIR = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await firsAPI.getById(id);
        const data = response.data;
        
        if (data.status === 'success') {
          setFir(data.data);
        } else {
          setError('FIR not found');
        }
      } catch (err) {
        setError('Failed to load FIR details');
        console.error('Error fetching FIR:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFIR();
    }
  }, [id]);

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Sent':
        return 'info';
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'danger';
      case 'Pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Handle approve
  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this FIR?')) return;

    setApproving(true);
    try {
      await firsAPI.approve(id, null);
      setFir({ ...fir, status: 'Approved' });
      alert('FIR approved successfully');
    } catch (err) {
      alert('Error approving FIR');
      console.error('Error:', err);
    } finally {
      setApproving(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this FIR?')) return;

    setRejecting(true);
    try {
      await firsAPI.reject(id, 'Rejected by officer');
      setFir({ ...fir, status: 'Rejected' });
      alert('FIR rejected successfully');
    } catch (err) {
      alert('Error rejecting FIR');
      console.error('Error:', err);
    } finally {
      setRejecting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || !role) {
    return null;
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <Container fluid className="main-content py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-3"
            >
              <i className="fas fa-arrow-left me-2"></i> Back
            </Button>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="fw-bold mb-2">
                  <i className="fas fa-file-contract me-2"></i> FIR Details
                </h2>
                {!loading && fir && (
                  <p className="text-muted mb-0">
                    FIR-{String(fir.id).padStart(4, '0')} • 
                    <Badge bg={getStatusVariant(fir.status)} className="ms-2">
                      {fir.status}
                    </Badge>
                  </p>
                )}
              </div>
            </div>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3 text-muted">Loading FIR details...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : !fir ? (
          <Alert variant="warning">FIR not found</Alert>
        ) : (
          <Row>
            <Col lg={8}>
              {/* FIR Information Table-like Structure */}
              <Card className="border-0 shadow-sm mb-4 overflow-hidden">
                <Card.Header className="fw-bold text-white p-4" style={{ background: '#0ea5e9' }}>
                  <i className="fas fa-file-contract me-2"></i> FIR Case Details
                </Card.Header>
                <Card.Body className="p-0">
                  {/* FIR Basic Information */}
                  <div className="p-4 border-bottom">
                    <h6 className="fw-bold mb-3 d-flex align-items-center">
                      <i className="fas fa-info-circle me-2" style={{ color: '#0ea5e9' }}></i> Case Information
                    </h6>
                    <Table borderless responsive className="mb-0">
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <td style={{ width: '40%', paddingBottom: '12px' }}>
                            <span className="text-muted fw-bold small">
                              <i className="fas fa-file-alt me-2 text-primary"></i>FIR ID
                            </span>
                          </td>
                          <td style={{ paddingBottom: '12px' }}>
                            <span className="fw-bold text-primary">FIR-{String(fir.id).padStart(4, '0')}</span>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                            <span className="text-muted fw-bold small">
                              <i className="fas fa-circle-dot me-2" style={{ color: getStatusVariant(fir.status) === 'success' ? '#10b981' : getStatusVariant(fir.status) === 'danger' ? '#ef4444' : getStatusVariant(fir.status) === 'info' ? '#06b6d4' : '#f59e0b' }}></i>Status
                            </span>
                          </td>
                          <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                            <Badge bg={getStatusVariant(fir.status)} className="p-2" style={{ fontSize: '12px' }}>
                              {fir.status}
                            </Badge>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                            <span className="text-muted fw-bold small">
                              <i className="fas fa-gavel me-2 text-danger"></i>Crime Type
                            </span>
                          </td>
                          <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                            <span className="fw-bold">{fir.crime_type}</span>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                            <span className="text-muted fw-bold small">
                              <i className="fas fa-calendar-alt me-2 text-warning"></i>Filed Date
                            </span>
                          </td>
                          <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                            <span className="fw-bold">{formatDate(fir.created_at || fir.date)}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ paddingTop: '8px' }}>
                            <span className="text-muted fw-bold small">
                              <i className="fas fa-map-marker-alt me-2 text-success"></i>Police Station
                            </span>
                          </td>
                          <td style={{ paddingTop: '8px' }}>
                            <span className="fw-bold">{fir.station_id}</span>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>

                  {/* Complainant Information */}
                  <div className="p-4 border-bottom">
                    <h6 className="fw-bold mb-3 d-flex align-items-center">
                      <i className="fas fa-user me-2" style={{ color: '#0ea5e9' }}></i> Complainant Information
                    </h6>
                    <Table borderless responsive className="mb-0">
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <td style={{ width: '40%', paddingBottom: '12px' }}>
                            <span className="text-muted fw-bold small">
                              <i className="fas fa-user me-2" style={{ color: '#0ea5e9' }}></i>Full Name
                            </span>
                          </td>
                          <td style={{ paddingBottom: '12px' }}>
                            <span className="fw-bold">{fir.name}</span>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                            <span className="text-muted fw-bold small">
                              <i className="fas fa-birthday-cake me-2" style={{ color: '#0ea5e9' }}></i>Age
                            </span>
                          </td>
                          <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                            <span className="fw-bold">{fir.age} years</span>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                            <span className="text-muted fw-bold small">
                              <i className="fas fa-phone me-2 text-success"></i>Phone Number
                            </span>
                          </td>
                          <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                            <span className="fw-bold">{fir.number}</span>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                            <span className="text-muted fw-bold small">
                              <i className="fas fa-link me-2 text-warning"></i>Relation to Accused
                            </span>
                          </td>
                          <td style={{ paddingBottom: '12px', paddingTop: '8px' }}>
                            <span className="fw-bold">{fir.relation}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ paddingTop: '8px', verticalAlign: 'top' }}>
                            <span className="text-muted fw-bold small">
                              <i className="fas fa-home me-2 text-secondary"></i>Address
                            </span>
                          </td>
                          <td style={{ paddingTop: '8px' }}>
                            <span className="fw-bold">{fir.address}</span>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>

                  {/* Accused Information */}
                  <div className="p-4 border-bottom">
                    <h6 className="fw-bold mb-3 d-flex align-items-center">
                      <i className="fas fa-user-secret me-2 text-danger"></i> Accused Information
                    </h6>
                    <Table borderless responsive className="mb-0">
                      <tbody>
                        <tr>
                          <td style={{ width: '40%' }}>
                            <span className="text-muted fw-bold small">
                              <i className="fas fa-user-secret me-2 text-danger"></i>Name
                            </span>
                          </td>
                          <td>
                            <span className="fw-bold">{fir.accused}</span>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>

                  {/* Purpose/Description */}
                  <div className="p-4">
                    <h6 className="fw-bold mb-3 d-flex align-items-center">
                      <i className="fas fa-comment-dots me-2" style={{ color: '#ffc107' }}></i> Purpose of FIR
                    </h6>
                    <div className="p-3 rounded-2" style={{ borderLeft: '4px solid #0ea5e9', lineHeight: '1.6', fontSize: '14px', backgroundColor: '#f0f9ff' }}>
                      {fir.purpose}
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Action Buttons for Police */}
              {role === 'Police' && fir.status === 'Sent' && (
                <Card className="border-0 shadow-sm mt-4">
                  <Card.Body>
                    <h6 className="mb-3 fw-bold">
                      <i className="fas fa-tasks me-2 text-primary"></i> Police Actions
                    </h6>
                    <Row className="g-3">
                      <Col sm={6}>
                        <Button
                          variant="success"
                          size="lg"
                          className="w-100 fw-bold"
                          onClick={handleApprove}
                          disabled={approving}
                        >
                          <i className="fas fa-check-circle me-2"></i>
                          {approving ? 'Approving...' : 'Approve'}
                        </Button>
                      </Col>
                      <Col sm={6}>
                        <Button
                          variant="danger"
                          size="lg"
                          className="w-100 fw-bold"
                          onClick={handleReject}
                          disabled={rejecting}
                        >
                          <i className="fas fa-times-circle me-2"></i>
                          {rejecting ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}
            </Col>

            {/* Sidebar with Modern Circular Progress */}
            <Col lg={4}>
              {/* Modern Circular Progress Indicator */}
              <div className="p-4 rounded-3" style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
                <h6 className="fw-bold mb-4 d-flex align-items-center" style={{ color: '#1a1a1a' }}>
                  <i className="fas fa-tasks me-2" style={{ color: '#10b981', fontSize: '18px' }}></i>
                  Case Progress
                </h6>

                {/* Circular Progress Indicator */}
                <div className="d-flex flex-column align-items-center mb-4">
                  <div style={{ position: 'relative', width: '140px', height: '140px', marginBottom: '20px' }}>
                    <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                      {/* Background Circle */}
                      <circle
                        cx="70"
                        cy="70"
                        r="60"
                        fill="none"
                        stroke="#d1fae5"
                        strokeWidth="8"
                      />
                      {/* Progress Circle */}
                      <circle
                        cx="70"
                        cy="70"
                        r="60"
                        fill="none"
                        stroke={fir.status === 'Approved' ? '#10b981' : fir.status === 'Rejected' ? '#ef4444' : '#10b981'}
                        strokeWidth="8"
                        strokeDasharray={`${(fir.status === 'Approved' ? 100 : fir.status === 'Rejected' ? 100 : 50) * 3.77} 377`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.6s ease', filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.2))' }}
                      />
                    </svg>
                    {/* Center Content */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: fir.status === 'Approved' ? '#10b981' : fir.status === 'Rejected' ? '#ef4444' : '#10b981' }}>
                        {fir.status === 'Approved' ? 100 : fir.status === 'Rejected' ? 100 : 50}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Done</div>
                    </div>
                  </div>

                  {/* Status Label Below Circle */}
                  <div className="text-center mb-3">
                    <p className="text-muted small fw-bold mb-1">Current Status</p>
                    <div className="d-inline-flex align-items-center" style={{ gap: '8px', padding: '8px 16px', borderRadius: '20px', background: fir.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : fir.status === 'Rejected' ? 'rgba(220, 53, 69, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}>
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: fir.status === 'Approved' ? '#10b981' : fir.status === 'Rejected' ? '#ef4444' : '#10b981',
                          animation: 'pulse 2s infinite'
                        }}
                      ></div>
                      <span className="fw-bold" style={{ color: fir.status === 'Approved' ? '#10b981' : fir.status === 'Rejected' ? '#ef4444' : '#10b981', fontSize: '13px' }}>
                        {fir.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline Details */}
                <div className="p-3 bg-white rounded-2 mb-3" style={{ border: '1px solid #d1fae5' }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted small fw-bold mb-1">Submission Date</p>
                      <p className="fw-bold mb-0" style={{ color: '#2c3e50', fontSize: '13px' }}>
                        <i className="fas fa-calendar-alt me-2" style={{ color: '#10b981' }}></i>
                        {formatDate(fir.created_at || fir.date)}
                      </p>
                    </div>
                  </div>
                </div>

                {fir.status !== 'Sent' && (
                  <div className="p-3 bg-white rounded-2" style={{ border: `1px solid ${fir.status === 'Approved' ? '#10b981' : '#ef4444'}` }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="text-muted small fw-bold mb-1">{fir.status} Date</p>
                        <p className="fw-bold mb-0" style={{ color: fir.status === 'Approved' ? '#10b981' : '#ef4444', fontSize: '13px' }}>
                          <i className={`fas fa-${fir.status === 'Approved' ? 'check-circle' : 'times-circle'} me-2`}></i>
                          {fir.updated_at ? formatDate(fir.updated_at) : 'Recently'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default FIRDetails;
