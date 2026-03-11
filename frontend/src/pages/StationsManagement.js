import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Modal, Form, Row, Col, Button, Badge, Table } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { stationsAPI } from '../api/client';
import ConfirmModal from '../components/ConfirmModal';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';

const StationsManagement = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [allStations, setAllStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
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
        setAllStations(response.data.data);
        setStations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      const q = query.toLowerCase();
      setStations(allStations.filter(station =>
        Object.values(station).some(v => String(v || '').toLowerCase().includes(q))
      ));
    } else {
      setStations(allStations);
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
      toast.success('Police station added successfully!');
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
      toast.error('Error: ' + (error.response?.data?.message || 'Failed to add station'));
    }
  };

  const handleViewStation = (station) => {
    setSelectedStation(station);
    setShowViewModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await stationsAPI.delete(deleteId);
      toast.success('Police station deleted successfully!');
      fetchStations();
    } catch (error) {
      toast.error('Error: ' + (error.response?.data?.message || 'Failed to delete station'));
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
        <Container fluid className="mgmt-container page-stagger">
      <div className="mgmt-header">
        <h2>Police Station Management</h2>
        <div className="mgmt-header-actions">
          <button className="mgmt-btn-back" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-2"></i>Back
          </button>
          <button className="mgmt-btn-primary" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus me-2"></i>Add Station
          </button>
        </div>
      </div>

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
        <Modal.Footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button variant="secondary" onClick={() => setShowForm(false)}>
            Close
          </Button>
          <Button style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: '600' }} onClick={(e) => handleAddStation(e)}>
            Add Station
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="mgmt-controls">
        <input
          type="text"
          className="mgmt-search"
          placeholder="&#128269; Search by station name, code, city, or state..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <div className="mgmt-table-wrap">
        <div className="mgmt-table-scroll">
      <table className="mgmt-table">
        <thead>
          <tr>
            <th>Sr. No.</th>
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
            stations.map((station, idx) => (
              <tr key={station.id}>
                <td>{idx + 1}</td>
                <td>{station.station_name}</td>
                <td>{station.station_code}</td>
                <td>{station.city}</td>
                <td>{station.state}</td>
                <td>{station.phone}</td>
                <td>{station.email}</td>
                <td>
                  <div className="mgmt-actions">
                    <button className="view" onClick={() => handleViewStation(station)}>
                      <i className="fas fa-eye me-1"></i>View
                    </button>
                    <button className="delete" onClick={() => handleDeleteClick(station.id)}>
                      <i className="fas fa-trash me-1"></i>Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="mgmt-empty">
                No stations found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      </div>

      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="md" dialogClassName="fir-view-modal">
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '12px 18px', borderBottom: 'none' }}>
          <Modal.Title style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>
            <i className="fas fa-building-shield me-2" style={{ color: '#10b981' }}></i>
            Police Station Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '16px 20px', background: '#ffffff' }}>
          {selectedStation && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Station Name</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-building me-1" style={{ color: '#10b981', fontSize: '0.8rem' }}></i>{selectedStation.station_name}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Station Code</span>
                <p style={{ margin: '2px 0 0' }}><span className="badge bg-primary" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>{selectedStation.station_code}</span></p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-phone me-1" style={{ color: '#10b981', fontSize: '0.8rem' }}></i>{selectedStation.phone}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a', wordBreak: 'break-word' }}><i className="fas fa-envelope me-1" style={{ color: '#3b82f6', fontSize: '0.8rem' }}></i>{selectedStation.email}</p>
              </div>
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', margin: '2px 0' }}></div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>State</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}>{selectedStation.state}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>City</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}>{selectedStation.city}</p>
              </div>
              <div style={{ gridColumn: '1 / -1', background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', borderLeft: '3px solid #10b981' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Address</span>
                <p style={{ margin: '2px 0 0', fontWeight: 500, color: '#334155', lineHeight: 1.4, fontSize: '0.84rem' }}><i className="fas fa-location-dot me-1" style={{ color: '#ef4444', fontSize: '0.8rem' }}></i>{selectedStation.address}</p>
              </div>
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', margin: '2px 0' }}></div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>In-Charge Officer</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-user-shield me-1" style={{ color: '#8b5cf6', fontSize: '0.8rem' }}></i>{selectedStation.in_charge}</p>
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
        </Container>
      </div>
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => { setShowDeleteModal(false); setDeleteId(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Police Station"
        message="Are you sure you want to delete this station? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        icon="fas fa-trash-alt"
        loading={deleting}
      />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="colored" />
      <Footer />
    </>
  );
};

export default StationsManagement;
