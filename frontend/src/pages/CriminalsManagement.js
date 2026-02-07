import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { criminalsAPI } from '../api/client';
import '../styles/dashboard.css';

const CriminalsManagement = () => {
  const navigate = useNavigate();
  const [criminals, setCriminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Criminal Management</h2>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)} className="me-2">
            <i className="fas fa-arrow-left me-2"></i>Back
          </Button>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Criminal'}
          </Button>
        </Col>
      </Row>

      {showForm && (
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-primary text-white fw-bold">
            Add New Criminal
          </Card.Header>
          <Card.Body>
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
                    <Form.Control
                      type="text"
                      name="crime_type"
                      value={formData.crime_type}
                      onChange={handleFormChange}
                      required
                    />
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

              <Button variant="success" type="submit" className="w-100">
                Add Criminal
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

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
                    href={`/admin/criminal/${criminal.id}`}
                    variant="info"
                    size="sm"
                    className="me-2"
                  >
                    View
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(criminal.id)}
                  >
                    Delete
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
  );
};

export default CriminalsManagement;
