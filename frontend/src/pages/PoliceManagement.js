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
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="md" centered dialogClassName="fir-view-modal">
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '12px 18px', borderBottom: 'none' }}>
          <Modal.Title style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>
            <i className="fas fa-shield-halved me-2" style={{ color: '#10b981' }}></i>
            Police Officer Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '16px 20px', background: '#ffffff' }}>
          {selectedPolice && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Officer Name</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-user-tie me-1" style={{ color: '#10b981', fontSize: '0.8rem' }}></i>{selectedPolice.name}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Police ID</span>
                <p style={{ margin: '2px 0 0' }}><span className="badge bg-primary" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>{selectedPolice.police_id}</span></p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a', wordBreak: 'break-word' }}><i className="fas fa-envelope me-1" style={{ color: '#3b82f6', fontSize: '0.8rem' }}></i>{selectedPolice.email}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-phone me-1" style={{ color: '#10b981', fontSize: '0.8rem' }}></i>{selectedPolice.phone}</p>
              </div>
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', margin: '2px 0' }}></div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Station Name</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-building me-1" style={{ color: '#f59e0b', fontSize: '0.8rem' }}></i>{selectedPolice.station_name}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Specialization</span>
                <p style={{ margin: '2px 0 0' }}><span className="badge bg-danger" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>{selectedPolice.crime_type}</span></p>
              </div>
              <div style={{ gridColumn: '1 / -1', background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', borderLeft: '3px solid #10b981' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</span>
                <p style={{ margin: '2px 0 0', fontWeight: 500, color: '#334155', lineHeight: 1.4, fontSize: '0.84rem' }}><i className="fas fa-location-dot me-1" style={{ color: '#ef4444', fontSize: '0.8rem' }}></i>{selectedPolice.address}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date Joined</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="far fa-calendar me-1" style={{ color: '#3b82f6', fontSize: '0.8rem' }}></i>{selectedPolice.created_at ? new Date(selectedPolice.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '10px 20px', justifyContent: 'center' }}>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowViewModal(false)} style={{ borderRadius: '8px', padding: '5px 20px', fontWeight: 600 }}>
            <i className="fas fa-times me-1"></i>Close
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
