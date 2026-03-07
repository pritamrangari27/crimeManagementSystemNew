import React, { useState, useEffect } from 'react';
import { Container, Badge, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const role = localStorage.getItem('userRole');
  const [firs, setFirs] = useState([]);
  const [filteredFirs, setFilteredFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [viewingFIR, setViewingFIR] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);

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

  // View FIR Details
  const handleViewFIR = (fir) => { 
    setViewingFIR(fir); 
    setShowViewModal(true); 
  };

  // Auto-open modal if FIR ID passed from notification
  useEffect(() => {
    if (location.state?.viewFIRId && firs.length > 0) {
      const firToView = firs.find(f => f.id === location.state.viewFIRId);
      if (firToView) {
        handleViewFIR(firToView);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state?.viewFIRId, firs]);

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

  const statCards = [
    { label: 'Total FIRs',  value: stats.total,      color: '#0f172a', icon: 'fas fa-file-alt', bg: 'rgba(15,23,42,0.08)' },
    { label: 'Sent',        value: stats.sent,       color: '#06b6d4', icon: 'fas fa-paper-plane', bg: 'rgba(6,182,212,0.10)' },
    { label: 'Approved',    value: stats.approved,   color: '#10b981', icon: 'fas fa-check-circle', bg: 'rgba(16,185,129,0.10)' },
    { label: 'Rejected',    value: stats.rejected,   color: '#ef4444', icon: 'fas fa-times-circle', bg: 'rgba(239,68,68,0.10)' },
  ];

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
      <Container fluid className="mgmt-container page-stagger">
        {/* Header with Actions in One Line */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '14px',
          gap: '10px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 0, fontWeight: 700 }}>
              <i className="fas fa-list me-2"></i> My FIRs
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>View and track all your filed FIRs</p>
          </div>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'flex-end'
          }}>
            <button
              className="mgmt-btn-back"
              onClick={() => navigate(-1)}
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              <i className="fas fa-arrow-left me-1"></i> Back
            </button>
            <button
              className="mgmt-btn-primary"
              onClick={handleOpenFIRModal}
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              <i className="fas fa-plus me-1"></i> File New FIR
            </button>
            <button
              className="mgmt-btn-primary mgmt-btn-table-modal"
              onClick={() => setShowTableModal(true)}
              style={{
                padding: '6px 12px',
                fontSize: '0.85rem'
              }}
            >
              <i className="fas fa-table me-1"></i> View Table
            </button>
          </div>
        </div>

        {/* Statistics Grid - Bento Style */}
        <div className="bento-grid cols-4 stagger-enter" style={{ marginBottom: 'var(--grid-gap)' }}>
          {statCards.map((s, i) => (
            <div key={i} className="bento-card" style={{ padding: 'var(--card-pad-sm)' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="bento-stat-label">{s.label}</div>
                  <div className="bento-stat-value" style={{ color: s.color }}>{s.value}</div>
                </div>
                <div className="bento-stat-icon" style={{ background: s.bg, color: s.color }}>
                  <i className={s.icon}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Sorting - One Line */}
        <div className="bento-card" style={{ padding: '12px 16px', marginBottom: 'var(--grid-gap)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="fw-bold" style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block', color: '#0f172a' }}>
                <i className="fas fa-filter me-1"></i> Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '0.8rem',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  background: '#fff',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.10)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Sent">Sent</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="fw-bold" style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block', color: '#0f172a' }}>
                <i className="fas fa-sort me-1"></i> Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '0.8rem',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  background: '#fff',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.10)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="date">Date (Newest First)</option>
                <option value="status">Status</option>
                <option value="crime">Crime Type</option>
              </select>
            </div>
          </div>
        </div>

        {/* FIR Table */}
        <div className="bento-card stagger-enter" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', fontWeight: 700, fontSize: '0.8rem', borderBottom: '1.5px solid #e2e8f0', color: '#0f172a' }}>
            <i className="fas fa-list-alt me-2" style={{ color: '#10b981' }}></i>FIR Records
          </div>
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
            <div style={{ padding: '30px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              No FIRs found
            </div>
          ) : (
            <div className="dense-table-wrap" style={{ border: 'none', borderRadius: 0, boxShadow: 'none', maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }}>
              <table className="table table-sm mb-0">
                <thead>
                  <tr>
                    <th>FIR ID</th>
                    <th>Crime Type</th>
                    <th>Location</th>
                    <th>Accused</th>
                    <th>Complainant</th>
                    <th>Filed Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFirs.map((fir) => (
                    <tr key={fir.id}>
                      <td style={{ fontWeight: 600 }}>FIR-{String(fir.id).padStart(4, '0')}</td>
                      <td>{fir.crime_type}</td>
                      <td>{fir.location || '-'}</td>
                      <td className="fw-bold text-danger">{fir.accused || fir.accused_name || 'Unknown'}</td>
                      <td>{fir.name || fir.complainant_name || '-'}</td>
                      <td>{new Date(fir.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge bg-${getStatusVariant(fir.status)}`} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                          {fir.status}
                        </span>
                      </td>
                      <td>
                        <Button onClick={() => handleViewFIR(fir)} variant="info" size="sm"
                          style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 6 }}>
                          <i className="fas fa-eye me-1"></i>View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Info */}
        {filteredFirs.length > 0 && (
          <div style={{ marginTop: '10px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
            Showing {filteredFirs.length} of {firs.length} FIRs
          </div>
        )}

        {/* FIR Table Modal - Mobile Only */}
        <Modal show={showTableModal} onHide={() => setShowTableModal(false)} size="xl" fullscreen="sm-down" centered>
          <Modal.Header closeButton style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}>
            <Modal.Title style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>
              <i className="fas fa-table me-2"></i>FIR Records
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: '12px', overflowX: 'auto' }}>
            {filteredFirs.length === 0 ? (
              <div className="text-center py-4">
                <i className="fas fa-inbox text-muted" style={{ fontSize: '32px' }}></i>
                <p className="mt-2 text-muted small">No FIRs found</p>
              </div>
            ) : (
              <div className="mgmt-table-scroll">
                <table className="mgmt-table" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      <th>FIR ID</th>
                      <th>Crime</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFirs.map((fir, idx) => (
                      <tr key={fir.id}>
                        <td className="fw-bold text-primary">FIR-{String(fir.id).padStart(4, '0')}</td>
                        <td><span className="mgmt-badge info" style={{ fontSize: '0.65rem' }}>{fir.crime_type}</span></td>
                        <td><span className={`mgmt-badge ${getStatusVariant(fir.status)}`} style={{ fontSize: '0.65rem' }}>{fir.status}</span></td>
                        <td className="small">{new Date(fir.created_at || fir.date).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="view"
                            onClick={() => { handleViewFIR(fir); setShowTableModal(false); }}
                            style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                          >
                            <i className="fas fa-eye me-1" style={{ fontSize: '0.65rem' }}></i> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Modal.Body>
        </Modal>

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

        {/* View FIR Details Modal */}
        <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="md" dialogClassName="fir-view-modal animated-modal">
          <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '14px 18px', borderBottom: 'none' }}>
            <Modal.Title style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>
              <i className="fas fa-file-invoice me-2" style={{ color: '#10b981' }}></i>
              FIR Details
              {viewingFIR && (
                <Badge bg={viewingFIR.status === 'Approved' ? 'success' : viewingFIR.status === 'Rejected' ? 'danger' : 'info'} className="ms-2"
                  style={{ fontSize: '0.7rem', padding: '4px 8px', verticalAlign: 'middle' }}>
                  {viewingFIR.status}
                </Badge>
              )}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: '20px 24px', background: '#ffffff' }}>
            {viewingFIR && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>FIR Number</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}>FIR-{String(viewingFIR.id).padStart(4, '0')}</p>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crime Type</span>
                  <p style={{ margin: '4px 0 0' }}><span className="badge bg-danger" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>{viewingFIR.crime_type}</span></p>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crime Date</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="far fa-calendar me-1" style={{ color: '#3b82f6', fontSize: '0.8rem' }}></i>{viewingFIR.crime_date || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crime Location</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-map-pin me-1" style={{ color: '#f59e0b', fontSize: '0.8rem' }}></i>{viewingFIR.location || 'N/A'}</p>
                </div>
                <div style={{ gridColumn: '1 / -1', background: '#f8fafc', borderRadius: '8px', padding: '10px 14px', borderLeft: '3px solid #10b981' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 500, color: '#334155', lineHeight: 1.5, fontSize: '0.84rem' }}>{viewingFIR.crime_description || viewingFIR.purpose || 'N/A'}</p>
                </div>
                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', margin: '2px 0' }}></div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Complainant Name</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-user-shield me-1" style={{ color: '#10b981', fontSize: '0.8rem' }}></i>{viewingFIR.complainant_name || viewingFIR.name || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-phone me-1" style={{ color: '#10b981', fontSize: '0.8rem' }}></i>{viewingFIR.complainant_phone || viewingFIR.number || 'N/A'}</p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-map-marker-alt me-1" style={{ color: '#3b82f6', fontSize: '0.8rem' }}></i>{viewingFIR.address || 'N/A'}</p>
                </div>
                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', margin: '2px 0' }}></div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Accused Name</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#ef4444' }}><i className="fas fa-user-secret me-1" style={{ fontSize: '0.8rem' }}></i>{viewingFIR.accused || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filed On</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="far fa-clock me-1" style={{ color: '#f59e0b', fontSize: '0.8rem' }}></i>{viewingFIR.created_at ? new Date(viewingFIR.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Station</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-building me-1" style={{ color: '#6366f1', fontSize: '0.8rem' }}></i>{viewingFIR.station_name || viewingFIR.station_id || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Relation</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}>{viewingFIR.relation || 'N/A'}</p>
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
      <ToastContainer position="top-right" autoClose={3000} />
      <Footer />
    </>
  );
};

export default UserFIRList;
