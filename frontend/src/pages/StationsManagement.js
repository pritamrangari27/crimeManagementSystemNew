import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { stationsAPI } from '../api/client';
import Sidebar from '../components/Sidebar';

const StationsManagement = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [formData, setFormData] = useState({
    station_name: '',
    station_code: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    in_charge: ''
  });

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await stationsAPI.getAll();
      if (response.data.status === 'success') {
        setStations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const response = await stationsAPI.search(query);
        if (response.data.status === 'success') {
          setStations(response.data.data);
        }
      } catch (error) {
        console.error('Error searching:', error);
        fetchStations();
      }
    } else {
      fetchStations();
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddStation = async (e) => {
    e.preventDefault();
    try {
      await stationsAPI.add(formData);
      alert('Police station added successfully!');
      setFormData({
        station_name: '',
        station_code: '',
        address: '',
        city: '',
        state: '',
        phone: '',
        email: '',
        in_charge: ''
      });
      setShowForm(false);
      fetchStations();
    } catch (error) {
      alert('Error adding station: ' + error.response?.data?.message);
    }
  };

  const handleViewStation = (station) => {
    setSelectedStation(station);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await stationsAPI.delete(id);
        alert('Station deleted!');
        fetchStations();
      } catch (error) {
        alert('Error deleting station: ' + error.response?.data?.message);
      }
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
        <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Police Station Management</h2>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)} className="me-2">
            <i className="fas fa-arrow-left me-2"></i>Back
          </Button>
          <Button style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: '600' }} size="sm" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus me-2"></i>Add Station
          </Button>
        </Col>
      </Row>

      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Police Station</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddStation}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Station Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="station_name"
                    value={formData.station_name}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Station Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="station_code"
                    value={formData.station_code}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Address *</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City *</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>State *</Form.Label>
                  <Form.Control
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
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
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>In-Charge Officer</Form.Label>
              <Form.Control
                type="text"
                name="in_charge"
                value={formData.in_charge}
                onChange={handleFormChange}
                placeholder="Name of in-charge officer"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowForm(false)}>
            Close
          </Button>
          <Button style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: '600' }} onClick={(e) => handleAddStation(e)}>
            Add Station
          </Button>
        </Modal.Footer>
      </Modal>

      <Form.Group className="mb-4">
        <Form.Control
          type="text"
          placeholder="🔍 Search by station name, code, city, or state..."
          value={searchQuery}
          onChange={handleSearch}
          style={{ borderRadius: '8px', border: '2px solid #e0e0e0', padding: '0.75rem', fontSize: '0.95rem' }}
        />
      </Form.Group>

      <Table striped bordered hover responsive>
        <thead className="bg-dark text-white">
          <tr>
            <th>Station Name</th>
            <th>Code</th>
            <th>City</th>
            <th>State</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stations.length > 0 ? (
            stations.map((station) => (
              <tr key={station.id}>
                <td>{station.station_name}</td>
                <td>{station.station_code}</td>
                <td>{station.city}</td>
                <td>{station.state}</td>
                <td>{station.phone}</td>
                <td>{station.email}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handleViewStation(station)}
                  >
                    <i className="fas fa-eye me-1"></i>View
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(station.id)}
                  >
                    <i className="fas fa-trash me-1"></i>Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No stations found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg" backdrop="static">
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px 8px 0 0' }}>
          <Modal.Title style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <i className="fas fa-police me-3"></i>Police Station Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#f8f9fa', padding: '2rem' }}>
          {selectedStation && (
            <div>
              {/* Station Name Section */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h5 className="fw-bold mb-3" style={{ color: '#333', fontSize: '1.3rem' }}>
                  <i className="fas fa-building me-2" style={{ color: '#667eea' }}></i>{selectedStation.station_name}
                </h5>
                <p className="text-muted mb-0">
                  <span className="badge bg-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>{selectedStation.station_code}</span>
                </p>
              </div>

              {/* Contact Information */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h6 className="fw-bold mb-3 pb-2" style={{ borderBottom: '2px solid #667eea', color: '#333' }}>
                  <i className="fas fa-phone-alt me-2" style={{ color: '#e74c3c' }}></i>Contact Information
                </h6>
                <Row>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Phone</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <i className="fas fa-mobile-alt me-2" style={{ color: '#27ae60' }}></i>{selectedStation.phone}
                    </p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Email</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', wordBreak: 'break-word' }}>
                      <i className="fas fa-envelope me-2" style={{ color: '#3498db' }}></i>{selectedStation.email}
                    </p>
                  </Col>
                </Row>
              </div>

              {/* Location Information */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h6 className="fw-bold mb-3 pb-2" style={{ borderBottom: '2px solid #667eea', color: '#333' }}>
                  <i className="fas fa-map-location-dot me-2" style={{ color: '#f39c12' }}></i>Location
                </h6>
                <Row>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>State</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <span className="badge bg-info">{selectedStation.state}</span>
                    </p>
                  </Col>
                  <Col md={6} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>City</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                      <span className="badge bg-info">{selectedStation.city}</span>
                    </p>
                  </Col>
                  <Col md={12} className="mb-3">
                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Full Address</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', wordBreak: 'break-word' }}>
                      <i className="fas fa-location-dot me-2" style={{ color: '#1abc9c' }}></i>{selectedStation.address}
                    </p>
                  </Col>
                </Row>
              </div>

              {/* In-Charge Officer */}
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h6 className="fw-bold mb-3 pb-2" style={{ borderBottom: '2px solid #667eea', color: '#333' }}>
                  <i className="fas fa-user-tie me-2" style={{ color: '#9b59b6' }}></i>Management
                </h6>
                <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>In-Charge Officer</p>
                <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                  <i className="fas fa-user-shield me-2" style={{ color: '#2980b9' }}></i>{selectedStation.in_charge}
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

export default StationsManagement;
