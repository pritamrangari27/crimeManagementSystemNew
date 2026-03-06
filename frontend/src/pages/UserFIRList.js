import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Card, Badge, Button, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { firsAPI, stationsAPI } from '../api/client';
import { CRIME_TYPES } from '../constants/crimeTypes';
import '../styles/forms.css';
import '../styles/dashboard.css';

const UserFIRList = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const role = localStorage.getItem('userRole');
  const [firs, setFirs] = useState([]);
  const [filteredFirs, setFilteredFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');

  // FIR Form state
  const [showFIRModal, setShowFIRModal] = useState(false);
  const [stations, setStations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [firError, setFirError] = useState('');
  const [firSuccess, setFirSuccess] = useState('');
  const [firForm, setFirForm] = useState({
    station_id: '', crime_type: '', accused: '', name: user?.username || '',
    age: '', number: '', address: '', relation: '', purpose: '',
    location: '', crime_description: '', crime_date: '', crime_time: ''
  });

  const fetchStations = async () => {
    try {
      const response = await stationsAPI.getAll();
      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        setStations(response.data.data);
      }
    } catch (err) { console.error('Error fetching stations:', err); }
  };

  const handleOpenFIRModal = () => {
    fetchStations();
    setShowFIRModal(true);
    setFirError(''); setFirSuccess('');
  };

  const handleCloseFIRModal = () => {
    setShowFIRModal(false);
    setFirForm({
      station_id: '', crime_type: '', accused: '', name: user?.username || '',
      age: '', number: '', address: '', relation: '', purpose: '',
      location: '', crime_description: '', crime_date: '', crime_time: ''
    });
    setFirError(''); setFirSuccess('');
  };

  const handleFIRInputChange = (e) => {
    const { name, value } = e.target;
    setFirForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFIRSubmit = async (e) => {
    e.preventDefault();
    setFirError(''); setFirSuccess('');
    if (!firForm.station_id) { setFirError('Please select a police station'); return; }
    if (!firForm.crime_type) { setFirError('Please select a crime type'); return; }
    if (!firForm.accused.trim()) { setFirError('Please enter accused name'); return; }
    if (!firForm.name.trim()) { setFirError('Please enter your full name'); return; }
    if (!firForm.age || firForm.age < 1 || firForm.age > 120) { setFirError('Please enter valid age'); return; }
    if (!firForm.number || !/^\d{10,15}$/.test(firForm.number)) { setFirError('Please enter valid phone number'); return; }
    if (!firForm.address.trim()) { setFirError('Please enter address'); return; }
    if (!firForm.relation.trim()) { setFirError('Please enter relation to accused'); return; }
    if (!firForm.purpose.trim()) { setFirError('Please enter purpose of FIR'); return; }
    if (!firForm.location.trim()) { setFirError('Please enter crime location'); return; }
    if (!firForm.crime_description.trim()) { setFirError('Please enter crime description'); return; }
    if (!firForm.crime_date) { setFirError('Please enter crime date'); return; }

    setSubmitting(true);
    try {
      const firData = {
        user_id: user.id, station_id: firForm.station_id, crime_type: firForm.crime_type,
        accused: firForm.accused, name: firForm.name, age: parseInt(firForm.age),
        number: firForm.number, address: firForm.address, relation: firForm.relation,
        purpose: firForm.purpose, location: firForm.location, crime_description: firForm.crime_description,
        crime_date: firForm.crime_date, crime_time: firForm.crime_time, status: 'Sent'
      };
      const response = await firsAPI.create(firData);
      if (response.data.status === 'success') {
        setFirSuccess(`✓ FIR filed successfully! FIR ID: ${response.data.id}`);
        toast.success('FIR filed successfully!');
        setTimeout(async () => {
          handleCloseFIRModal();
          try {
            const firsRes = await firsAPI.getByUser(user.id);
            if (firsRes.data.status === 'success') setFirs(firsRes.data.data || []);
          } catch (err) { console.error('Error refreshing FIRs:', err); }
        }, 1500);
      } else { setFirError(response.data.message || 'Failed to file FIR'); }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error filing FIR';
      setFirError(msg); toast.error(msg);
    } finally { setSubmitting(false); }
  };

  // Fetch FIRs
  useEffect(() => {
    const fetchFIRs = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await firsAPI.getByUser(user.id);
        const data = response.data;
        
        if (data.status === 'success' && Array.isArray(data.data)) {
          setFirs(data.data);
        } else {
          setFirs([]);
        }
      } catch (err) {
        setError('Failed to load FIRs. Please try again later.');
        console.error('Error fetching FIRs:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchFIRs();
    }
  }, [user?.id]);

  // Filter and sort FIRs
  useEffect(() => {
    let filtered = [...firs];

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(fir => fir.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at || b.date) - new Date(a.created_at || a.date);
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      } else if (sortBy === 'crime') {
        return a.crime_type.localeCompare(b.crime_type);
      }
      return 0;
    });

    setFilteredFirs(filtered);
  }, [firs, statusFilter, sortBy]);

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Sent':
        return 'info';
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Sent':
        return 'fa-paper-plane';
      case 'Approved':
        return 'fa-check-circle';
      case 'Rejected':
        return 'fa-times-circle';
      default:
        return 'fa-circle';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Statistics
  const stats = {
    total: firs.length,
    sent: firs.filter(f => f.status === 'Sent').length,
    approved: firs.filter(f => f.status === 'Approved').length,
    rejected: firs.filter(f => f.status === 'Rejected').length
  };

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
      <Container fluid className="mgmt-container page-stagger">
        {/* Header */}
        <div className="mgmt-header">
          <div>
            <h2><i className="fas fa-list me-2"></i> My FIRs</h2>
            <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>View and track all your filed FIRs</p>
          </div>
          <div className="mgmt-header-actions">
            <button className="mgmt-btn-back" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left me-2"></i> Back
            </button>
            <button className="mgmt-btn-primary" onClick={handleOpenFIRModal}>
              <i className="fas fa-plus me-2"></i> File New FIR
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row className="mb-2">
          <Col md={3} className="mb-2">
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="py-2 px-3">
                <h6 className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Total FIRs</h6>
                <h3 className="fw-bold text-primary mb-0" style={{ fontSize: '1.3rem' }}>{stats.total}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-2">
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="py-2 px-3">
                <h6 className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Sent</h6>
                <h3 className="fw-bold text-info mb-0" style={{ fontSize: '1.3rem' }}>{stats.sent}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-2">
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="py-2 px-3">
                <h6 className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Approved</h6>
                <h3 className="fw-bold text-success mb-0" style={{ fontSize: '1.3rem' }}>{stats.approved}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-2">
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="py-2 px-3">
                <h6 className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Rejected</h6>
                <h3 className="fw-bold text-danger mb-0" style={{ fontSize: '1.3rem' }}>{stats.rejected}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters and Sorting */}
        <Card className="border-0 shadow-sm mb-2">
          <Card.Body className="py-2 px-3">
            <Row className="align-items-end">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <i className="fas fa-filter me-2"></i> Filter by Status
                  </Form.Label>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Sent">Sent</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <i className="fas fa-sort me-2"></i> Sort By
                  </Form.Label>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="date">Date (Newest First)</option>
                    <option value="status">Status</option>
                    <option value="crime">Crime Type</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* FIR Table */}
        {loading ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2 text-muted small">Loading your FIRs...</p>
              </div>
            ) : error ? (
              <Alert variant="danger" className="m-2">
                {error}
              </Alert>
            ) : filteredFirs.length === 0 ? (
              <div className="text-center py-3">
                <i className="fas fa-inbox text-muted" style={{ fontSize: '36px' }}></i>
                <p className="mt-2 text-muted small">No FIRs found</p>
              </div>
            ) : (
              <div className="mgmt-table-wrap">
                <div className="mgmt-table-scroll">
                <table className="mgmt-table">
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>FIR ID</th>
                      <th>Crime Type</th>
                      <th>Location</th>
                      <th>Accused</th>
                      <th>Complainant</th>
                      <th>Address</th>
                      <th>Station</th>
                      <th>Filed Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFirs.map((fir, idx) => (
                      <tr key={fir.id}>
                        <td>{idx + 1}</td>
                        <td className="fw-bold text-primary">
                          FIR-{String(fir.id).padStart(4, '0')}
                        </td>
                        <td>
                          <span className="mgmt-badge info">
                            {fir.crime_type}
                          </span>
                        </td>
                        <td>{fir.location || '-'}</td>
                        <td>{fir.accused || 'Unknown'}</td>
                        <td>{fir.name || fir.complainant_name || '-'}</td>
                        <td>{fir.address || fir.location || '-'}</td>
                        <td>
                          <small className="text-muted">{fir.station_id}</small>
                        </td>
                        <td className="small">
                          {formatDate(fir.created_at || fir.date)}
                        </td>
                        <td>
                          <span className={`mgmt-badge ${getStatusVariant(fir.status)}`}>
                            <i className={`fas ${getStatusIcon(fir.status)} me-1`}></i>
                            {fir.status}
                          </span>
                        </td>
                        <td>
                          <div className="mgmt-actions">
                            <button
                              className="view"
                              onClick={() => navigate(`/fir/${fir.id}`)}
                            >
                              <i className="fas fa-eye me-1"></i> View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}

        {/* Pagination Info */}
        {filteredFirs.length > 0 && (
          <div className="mt-3 text-center text-muted small">
            Showing {filteredFirs.length} of {firs.length} FIRs
          </div>
        )}

        {/* File New FIR Modal */}
        <Modal show={showFIRModal} onHide={handleCloseFIRModal} centered size="lg" dialogClassName="fir-form-modal">
          <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '14px 20px', borderBottom: 'none' }}>
            <Modal.Title style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>
              <i className="fas fa-file-contract me-2"></i>File New FIR
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: '24px', background: '#ffffff' }}>
            {firError && <Alert variant="danger" onClose={() => setFirError('')} dismissible><i className="fas fa-exclamation-circle me-2"></i>{firError}</Alert>}
            {firSuccess && <Alert variant="success" onClose={() => setFirSuccess('')} dismissible><i className="fas fa-check-circle me-2"></i>{firSuccess}</Alert>}
            <Form onSubmit={handleFIRSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <Form.Group>
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}><i className="fas fa-building me-2" style={{ color: '#10b981' }}></i>Police Station *</Form.Label>
                  <Form.Select name="station_id" value={firForm.station_id} onChange={handleFIRInputChange} required style={{ borderRadius: '8px' }}>
                    <option value="">-- Select Police Station --</option>
                    {stations.map(s => <option key={s.id} value={s.station_code || s.station_id || s.id}>{s.station_name}</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}><i className="fas fa-exclamation-triangle me-2" style={{ color: '#ef4444' }}></i>Crime Type *</Form.Label>
                  <Form.Select name="crime_type" value={firForm.crime_type} onChange={handleFIRInputChange} required style={{ borderRadius: '8px' }}>
                    <option value="">-- Select Crime Type --</option>
                    {CRIME_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </Form.Select>
                </Form.Group>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <Form.Group>
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}><i className="fas fa-map-marker-alt me-2" style={{ color: '#f59e0b' }}></i>Crime Location *</Form.Label>
                  <Form.Control type="text" name="location" value={firForm.location} onChange={handleFIRInputChange} placeholder="Enter crime location" required style={{ borderRadius: '8px' }} />
                </Form.Group>
                <Form.Group>
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}><i className="far fa-calendar me-2" style={{ color: '#3b82f6' }}></i>Crime Date *</Form.Label>
                  <Form.Control type="date" name="crime_date" value={firForm.crime_date} onChange={handleFIRInputChange} required style={{ borderRadius: '8px' }} />
                </Form.Group>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <Form.Group>
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}><i className="far fa-clock me-2" style={{ color: '#8b5cf6' }}></i>Crime Time</Form.Label>
                  <Form.Control type="time" name="crime_time" value={firForm.crime_time} onChange={handleFIRInputChange} style={{ borderRadius: '8px' }} />
                </Form.Group>
                <div></div>
              </div>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}><i className="fas fa-align-left me-2" style={{ color: '#10b981' }}></i>Crime Description *</Form.Label>
                <Form.Control as="textarea" rows={3} name="crime_description" value={firForm.crime_description} onChange={handleFIRInputChange} placeholder="Describe the crime in detail" required style={{ borderRadius: '8px' }} />
              </Form.Group>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid #10b981', marginBottom: '16px' }}>
                <h6 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0' }}><i className="fas fa-user-secret me-2"></i>Accused Information</h6>
              </div>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}>Accused Name/Description *</Form.Label>
                <Form.Control type="text" name="accused" value={firForm.accused} onChange={handleFIRInputChange} placeholder="Enter name or description of accused" required style={{ borderRadius: '8px' }} />
              </Form.Group>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <Form.Group>
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}>Full Name *</Form.Label>
                  <Form.Control type="text" name="name" value={firForm.name} onChange={handleFIRInputChange} placeholder="Your full name" required style={{ borderRadius: '8px' }} />
                </Form.Group>
                <Form.Group>
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}>Age *</Form.Label>
                  <Form.Control type="number" name="age" value={firForm.age} onChange={handleFIRInputChange} placeholder="18" min="1" max="120" required style={{ borderRadius: '8px' }} />
                </Form.Group>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <Form.Group>
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}><i className="fas fa-phone me-1" style={{ color: '#3b82f6' }}></i>Phone Number *</Form.Label>
                  <Form.Control type="tel" name="number" value={firForm.number} onChange={handleFIRInputChange} placeholder="10-15 digits" required style={{ borderRadius: '8px' }} />
                </Form.Group>
                <Form.Group>
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}><i className="fas fa-map-pin me-1" style={{ color: '#f59e0b' }}></i>Address *</Form.Label>
                  <Form.Control type="text" name="address" value={firForm.address} onChange={handleFIRInputChange} placeholder="Your address" required style={{ borderRadius: '8px' }} />
                </Form.Group>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <Form.Group>
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}>Relation to Accused *</Form.Label>
                  <Form.Control type="text" name="relation" value={firForm.relation} onChange={handleFIRInputChange} placeholder="e.g., Friend, Neighbor" required style={{ borderRadius: '8px' }} />
                </Form.Group>
                <Form.Group>
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}>Purpose of FIR *</Form.Label>
                  <Form.Control type="text" name="purpose" value={firForm.purpose} onChange={handleFIRInputChange} placeholder="e.g., Legal action" required style={{ borderRadius: '8px' }} />
                </Form.Group>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '12px 20px', gap: '8px' }}>
            <Button variant="outline-secondary" size="sm" onClick={handleCloseFIRModal} disabled={submitting} style={{ borderRadius: '8px', fontWeight: 600 }}>
              <i className="fas fa-times me-1"></i>Cancel
            </Button>
            <Button variant="success" size="sm" onClick={handleFIRSubmit} disabled={submitting} style={{ borderRadius: '8px', fontWeight: 600, background: '#10b981', border: 'none' }}>
              {submitting ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Filing FIR...</> : <><i className="fas fa-paper-plane me-1"></i>File FIR</>}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
      <Footer />
    </>
  );
};

export default UserFIRList;
