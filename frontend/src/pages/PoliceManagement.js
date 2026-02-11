import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { policeAPI } from '../api/client';
import Sidebar from '../components/Sidebar';

const PoliceManagement = () => {
  const navigate = useNavigate();
  const [police, setPolice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPolice, setSelectedPolice] = useState(null);
  const [formData, setFormData] = useState({
    police_id: '',
    name: '',
    email: '',
    phone: '',
    position: '',
    station_id: '',
    joining_date: ''
  });

  useEffect(() => {
    fetchPolice();
  }, []);

  const fetchPolice = async () => {
    try {
      const response = await policeAPI.getAll();
      if (response.data.status === 'success') {
        setPolice(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching police:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const response = await policeAPI.search(query);
        if (response.data.status === 'success') {
          setPolice(response.data.data);
        }
      } catch (error) {
        console.error('Error searching:', error);
        fetchPolice();
      }
    } else {
      fetchPolice();
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddPolice = async (e) => {
    e.preventDefault();
    try {
      await policeAPI.add(formData);
      alert('Police officer added successfully!');
      setFormData({
        police_id: '',
        name: '',
        email: '',
        phone: '',
        position: '',
        station_id: '',
        joining_date: ''
      });
      setShowForm(false);
      fetchPolice();
    } catch (error) {
      alert('Error adding police: ' + error.response?.data?.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await policeAPI.delete(id);
        alert('Police officer deleted!');
        fetchPolice();
      } catch (error) {
        alert('Error deleting police');
      }
    }
  };

  const handleViewPolice = (officer) => {
    setSelectedPolice(officer);
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
          <h2 className="fw-bold">Police Management</h2>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)} className="me-2">
            <i className="fas fa-arrow-left me-2"></i>Back
          </Button>
          <Button style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: '600' }} size="sm" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus me-2"></i>Add Police Officer
          </Button>
        </Col>
      </Row>

      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Police Officer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddPolice}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Police ID *</Form.Label>
                  <Form.Control
                    type="text"
                    name="police_id"
                    value={formData.police_id}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Position</Form.Label>
                  <Form.Control
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Joining Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowForm(false)}>
            Close
          </Button>
          <Button style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: '600' }} onClick={(e) => handleAddPolice(e)}>
            Add Police Officer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Police Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered backdrop="static">
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px 8px 0 0' }}>
          <Modal.Title style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <i className="fas fa-shield me-3"></i>Police Officer Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#f8f9fa', padding: '2rem' }}>
          {selectedPolice && (
            <div>
              {/* Officer Name Section */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h5 className="fw-bold mb-3" style={{ color: '#333', fontSize: '1.3rem' }}>
                  <i className="fas fa-user-tie me-2" style={{ color: '#667eea' }}></i>{selectedPolice.name}
                </h5>
                <p className="text-muted mb-0">
                  <span className="badge bg-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>ID: {selectedPolice.police_id}</span>
                </p>
              </div>

              {/* Contact Information */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h6 className="fw-bold mb-3 pb-2" style={{ borderBottom: '2px solid #667eea', color: '#333' }}>
                  <i className="fas fa-phone-alt me-2" style={{ color: '#e74c3c' }}></i>Contact Information
                </h6>
                <Row>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Email</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', wordBreak: 'break-word' }}>
                      <i className="fas fa-envelope me-2" style={{ color: '#3498db' }}></i>{selectedPolice.email}
                    </p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Phone</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <i className="fas fa-mobile-alt me-2" style={{ color: '#27ae60' }}></i>{selectedPolice.phone}
                    </p>
                  </Col>
                </Row>
              </div>

              {/* Assignment Information */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h6 className="fw-bold mb-3 pb-2" style={{ borderBottom: '2px solid #667eea', color: '#333' }}>
                  <i className="fas fa-building me-2" style={{ color: '#f39c12' }}></i>Station Assignment
                </h6>
                <Row>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Station Name</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <i className="fas fa-map-location-dot me-2" style={{ color: '#1abc9c' }}></i>{selectedPolice.station_name}
                    </p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Station ID</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <span className="badge bg-secondary">{selectedPolice.station_id}</span>
                    </p>
                  </Col>
                </Row>
              </div>

              {/* Specialization & Address */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h6 className="fw-bold mb-3 pb-2" style={{ borderBottom: '2px solid #667eea', color: '#333' }}>
                  <i className="fas fa-briefcase me-2" style={{ color: '#9b59b6' }}></i>Professional Details
                </h6>
                <Row>
                  <Col md={12} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Specialization</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <span className="badge bg-danger">{selectedPolice.crime_type}</span>
                    </p>
                  </Col>
                  <Col md={12} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Address</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', wordBreak: 'break-word' }}>
                      <i className="fas fa-location-dot me-2" style={{ color: '#e67e22' }}></i>{selectedPolice.address}
                    </p>
                  </Col>
                  <Col md={12} className="mb-0">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Date Joined</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <i className="far fa-calendar me-2" style={{ color: '#2980b9' }}></i>{selectedPolice.created_at ? new Date(selectedPolice.created_at).toLocaleDateString() : 'N/A'}
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
          placeholder="🔍 Search by name, email, phone, or station..."
          value={searchQuery}
          onChange={handleSearch}
          style={{ borderRadius: '8px', border: '2px solid #e0e0e0', padding: '0.75rem', fontSize: '0.95rem' }}
        />
      </Form.Group>

      <Table striped bordered hover responsive>
        <thead className="bg-dark text-white">
          <tr>
            <th>Police ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Position</th>
            <th>Station</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {police.length > 0 ? (
            police.map((officer) => (
              <tr key={officer.id}>
                <td>{officer.police_id}</td>
                <td>{officer.name}</td>
                <td>{officer.email}</td>
                <td>{officer.phone}</td>
                <td>{officer.position}</td>
                <td>{officer.station_name}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handleViewPolice(officer)}
                  >
                    <i className="fas fa-eye me-1"></i>View
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(officer.id)}
                  >
                    <i className="fas fa-trash me-1"></i>Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No police officers found
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

export default PoliceManagement;
