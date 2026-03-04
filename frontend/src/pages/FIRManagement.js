import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { firsAPI } from '../api/client';
import { CRIME_TYPES } from '../constants/crimeTypes';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import '../styles/dashboard.css';

const FIRManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');
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
        <Container fluid className="mgmt-container page-stagger">
      <div className="mgmt-header">
        <h2>FIR Management</h2>
        <div className="mgmt-header-actions">
          <button className="mgmt-btn-back" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-2"></i>Back
          </button>
          <button className="mgmt-btn-primary" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus me-2"></i>File New FIR
          </button>
        </div>
      </div>

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

      <div className="mgmt-controls">
          <input
            type="text"
            className="mgmt-search"
            placeholder="&#128269; Search by crime type, victim name, accused name..."
            value={searchQuery}
            onChange={handleSearch}
          />
          <select
            className="mgmt-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All FIRs</option>
            <option value="Sent">Sent</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
      </div>

      <div className="mgmt-table-wrap">
        <div className="mgmt-table-scroll">
      <table className="mgmt-table">
        <thead>
          <tr>
            <th>FIR Number</th>
            <th>Crime Type</th>
            <th>Location</th>
            <th>Accused</th>
            <th>Complainant</th>
            <th>Address</th>
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
                <td>{fir.location || '-'}</td>
                <td>{fir.accused || '-'}</td>
                <td>{fir.name || fir.complainant_name || '-'}</td>
                <td>{fir.address || '-'}</td>
                <td>{new Date(fir.created_at).toLocaleDateString()}</td>
                <td>
                  <span
                    className={`mgmt-badge ${
                      fir.status === 'Approved'
                        ? 'success'
                        : fir.status === 'Rejected'
                        ? 'danger'
                        : 'info'
                    }`}
                  >
                    {fir.status}
                  </span>
                </td>
                <td>High</td>
                <td>
                  <div className="mgmt-actions">
                    <button
                      onClick={() => handleViewFIR(fir)}
                      className="view"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="mgmt-empty">
                No FIRs found
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
            <i className="fas fa-file-invoice me-2" style={{ color: '#10b981' }}></i>
            FIR Details
            {viewingFIR && (
              <span className={`badge bg-${viewingFIR.status === 'Approved' ? 'success' : viewingFIR.status === 'Rejected' ? 'danger' : 'info'} ms-2`} style={{ fontSize: '0.7rem', padding: '4px 8px', verticalAlign: 'middle' }}>
                {viewingFIR.status}
              </span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '16px 20px', background: '#ffffff' }}>
          {viewingFIR && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: '0.85rem' }}>
              {/* Row 1 */}
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>FIR Number</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}>FIR-{String(viewingFIR.id).padStart(4, '0')}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crime Type</span>
                <p style={{ margin: '2px 0 0' }}><span className="badge bg-danger" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>{viewingFIR.crime_type}</span></p>
              </div>
              {/* Row 2 */}
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crime Date</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="far fa-calendar me-1" style={{ color: '#3b82f6', fontSize: '0.8rem' }}></i>{viewingFIR.crime_date || 'N/A'}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crime Location</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-map-pin me-1" style={{ color: '#f59e0b', fontSize: '0.8rem' }}></i>{viewingFIR.crime_location || 'N/A'}</p>
              </div>
              {/* Description - full width */}
              <div style={{ gridColumn: '1 / -1', background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', borderLeft: '3px solid #10b981' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</span>
                <p style={{ margin: '2px 0 0', fontWeight: 500, color: '#334155', lineHeight: 1.4, fontSize: '0.84rem' }}>{viewingFIR.description || 'N/A'}</p>
              </div>
              {/* Divider */}
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', margin: '2px 0' }}></div>
              {/* Victim Info */}
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Victim Name</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-user-shield me-1" style={{ color: '#10b981', fontSize: '0.8rem' }}></i>{viewingFIR.victim_name || 'N/A'}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Victim Phone</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-phone me-1" style={{ color: '#10b981', fontSize: '0.8rem' }}></i>{viewingFIR.victim_phone || 'N/A'}</p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Victim Email</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a', wordBreak: 'break-word' }}><i className="fas fa-envelope me-1" style={{ color: '#3b82f6', fontSize: '0.8rem' }}></i>{viewingFIR.victim_email || 'N/A'}</p>
              </div>
              {/* Divider */}
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', margin: '2px 0' }}></div>
              {/* Accused & Filing */}
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Accused Name</span>
                <p style={{ margin: '2px 0 0', fontWeight: 700, color: '#ef4444' }}><i className="fas fa-user-secret me-1" style={{ fontSize: '0.8rem' }}></i>{viewingFIR.accused_name || 'N/A'}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filed On</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="far fa-clock me-1" style={{ color: '#f59e0b', fontSize: '0.8rem' }}></i>{viewingFIR.created_at ? new Date(viewingFIR.created_at).toLocaleDateString() : 'N/A'}</p>
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
      <Footer />
    </>
  );
};

export default FIRManagement;
