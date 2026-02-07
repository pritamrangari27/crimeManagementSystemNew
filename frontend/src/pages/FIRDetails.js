import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
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
        const response = await fetch(`http://localhost:3000/api/firs/${id}`);
        const data = await response.json();
        
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
      const response = await fetch(`http://localhost:3000/api/firs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setFir({ ...fir, status: 'Approved' });
        alert('FIR approved successfully');
      } else {
        alert('Failed to approve FIR');
      }
    } catch (err) {
      alert('Error approving FIR');
    } finally {
      setApproving(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this FIR?')) return;

    setRejecting(true);
    try {
      const response = await fetch(`http://localhost:3000/api/firs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected' })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setFir({ ...fir, status: 'Rejected' });
        alert('FIR rejected successfully');
      } else {
        alert('Failed to reject FIR');
      }
    } catch (err) {
      alert('Error rejecting FIR');
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
      <Sidebar userRole={role} />
      <Container fluid className="main-content py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <Button
              variant="outline-secondary"
              onClick={() => navigate(-1)}
              className="mb-3"
            >
              <i className="fas fa-arrow-left me-2"></i> Back
            </Button>
            <h2 className="fw-bold">
              <i className="fas fa-file-contract me-2"></i> FIR Details
            </h2>
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
              {/* Basic Info Card */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-primary text-white fw-bold">
                  <i className="fas fa-info-circle me-2"></i> Basic Information
                </Card.Header>
                <Card.Body>
                  <Row className="mb-4">
                    <Col md={6}>
                      <h6 className="text-muted small fw-bold">FIR ID</h6>
                      <p className="fw-bold text-primary">
                        FIR-{String(fir.id).padStart(4, '0')}
                      </p>
                    </Col>
                    <Col md={6}>
                      <h6 className="text-muted small fw-bold">Status</h6>
                      <Badge bg={getStatusVariant(fir.status)} style={{ fontSize: '14px' }}>
                        {fir.status}
                      </Badge>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col md={6}>
                      <h6 className="text-muted small fw-bold">Crime Type</h6>
                      <p className="fw-bold">{fir.crime_type}</p>
                    </Col>
                    <Col md={6}>
                      <h6 className="text-muted small fw-bold">Police Station</h6>
                      <p className="fw-bold">{fir.station_id}</p>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <h6 className="text-muted small fw-bold">Filed Date</h6>
                      <p className="small">{formatDate(fir.created_at || fir.date)}</p>
                    </Col>
                    <Col md={6}>
                      <h6 className="text-muted small fw-bold">Accused</h6>
                      <p className="fw-bold">{fir.accused}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Accused Information Card */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-danger text-white fw-bold">
                  <i className="fas fa-user-secret me-2"></i> Accused Information
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={12}>
                      <p className="mb-0">{fir.accused}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Complainant Information Card */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-info text-white fw-bold">
                  <i className="fas fa-user me-2"></i> Complainant Information
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col md={6}>
                      <h6 className="text-muted small fw-bold">Name</h6>
                      <p className="fw-bold">{fir.name}</p>
                    </Col>
                    <Col md={6}>
                      <h6 className="text-muted small fw-bold">Age</h6>
                      <p className="fw-bold">{fir.age} years</p>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <h6 className="text-muted small fw-bold">Phone Number</h6>
                      <p className="fw-bold">{fir.number}</p>
                    </Col>
                    <Col md={6}>
                      <h6 className="text-muted small fw-bold">Relation to Accused</h6>
                      <p className="fw-bold">{fir.relation}</p>
                    </Col>
                  </Row>

                  <Row>
                    <Col>
                      <h6 className="text-muted small fw-bold">Address</h6>
                      <p className="fw-bold">{fir.address}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Purpose Card */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-warning text-white fw-bold">
                  <i className="fas fa-comment-dots me-2"></i> Purpose of FIR
                </Card.Header>
                <Card.Body>
                  <p>{fir.purpose}</p>
                </Card.Body>
              </Card>

              {/* Evidence Card */}
              {fir.file && (
                <Card className="border-0 shadow-sm mb-4">
                  <Card.Header className="bg-secondary text-white fw-bold">
                    <i className="fas fa-file-upload me-2"></i> Evidence File
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex align-items-center gap-3">
                      <i className="fas fa-file-pdf text-danger" style={{ fontSize: '48px' }}></i>
                      <div>
                        <p className="mb-1 fw-bold">{fir.file}</p>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          href={`http://localhost:3000/uploads/${fir.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className="fas fa-download me-1"></i> Download
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Action Buttons for Police */}
              {role === 'Police' && fir.status === 'Sent' && (
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <Row className="gap-3">
                      <Col>
                        <Button
                          variant="success"
                          size="lg"
                          className="w-100 fw-bold"
                          onClick={handleApprove}
                          disabled={approving}
                        >
                          <i className="fas fa-check-circle me-2"></i>
                          {approving ? 'Approving...' : 'Approve FIR'}
                        </Button>
                      </Col>
                      <Col>
                        <Button
                          variant="danger"
                          size="lg"
                          className="w-100 fw-bold"
                          onClick={handleReject}
                          disabled={rejecting}
                        >
                          <i className="fas fa-times-circle me-2"></i>
                          {rejecting ? 'Rejecting...' : 'Reject FIR'}
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}
            </Col>

            {/* Sidebar with Additional Info */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-success text-white fw-bold">
                  <i className="fas fa-check-circle me-2"></i> Status Timeline
                </Card.Header>
                <Card.Body>
                  <div className="timeline">
                    <div className="d-flex mb-3">
                      <div className="me-3">
                        <i className="fas fa-circle text-info" style={{ fontSize: '12px' }}></i>
                      </div>
                      <div>
                        <h6 className="mb-0 small fw-bold">FIR Sent</h6>
                        <small className="text-muted">{formatDate(fir.created_at || fir.date)}</small>
                      </div>
                    </div>
                    {fir.status !== 'Sent' && (
                      <div className="d-flex mb-3">
                        <div className="me-3">
                          <i
                            className={`fas fa-${fir.status === 'Approved' ? 'check-circle text-success' : 'times-circle text-danger'}`}
                            style={{ fontSize: '12px' }}
                          ></i>
                        </div>
                        <div>
                          <h6 className="mb-0 small fw-bold">
                            FIR {fir.status}
                          </h6>
                          <small className="text-muted">
                            {fir.updated_at ? formatDate(fir.updated_at) : 'Recently'}
                          </small>
                        </div>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-primary text-white fw-bold">
                  <i className="fas fa-lightbulb me-2"></i> What Next?
                </Card.Header>
                <Card.Body className="small">
                  {fir.status === 'Sent' && (
                    <p>
                      Your FIR is being reviewed by the police station. Please check back for updates.
                    </p>
                  )}
                  {fir.status === 'Approved' && (
                    <p>
                      Your FIR has been approved. You will be contacted shortly with further details.
                    </p>
                  )}
                  {fir.status === 'Rejected' && (
                    <p>
                      Your FIR has been rejected. Please contact the police station for more information.
                    </p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default FIRDetails;
