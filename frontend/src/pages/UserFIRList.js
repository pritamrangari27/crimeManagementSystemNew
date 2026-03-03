import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Card, Badge, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { firsAPI } from '../api/client';
import '../styles/forms.css';

const UserFIRList = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const role = localStorage.getItem('userRole');
  const [firs, setFirs] = useState([]);
  const [filteredFirs, setFilteredFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');

  // Fetch FIRs
  useEffect(() => {
    const fetchFIRs = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await firsAPI.getByUser(user.id);
        const data = response.data;
        
        if (data.status === 'success' && Array.isArray(data.data)) {
          setFirs(data.data);
        } else {
          setFirs([]);
        }
      } catch (err) {
        setError('Failed to load FIRs. Please try again later.');
        console.error('Error fetching FIRs:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchFIRs();
    }
  }, [user?.id]);

  // Filter and sort FIRs
  useEffect(() => {
    let filtered = [...firs];

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(fir => fir.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at || b.date) - new Date(a.created_at || a.date);
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      } else if (sortBy === 'crime') {
        return a.crime_type.localeCompare(b.crime_type);
      }
      return 0;
    });

    setFilteredFirs(filtered);
  }, [firs, statusFilter, sortBy]);

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Sent':
        return 'info';
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Sent':
        return 'fa-paper-plane';
      case 'Approved':
        return 'fa-check-circle';
      case 'Rejected':
        return 'fa-times-circle';
      default:
        return 'fa-circle';
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

  // Statistics
  const stats = {
    total: firs.length,
    sent: firs.filter(f => f.status === 'Sent').length,
    approved: firs.filter(f => f.status === 'Approved').length,
    rejected: firs.filter(f => f.status === 'Rejected').length
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <Container fluid className="main-content py-3 px-3">
        {/* Header */}
        <Row className="mb-2">
          <Col>
            <h2 className="fw-bold" style={{ fontSize: '1.4rem' }}>
              <i className="fas fa-list me-2"></i> My FIRs
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>View and track all your filed FIRs</p>
          </Col>
          <Col className="text-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(-1)}
              className="me-2"
            >
              <i className="fas fa-arrow-left me-2"></i> Back
            </Button>
            <Button
              style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: '600' }}
              size="sm"
              onClick={() => navigate('/fir/form')}
              className="fw-bold"
            >
              <i className="fas fa-plus me-2"></i> File New FIR
            </Button>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row className="mb-2">
          <Col md={3} className="mb-2">
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="py-2 px-3">
                <h6 className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Total FIRs</h6>
                <h3 className="fw-bold text-primary mb-0" style={{ fontSize: '1.3rem' }}>{stats.total}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-2">
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="py-2 px-3">
                <h6 className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Sent</h6>
                <h3 className="fw-bold text-info mb-0" style={{ fontSize: '1.3rem' }}>{stats.sent}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-2">
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="py-2 px-3">
                <h6 className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Approved</h6>
                <h3 className="fw-bold text-success mb-0" style={{ fontSize: '1.3rem' }}>{stats.approved}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-2">
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="py-2 px-3">
                <h6 className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Rejected</h6>
                <h3 className="fw-bold text-danger mb-0" style={{ fontSize: '1.3rem' }}>{stats.rejected}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters and Sorting */}
        <Card className="border-0 shadow-sm mb-2">
          <Card.Body className="py-2 px-3">
            <Row className="align-items-end">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <i className="fas fa-filter me-2"></i> Filter by Status
                  </Form.Label>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Sent">Sent</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <i className="fas fa-sort me-2"></i> Sort By
                  </Form.Label>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="date">Date (Newest First)</option>
                    <option value="status">Status</option>
                    <option value="crime">Crime Type</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* FIR Table */}
        <Card className="border-0 shadow-sm">
          <Card.Header style={{ backgroundColor: '#0ea5e9', color: 'white' }} className="fw-bold py-2" >
            <i className="fas fa-table me-2"></i> FIR Records
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2 text-muted small">Loading your FIRs...</p>
              </div>
            ) : error ? (
              <Alert variant="danger" className="m-2">
                {error}
              </Alert>
            ) : filteredFirs.length === 0 ? (
              <div className="text-center py-3">
                <i className="fas fa-inbox text-muted" style={{ fontSize: '36px' }}></i>
                <p className="mt-2 text-muted small">No FIRs found</p>
              </div>
            ) : (
              <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 370px)', overflowY: 'auto' }}>
                <Table hover className="mb-0 table-sm" style={{ fontSize: '0.82rem' }}>
                  <thead style={{ backgroundColor: '#e0f2fe', position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr>
                      <th className="fw-bold">FIR ID</th>
                      <th className="fw-bold">Crime Type</th>
                      <th className="fw-bold">Accused</th>
                      <th className="fw-bold">Station</th>
                      <th className="fw-bold">Filed Date</th>
                      <th className="fw-bold">Status</th>
                      <th className="fw-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFirs.map(fir => (
                      <tr key={fir.id} className="align-middle">
                        <td className="fw-bold text-primary">
                          FIR-{String(fir.id).padStart(4, '0')}
                        </td>
                        <td>
                          <span className="badge bg-secondary" style={{ fontSize: '12px' }}>
                            {fir.crime_type}
                          </span>
                        </td>
                        <td>{fir.accused}</td>
                        <td>
                          <small className="text-muted">{fir.station_id}</small>
                        </td>
                        <td className="small">
                          {formatDate(fir.created_at || fir.date)}
                        </td>
                        <td>
                          <Badge bg={getStatusVariant(fir.status)}>
                            <i className={`fas ${getStatusIcon(fir.status)} me-1`}></i>
                            {fir.status}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/fir/${fir.id}`)}
                            className="fw-bold"
                          >
                            <i className="fas fa-eye me-1"></i> View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Pagination Info */}
        {filteredFirs.length > 0 && (
          <div className="mt-3 text-center text-muted small">
            Showing {filteredFirs.length} of {firs.length} FIRs
          </div>
        )}
      </Container>
    </div>
  );
};

export default UserFIRList;
