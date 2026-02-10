import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { stationsAPI } from '../api/client';

const StationsManagement = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
                    onClick={() => navigate(`/admin/station/${station.id}`)}
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
    </Container>
  );
};

export default StationsManagement;
