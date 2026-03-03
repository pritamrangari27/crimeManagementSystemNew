import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Card, Badge, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { firsAPI } from '../api/client';
import '../styles/forms.css';

const PoliceSentFIRs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const stationId = user?.station_id;
  const role = localStorage.getItem('userRole');

  // Derive initial filter from URL path
  const getInitialFilter = () => {
    if (location.pathname.includes('/approved')) return 'Approved';
    if (location.pathname.includes('/rejected')) return 'Rejected';
    if (location.pathname.includes('/sent')) return 'Sent';
    return '';
  };

  const [firs, setFirs] = useState([]);
  const [allFirs, setAllFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState(getInitialFilter());
  const [actionLoading, setActionLoading] = useState(null);

  // Sync filter when URL changes (sidebar click)
  useEffect(() => {
    setFilterStatus(getInitialFilter());
  }, [location.pathname]);

  // Verify user is Police role
  useEffect(() => {
    if (role !== 'Police') {
      navigate('/login');
      return;
    }
  }, [role, navigate]);

  const fetchFIRs = async () => {
    try {
      setLoading(true);
      setError('');
      let response;
      if (stationId) {
        response = await firsAPI.getByStation(stationId);
      } else {
        response = await firsAPI.getAll();
      }
      const data = response.data;
      
      if (data.status === 'success' && Array.isArray(data.data)) {
        setAllFirs(data.data);
        if (filterStatus) {
          setFirs(data.data.filter(f => f.status === filterStatus));
        } else {
          setFirs(data.data);
        }
      } else {
        setAllFirs([]);
        setFirs([]);
      }
    } catch (err) {
      setError('Failed to load FIRs. Please try again later.');
      console.error('Error fetching FIRs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch FIRs for the station
  useEffect(() => {
    if (stationId) {
      fetchFIRs();
    }
  }, [stationId]);

  // Filter FIRs when filter changes
  useEffect(() => {
    if (filterStatus) {
      setFirs(allFirs.filter(f => f.status === filterStatus));
    } else {
      setFirs(allFirs);
    }
  }, [filterStatus, allFirs]);

  // Handle status change via dropdown
  const handleStatusChange = async (firId, newStatus) => {
    if (!newStatus) return;
    const action = newStatus === 'Approved' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${action} this FIR?`)) return;

    setActionLoading(firId);
    try {
      if (newStatus === 'Approved') {
        await firsAPI.approve(firId, user?.id || null);
      } else {
        await firsAPI.reject(firId, `Rejected by officer ${user?.username || ''}`);
      }
      alert(`FIR ${newStatus.toLowerCase()} successfully!`);
      fetchFIRs();
    } catch (err) {
      alert(`Error: Could not ${action} FIR`);
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Sent': return 'info';
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      default: return 'secondary';
    }
  };

  if (role !== 'Police') {
    return null;
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <Container fluid className="main-content py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold">
              <i className="fas fa-file-alt me-2"></i> FIR Management
            </h2>
            <p className="text-muted">Review and manage FIRs sent to your station</p>
          </Col>
          <Col className="text-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(-1)}
              className="fw-bold"
            >
              <i className="fas fa-arrow-left me-2"></i> Back
            </Button>
          </Col>
        </Row>

        {/* Filter Row */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ borderRadius: '8px', border: '2px solid #e0e0e0', padding: '0.6rem' }}
            >
              <option value="">All FIRs ({allFirs.length})</option>
              <option value="Sent">Sent ({allFirs.filter(f => f.status === 'Sent').length})</option>
              <option value="Approved">Approved ({allFirs.filter(f => f.status === 'Approved').length})</option>
              <option value="Rejected">Rejected ({allFirs.filter(f => f.status === 'Rejected').length})</option>
            </Form.Select>
          </Col>
        </Row>

        {/* FIR Table */}
        <Card className="border-0 shadow-sm">
          <Card.Header style={{ background: '#0ea5e9' }} className="text-white fw-bold">
            <i className="fas fa-list me-2"></i> Station FIRs ({firs.length})
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3 text-muted">Loading FIRs...</p>
              </div>
            ) : error ? (
              <Alert variant="danger" className="m-3">
                {error}
              </Alert>
            ) : firs.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-folder-open text-muted" style={{ fontSize: '48px' }}></i>
                <p className="mt-3 text-muted">No FIRs found{filterStatus ? ` with status "${filterStatus}"` : ''}</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead style={{ backgroundColor: '#e0f2fe' }}>
                    <tr>
                      <th className="fw-bold">FIR ID</th>
                      <th className="fw-bold">Crime Type</th>
                      <th className="fw-bold">Accused</th>
                      <th className="fw-bold">Complainant</th>
                      <th className="fw-bold">Filed Date</th>
                      <th className="fw-bold">Status</th>
                      <th className="fw-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {firs.map(fir => (
                      <tr key={fir.id} className="align-middle">
                        <td className="fw-bold text-primary">
                          FIR-{String(fir.id).padStart(4, '0')}
                        </td>
                        <td>
                          <span className="badge bg-info">{fir.crime_type}</span>
                        </td>
                        <td className="fw-bold">{fir.accused}</td>
                        <td>{fir.name}</td>
                        <td className="small text-muted">
                          {formatDate(fir.created_at || fir.date)}
                        </td>
                        <td>
                          <Badge bg={getStatusVariant(fir.status)}>{fir.status}</Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-2 align-items-center">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => navigate(`/fir/${fir.id}`)}
                              className="fw-bold"
                            >
                              <i className="fas fa-eye me-1"></i> View
                            </Button>
                            {fir.status === 'Sent' && (
                              <Form.Select
                                size="sm"
                                style={{ width: '130px', fontWeight: '600' }}
                                defaultValue=""
                                disabled={actionLoading === fir.id}
                                onChange={(e) => handleStatusChange(fir.id, e.target.value)}
                              >
                                <option value="" disabled>Action...</option>
                                <option value="Approved">✓ Approve</option>
                                <option value="Rejected">✕ Reject</option>
                              </Form.Select>
                            )}
                            {actionLoading === fir.id && (
                              <Spinner animation="border" size="sm" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PoliceSentFIRs;
