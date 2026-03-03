import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { criminalsAPI } from '../api/client';
import { CRIME_TYPES } from '../constants/crimeTypes';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';

const CriminalsManagement = () => {
  const navigate = useNavigate();
  const [criminals, setCriminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCriminal, setSelectedCriminal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    criminal_name: '',
    crime_type: '',
    crime_date: '',
    crime_location: '',
    email: '',
    contact: '',
    date_of_birth: '',
    gender: '',
    state: '',
    city: '',
    address: ''
  });

  useEffect(() => {
    fetchCriminals();
  }, []);

  const fetchCriminals = async () => {
    try {
      const response = await criminalsAPI.getAll();
      if (response.data.status === 'success') {
        setCriminals(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching criminals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const response = await criminalsAPI.search(query);
        if (response.data.status === 'success') {
          setCriminals(response.data.data);
        }
      } catch (error) {
        console.error('Error searching:', error);
      }
    } else {
      fetchCriminals();
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddCriminal = async (e) => {
    e.preventDefault();
    try {
      await criminalsAPI.add(formData);
      alert('Criminal added successfully!');
      setFormData({
        criminal_name: '',
        crime_type: '',
        crime_date: '',
        crime_location: '',
        email: '',
        contact: '',
        date_of_birth: '',
        gender: '',
        state: '',
        city: '',
        address: ''
      });
      setShowForm(false);
      fetchCriminals();
    } catch (error) {
      alert('Error adding criminal: ' + error.response?.data?.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await criminalsAPI.delete(id);
        alert('Criminal deleted!');
        fetchCriminals();
      } catch (error) {
        alert('Error deleting criminal');
      }
    }
  };

  const handleViewCriminal = (criminal) => {
    setSelectedCriminal(criminal);
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
          <h2 className="fw-bold">Criminal Management</h2>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)} className="me-2">
            <i className="fas fa-arrow-left me-2"></i>Back
          </Button>
          <Button style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: '600' }} size="sm" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus me-2"></i>Add Criminal
          </Button>
        </Col>
      </Row>

      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Criminal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form onSubmit={handleAddCriminal}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Criminal Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="criminal_name"
                      value={formData.criminal_name}
                      onChange={handleFormChange}
                      required
                    />
                  </Form.Group>
                </Col>
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
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Contact</Form.Label>
                    <Form.Control
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Crime Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="crime_date"
                      value={formData.crime_date}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Crime Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="crime_location"
                      value={formData.crime_location}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleFormChange}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleFormChange}
                />
              </Form.Group>

            </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowForm(false)}>
            Close
          </Button>
          <Button style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: '600' }} onClick={(e) => handleAddCriminal(e)}>
            Add Criminal
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Criminal Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered backdrop="static">
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px 8px 0 0' }}>
          <Modal.Title style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <i className="fas fa-user-secret me-3"></i>Criminal Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#f8f9fa', padding: '2rem' }}>
          {selectedCriminal && (
            <div>
              {/* Name Section */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h5 className="fw-bold mb-3" style={{ color: '#333', fontSize: '1.3rem' }}>
                  <i className="fas fa-id-card me-2" style={{ color: '#667eea' }}></i>{selectedCriminal.criminal_name}
                </h5>
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
                      <span className="badge bg-danger" style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}>{selectedCriminal.crime_type}</span>
                    </p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Crime Date</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <i className="far fa-calendar me-2" style={{ color: '#3498db' }}></i>{selectedCriminal.crime_date}
                    </p>
                  </Col>
                  <Col md={12} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Crime Location</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <i className="fas fa-map-pin me-2" style={{ color: '#e67e22' }}></i>{selectedCriminal.crime_location}
                    </p>
                  </Col>
                </Row>
              </div>

              {/* Personal Information */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h6 className="fw-bold mb-3 pb-2" style={{ borderBottom: '2px solid #667eea', color: '#333' }}>
                  <i className="fas fa-user-circle me-2" style={{ color: '#27ae60' }}></i>Personal Details
                </h6>
                <Row>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Date of Birth</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <i className="fas fa-birthday-cake me-2" style={{ color: '#9b59b6' }}></i>{selectedCriminal.date_of_birth}
                    </p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Gender</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <span className="badge bg-info" style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}>{selectedCriminal.gender}</span>
                    </p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Email</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', wordBreak: 'break-word' }}>
                      <i className="fas fa-envelope me-2" style={{ color: '#e74c3c' }}></i>{selectedCriminal.email}
                    </p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Contact</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <i className="fas fa-phone me-2" style={{ color: '#3498db' }}></i>{selectedCriminal.contact}
                    </p>
                  </Col>
                </Row>
              </div>

              {/* Address Information */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h6 className="fw-bold mb-3 pb-2" style={{ borderBottom: '2px solid #667eea', color: '#333' }}>
                  <i className="fas fa-home me-2" style={{ color: '#f39c12' }}></i>Address
                </h6>
                <Row>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>State</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>{selectedCriminal.state}</p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>City</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>{selectedCriminal.city}</p>
                  </Col>
                  <Col md={12} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Full Address</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', wordBreak: 'break-word' }}>
                      <i className="fas fa-location-dot me-2" style={{ color: '#1abc9c' }}></i>{selectedCriminal.address}
                    </p>
                  </Col>
                </Row>
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

      <Form.Group className="mb-4">
        <Form.Control
          type="text"
          placeholder="Search by name, email, or contact..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </Form.Group>

      <Table striped bordered hover responsive>
        <thead className="bg-dark text-white">
          <tr>
            <th>Name</th>
            <th>Crime Type</th>
            <th>Location</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {criminals.length > 0 ? (
            criminals.map((criminal) => (
              <tr key={criminal.id}>
                <td>{criminal.criminal_name}</td>
                <td>{criminal.crime_type}</td>
                <td>{criminal.crime_location}</td>
                <td>{criminal.email}</td>
                <td>{criminal.contact}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handleViewCriminal(criminal)}
                  >
                    <i className="fas fa-eye me-1"></i>View
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(criminal.id)}
                  >
                    <i className="fas fa-trash me-1"></i>Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No criminals found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
        </Container>
      </div>
    </>
  );
};

export default CriminalsManagement;
