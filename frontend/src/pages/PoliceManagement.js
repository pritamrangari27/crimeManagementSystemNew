import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { policeAPI } from '../api/client';

const PoliceManagement = () => {
  const navigate = useNavigate();
  const [police, setPolice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Police Management</h2>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)} className="me-2">
            <i className="fas fa-arrow-left me-2"></i>Back
          </Button>
          <Button variant="primary" onClick={() => setShowForm(true)}>
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
          <Button variant="success" onClick={(e) => handleAddPolice(e)}>
            Add Police Officer
          </Button>
        </Modal.Footer>
      </Modal>

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
                    onClick={() => navigate(`/admin/police/${officer.id}`)}
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
  );
};

export default PoliceManagement;
