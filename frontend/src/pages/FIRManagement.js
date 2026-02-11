import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { firsAPI } from '../api/client';
import { CRIME_TYPES } from '../constants/crimeTypes';
import Sidebar from '../components/Sidebar';

const FIRManagement = () => {
  const navigate = useNavigate();
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingFIR, setViewingFIR] = useState(null);
  const [formData, setFormData] = useState({
    crime_type: '',
    crime_date: '',
    crime_location: '',
    description: '',
    victim_name: '',
    victim_phone: '',
    victim_email: '',
    accused_name: '',
    priority: 'Medium'
  });

  useEffect(() => {
    fetchFIRs();
  }, [filterStatus]);

  const fetchFIRs = async () => {
    try {
      let response;
      if (filterStatus) {
        response = await firsAPI.getByStatus(filterStatus);
      } else {
        response = await firsAPI.getAll();
      }
      if (response.data.status === 'success') {
        setFirs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching FIRs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateFIR = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('authUser'));
      await firsAPI.create({
        user_id: user.id,
        ...formData
      });
      alert('FIR created successfully!');
      setFormData({
        crime_type: '',
        crime_date: '',
        crime_location: '',
        description: '',
        victim_name: '',
        victim_phone: '',
        victim_email: '',
        accused_name: '',
        priority: 'Medium'
      });
      setShowForm(false);
      fetchFIRs();
    } catch (error) {
      alert('Error creating FIR: ' + error.response?.data?.message);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const response = await firsAPI.search(query);
        if (response.data.status === 'success') {
          setFirs(response.data.data);
        }
      } catch (error) {
        console.error('Error searching:', error);
        fetchFIRs();
      }
    } else {
      fetchFIRs();
    }
  };

  const handleViewFIR = (fir) => {
    setViewingFIR(fir);
    setShowViewModal(true);
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
        <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">FIR Management</h2>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)} className="me-2">
            <i className="fas fa-arrow-left me-2"></i>Back
          </Button>
          <Button style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: '600' }} size="sm" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus me-2"></i>File New FIR
          </Button>
        </Col>
      </Row>

      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>File New FIR</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateFIR}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Crime Type *</Form.Label>
                  <Form.Select
                    name="crime_type"
                    value={formData.crime_type}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">-- Select Crime Type --</option>
                    {CRIME_TYPES.map((crime) => (
                      <option key={crime.value} value={crime.value}>
                        {crime.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Crime Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="crime_date"
                    value={formData.crime_date}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Victim Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="victim_name"
                    value={formData.victim_name}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Accused Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="accused_name"
                    value={formData.accused_name}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Crime Location *</Form.Label>
              <Form.Control
                type="text"
                name="crime_location"
                value={formData.crime_location}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleFormChange}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Victim Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="victim_email"
                    value={formData.victim_email}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Victim Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="victim_phone"
                    value={formData.victim_phone}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                name="priority"
                value={formData.priority}
                onChange={handleFormChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowForm(false)}>
            Close
          </Button>
          <Button variant="success" onClick={(e) => handleCreateFIR(e)}>
            File FIR
          </Button>
        </Modal.Footer>
      </Modal>

      <Form.Group className="mb-4">
        <Form.Control
          as="select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All FIRs</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Investigating">Investigating</option>
          <option value="Closed">Closed</option>
        </Form.Control>
      </Form.Group>

      <Table striped bordered hover responsive>
        <thead className="bg-dark text-white">
          <tr>
            <th>FIR Number</th>
            <th>Crime Type</th>
            <th>Location</th>
            <th>Date Filed</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {firs.length > 0 ? (
            firs.map((fir) => (
              <tr key={fir.id}>
                <td>FIR-{String(fir.id).padStart(4, '0')}</td>
                <td>{fir.crime_type}</td>
                <td>{fir.address || '-'}</td>
                <td>{new Date(fir.created_at).toLocaleDateString()}</td>
                <td>
                  <span
                    className={`badge bg-${
                      fir.status === 'Approved'
                        ? 'success'
                        : fir.status === 'Rejected'
                        ? 'danger'
                        : 'warning'
                    }`}
                  >
                    {fir.status}
                  </span>
                </td>
                <td>High</td>
                <td>
                  <Button
                    onClick={() => handleViewFIR(fir)}
                    variant="info"
                    size="sm"
                  >
                    <i className="fas fa-eye"></i> View
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No FIRs found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg" backdrop="static">
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px 8px 0 0' }}>
          <Modal.Title style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <i className="fas fa-file-invoice me-3"></i>FIR Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#f8f9fa', padding: '2rem' }}>
          {viewingFIR && (
            <div>
              {/* FIR Status Section */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h5 className="fw-bold mb-3" style={{ color: '#333', fontSize: '1.3rem' }}>
                  <i className="fas fa-file-text me-2" style={{ color: '#667eea' }}></i>FIR Report
                </h5>
                <p className="text-muted mb-0">
                  <span className={`badge bg-${viewingFIR.status === 'Approved' ? 'success' : viewingFIR.status === 'Rejected' ? 'danger' : 'warning'}`} style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}>
                    {viewingFIR.status === 'Approved' ? '✓ Approved' : viewingFIR.status === 'Rejected' ? '✕ Rejected' : '⟳ Pending'}
                  </span>
                </p>
              </div>

              {/* Crime Information */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h6 className="fw-bold mb-3 pb-2" style={{ borderBottom: '2px solid #667eea', color: '#333' }}>
                  <i className="fas fa-scale-balanced me-2" style={{ color: '#e74c3c' }}></i>Crime Information
                </h6>
                <Row>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Crime Type</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <span className="badge bg-danger">{viewingFIR.crime_type}</span>
                    </p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Crime Date</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <i className="far fa-calendar me-2" style={{ color: '#3498db' }}></i>{viewingFIR.crime_date}
                    </p>
                  </Col>
                  <Col md={12} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Crime Location</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <i className="fas fa-map-pin me-2" style={{ color: '#e67e22' }}></i>{viewingFIR.crime_location}
                    </p>
                  </Col>
                  <Col md={12} className="mb-0">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Description</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', wordBreak: 'break-word' }}>
                      <i className="fas fa-align-left me-2" style={{ color: '#9b59b6' }}></i>{viewingFIR.description}
                    </p>
                  </Col>
                </Row>
              </div>

              {/* Victim Information */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h6 className="fw-bold mb-3 pb-2" style={{ borderBottom: '2px solid #667eea', color: '#333' }}>
                  <i className="fas fa-user-injured me-2" style={{ color: '#27ae60' }}></i>Victim Information
                </h6>
                <Row>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Victim Name</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <i className="fas fa-user me-2" style={{ color: '#2c3e50' }}></i>{viewingFIR.victim_name}
                    </p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Victim Phone</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <i className="fas fa-mobile-alt me-2" style={{ color: '#27ae60' }}></i>{viewingFIR.victim_phone}
                    </p>
                  </Col>
                  <Col md={12} className="mb-0">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Victim Email</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', wordBreak: 'break-word' }}>
                      <i className="fas fa-envelope me-2" style={{ color: '#e74c3c' }}></i>{viewingFIR.victim_email}
                    </p>
                  </Col>
                </Row>
              </div>

              {/* Accused Information */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h6 className="fw-bold mb-3 pb-2" style={{ borderBottom: '2px solid #667eea', color: '#333' }}>
                  <i className="fas fa-user-slash me-2" style={{ color: '#e74c3c' }}></i>Accused Information
                </h6>
                <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Accused Name</p>
                <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                  <i className="fas fa-user-secret me-2" style={{ color: '#8b0000' }}></i>{viewingFIR.accused_name}
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #dee2e6', padding: '1rem' }}>
          <Button variant="secondary" onClick={() => setShowViewModal(false)} style={{ borderRadius: '6px', padding: '0.5rem 1.5rem' }}>
            <i className="fas fa-times me-2"></i>Close
          </Button>
        </Modal.Footer>
      </Modal>
        </Container>
      </div>
    </>
  );
};

export default FIRManagement;
