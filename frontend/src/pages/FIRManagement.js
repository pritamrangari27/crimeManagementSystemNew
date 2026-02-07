import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { firsAPI } from '../api/client';
import { CRIME_TYPES } from '../constants/crimeTypes';

const FIRManagement = () => {
  const navigate = useNavigate();
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
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

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">FIR Management</h2>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)} className="me-2">
            <i className="fas fa-arrow-left me-2"></i>Back
          </Button>
          <Button variant="primary" onClick={() => setShowForm(true)}>
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
                    onClick={() => navigate(`/fir/${fir.id}`)}
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
    </Container>
  );
};

export default FIRManagement;
