import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';
import { firsAPI, stationsAPI } from '../api/client';
import { CRIME_TYPES } from '../constants/crimeTypes';
import '../styles/dashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const [myFIRs, setMyFIRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingFIR, setViewingFIR] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFIRModal, setShowFIRModal] = useState(false);
  const [stations, setStations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [firError, setFirError] = useState('');
  const [firSuccess, setFirSuccess] = useState('');
  const [firForm, setFirForm] = useState({
    station_id: '',
    crime_type: '',
    accused: '',
    name: user?.username || '',
    age: '',
    number: '',
    address: '',
    relation: '',
    purpose: '',
    location: '',
    crime_description: '',
    crime_date: '',
    crime_time: ''
  });

  const handleViewFIR = (fir) => { setViewingFIR(fir); setShowViewModal(true); };

  // Fetch stations when modal opens
  const fetchStations = async () => {
    try {
      const response = await stationsAPI.getAll();
      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        setStations(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stations:', err);
    }
  };

  const handleOpenFIRModal = () => {
    fetchStations();
    setShowFIRModal(true);
    setFirError('');
    setFirSuccess('');
  };

  const handleCloseFIRModal = () => {
    setShowFIRModal(false);
    setFirForm({
      station_id: '',
      crime_type: '',
      accused: '',
      name: user?.username || '',
      age: '',
      number: '',
      address: '',
      relation: '',
      purpose: '',
      location: '',
      crime_description: '',
      crime_date: '',
      crime_time: ''
    });
    setFirError('');
    setFirSuccess('');
  };

  const handleFIRInputChange = (e) => {
    const { name, value } = e.target;
    setFirForm(prev => ({ ...prev, [name]: value }));
  };

  const validateFIRForm = () => {
    if (!firForm.station_id) {
      setFirError('Please select a police station');
      return false;
    }
    if (!firForm.crime_type) {
      setFirError('Please select a crime type');
      return false;
    }
    if (!firForm.accused.trim()) {
      setFirError('Please enter accused name/description');
      return false;
    }
    if (!firForm.name.trim()) {
      setFirError('Please enter your full name');
      return false;
    }
    if (!firForm.age || firForm.age < 1 || firForm.age > 120) {
      setFirError('Please enter valid age (1-120)');
      return false;
    }
    if (!firForm.number || !/^\d{10,15}$/.test(firForm.number)) {
      setFirError('Please enter valid phone number (10-15 digits)');
      return false;
    }
    if (!firForm.address.trim()) {
      setFirError('Please enter address');
      return false;
    }
    if (!firForm.relation.trim()) {
      setFirError('Please enter relation to accused');
      return false;
    }
    if (!firForm.purpose.trim()) {
      setFirError('Please enter purpose of FIR');
      return false;
    }
    if (!firForm.location.trim()) {
      setFirError('Please enter crime location');
      return false;
    }
    if (!firForm.crime_description.trim()) {
      setFirError('Please enter crime description');
      return false;
    }
    if (!firForm.crime_date) {
      setFirError('Please enter crime date');
      return false;
    }
    return true;
  };

  const handleFIRSubmit = async (e) => {
    e.preventDefault();
    setFirError('');
    setFirSuccess('');

    if (!validateFIRForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const firData = {
        user_id: user.id,
        station_id: firForm.station_id,
        crime_type: firForm.crime_type,
        accused: firForm.accused,
        name: firForm.name,
        age: parseInt(firForm.age),
        number: firForm.number,
        address: firForm.address,
        relation: firForm.relation,
        purpose: firForm.purpose,
        location: firForm.location,
        crime_description: firForm.crime_description,
        crime_date: firForm.crime_date,
        crime_time: firForm.crime_time,
        status: 'Sent'
      };

      const response = await firsAPI.create(firData);
      if (response.data.status === 'success') {
        setFirSuccess(`✓ FIR filed successfully! FIR ID: ${response.data.id}`);
        toast.success('FIR filed successfully!');
        setTimeout(async () => {
          handleCloseFIRModal();
          // Refresh FIRs list
          try {
            const firsRes = await firsAPI.getByUser(user.id);
            if (firsRes.data.status === 'success') {
              setMyFIRs(firsRes.data.data || []);
            }
          } catch (err) {
            console.error('Error refreshing FIRs:', err);
          }
        }, 1500);
      } else {
        setFirError(response.data.message || 'Failed to file FIR');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error filing FIR';
      setFirError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !user.id) { setError('User not found. Please log in again.'); setLoading(false); return; }
        const firsRes = await firsAPI.getByUser(user.id);
        if (firsRes.data.status === 'success') { setMyFIRs(firsRes.data.data || []); setError(null); }
        else { setError('Failed to load FIRs. Please try again later.'); }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load FIRs. Please try again later.');
      } finally { setLoading(false); }
    };
    if (user?.id) fetchData();
  }, [user?.id]);

  if (loading) return (
    <>
      <Sidebar />
      <div className="with-sidebar d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="page-loader"><div className="spinner"></div></div>
          <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>Loading dashboard...</p>
        </div>
      </div>
    </>
  );

  if (error) return (
    <>
      <Sidebar />
      <div className="with-sidebar">
        <div className="text-center py-5 text-danger">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/user/dashboard')}>Retry</button>
        </div>
      </div>
    </>
  );

  const sentFIRs = myFIRs.filter(f => f.status === 'Sent').length;
  const approvedFIRs = myFIRs.filter(f => f.status === 'Approved').length;
  const rejectedFIRs = myFIRs.filter(f => f.status === 'Rejected').length;

  const statCards = [
    { label: 'My FIRs',  value: myFIRs.length, color: '#0f172a', icon: 'fas fa-folder-open', bg: 'rgba(15,23,42,0.08)' },
    { label: 'Sent',     value: sentFIRs,       color: '#06b6d4', icon: 'fas fa-paper-plane', bg: 'rgba(6,182,212,0.10)' },
    { label: 'Approved', value: approvedFIRs,    color: '#10b981', icon: 'fas fa-check-circle', bg: 'rgba(16,185,129,0.10)' },
    { label: 'Rejected', value: rejectedFIRs,    color: '#ef4444', icon: 'fas fa-times-circle', bg: 'rgba(239,68,68,0.10)' },
  ];

  const statusColor = (s) => s === 'Approved' ? 'success' : s === 'Rejected' ? 'danger' : 'info';

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
        <div className="dashboard-container">

          {/* ── Header ── */}
          <div className="dash-header">
            <div>
              <h2><i className="fas fa-tachometer-alt me-2" style={{ color: '#10b981' }}></i>User Dashboard</h2>
              <p>Welcome back! Manage your FIRs and track their status.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', '@media (max-width: 768px)': { flexDirection: 'column' } }}>
              <Button size="sm" className="fw-bold" style={{ backgroundColor: '#10b981', borderColor: '#10b981', borderRadius: 8 }}
                onClick={handleOpenFIRModal}>
                <i className="fas fa-file-medical me-1"></i> File New FIR
              </Button>
            </div>
          </div>

          {/* ── Stat cards (4-col bento) ── */}
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

          {/* ── Recent FIRs table (full-width bento) ── */}
          <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', fontWeight: 700, fontSize: '0.8rem', borderBottom: '1.5px solid #e2e8f0', color: '#0f172a' }}>
              <i className="fas fa-list-alt me-2" style={{ color: '#10b981' }}></i>Recent FIRs
            </div>
            {myFIRs.length > 0 ? (
              <div className="dense-table-wrap" style={{ border: 'none', borderRadius: 0, boxShadow: 'none', maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }}>
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>FIR Number</th>
                      <th>Crime Type</th>
                      <th>Status</th>
                      <th>Filed On</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myFIRs.slice(0, 5).map((fir) => (
                      <tr key={fir.id}>
                        <td style={{ fontWeight: 600 }}>FIR-{String(fir.id).padStart(4, '0')}</td>
                        <td>{fir.crime_type}</td>
                        <td>
                          <span className={`badge bg-${statusColor(fir.status)}`} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                            {fir.status}
                          </span>
                        </td>
                        <td>{new Date(fir.created_at).toLocaleDateString()}</td>
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
            ) : (
              <div style={{ padding: '30px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                You haven't filed any FIRs yet.
              </div>
            )}
          </div>

          {/* FIR View Modal */}
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

          {/* ── File New FIR Modal ── */}
          <Modal show={showFIRModal} onHide={handleCloseFIRModal} centered size="lg" dialogClassName="fir-form-modal" backdrop="static">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '14px 20px', borderBottom: 'none' }}>
              <Modal.Title style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>
                <i className="fas fa-file-contract me-2"></i>File New FIR
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '24px', background: '#ffffff' }}>
              {firError && (
                <Alert variant="danger" onClose={() => setFirError('')} dismissible>
                  <i className="fas fa-exclamation-circle me-2"></i>{firError}
                </Alert>
              )}
              {firSuccess && (
                <Alert variant="success" onClose={() => setFirSuccess('')} dismissible>
                  <i className="fas fa-check-circle me-2"></i>{firSuccess}
                </Alert>
              )}

              <Form onSubmit={handleFIRSubmit}>
                {/* Row 1: Station and Crime Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <Form.Group>
                    <Form.Label className="fw-bold" style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: '8px' }}>
                      <i className="fas fa-building me-2" style={{ color: '#10b981' }}></i>Police Station *
                    </Form.Label>
                    <Form.Select
                      name="station_id"
                      value={firForm.station_id}
                      onChange={handleFIRInputChange}
                      required
                      style={{ borderRadius: '8px', fontSize: '0.9rem', borderColor: '#e2e8f0' }}
                    >
                      <option value="">-- Select Police Station --</option>
                      {stations.map(station => (
                        <option key={station.id} value={station.station_code || station.station_id || station.id}>
                          {station.station_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="fw-bold" style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: '8px' }}>
                      <i className="fas fa-exclamation-triangle me-2" style={{ color: '#ef4444' }}></i>Crime Type *
                    </Form.Label>
                    <Form.Select
                      name="crime_type"
                      value={firForm.crime_type}
                      onChange={handleFIRInputChange}
                      required
                      style={{ borderRadius: '8px', fontSize: '0.9rem', borderColor: '#e2e8f0' }}
                    >
                      <option value="">-- Select Crime Type --</option>
                      {CRIME_TYPES.map((crime) => (
                        <option key={crime.value} value={crime.value}>
                          {crime.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                {/* Crime Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <Form.Group>
                    <Form.Label className="fw-bold" style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: '8px' }}>
                      <i className="fas fa-map-marker-alt me-2" style={{ color: '#f59e0b' }}></i>Crime Location *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={firForm.location}
                      onChange={handleFIRInputChange}
                      placeholder="Enter crime location"
                      required
                      style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="fw-bold" style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: '8px' }}>
                      <i className="far fa-calendar me-2" style={{ color: '#3b82f6' }}></i>Crime Date *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="crime_date"
                      value={firForm.crime_date}
                      onChange={handleFIRInputChange}
                      required
                      style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                    />
                  </Form.Group>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <Form.Group>
                    <Form.Label className="fw-bold" style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: '8px' }}>
                      <i className="far fa-clock me-2" style={{ color: '#8b5cf6' }}></i>Crime Time
                    </Form.Label>
                    <Form.Control
                      type="time"
                      name="crime_time"
                      value={firForm.crime_time}
                      onChange={handleFIRInputChange}
                      style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                    />
                  </Form.Group>
                  <div></div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: '8px' }}>
                    <i className="fas fa-align-left me-2" style={{ color: '#10b981' }}></i>Crime Description *
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="crime_description"
                    value={firForm.crime_description}
                    onChange={handleFIRInputChange}
                    placeholder="Describe the crime in detail"
                    required
                    style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                  />
                </Form.Group>

                {/* Accused Information */}
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid #10b981', marginBottom: '16px' }}>
                  <h6 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0' }}>
                    <i className="fas fa-user-secret me-2"></i>Accused Information
                  </h6>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: '8px' }}>
                    Accused Name/Description *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="accused"
                    value={firForm.accused}
                    onChange={handleFIRInputChange}
                    placeholder="Enter name or description of accused"
                    required
                    style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                  />
                </Form.Group>

                {/* Row 2: Name and Age */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <Form.Group>
                    <Form.Label className="fw-bold" style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: '8px' }}>
                      Full Name *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={firForm.name}
                      onChange={handleFIRInputChange}
                      placeholder="Your full name"
                      required
                      style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="fw-bold" style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: '8px' }}>
                      Age *
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="age"
                      value={firForm.age}
                      onChange={handleFIRInputChange}
                      placeholder="18"
                      min="1"
                      max="120"
                      required
                      style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                    />
                  </Form.Group>
                </div>

                {/* Row 3: Phone and Address */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <Form.Group>
                    <Form.Label className="fw-bold" style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: '8px' }}>
                      <i className="fas fa-phone me-1" style={{ color: '#3b82f6' }}></i>Phone Number *
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="number"
                      value={firForm.number}
                      onChange={handleFIRInputChange}
                      placeholder="10-15 digits"
                      required
                      style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="fw-bold" style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: '8px' }}>
                      <i className="fas fa-map-pin me-1" style={{ color: '#f59e0b' }}></i>Address *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={firForm.address}
                      onChange={handleFIRInputChange}
                      placeholder="Your address"
                      required
                      style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                    />
                  </Form.Group>
                </div>

                {/* Row 4: Relation and Purpose */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <Form.Group>
                    <Form.Label className="fw-bold" style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: '8px' }}>
                      Relation to Accused *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="relation"
                      value={firForm.relation}
                      onChange={handleFIRInputChange}
                      placeholder="e.g., Friend, Neighbor, Stranger"
                      required
                      style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="fw-bold" style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: '8px' }}>
                      Purpose of FIR *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="purpose"
                      value={firForm.purpose}
                      onChange={handleFIRInputChange}
                      placeholder="e.g., Legal action, Investigation"
                      required
                      style={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                    />
                  </Form.Group>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '12px 20px', gap: '8px' }}>
              <Button variant="outline-secondary" size="sm" onClick={handleCloseFIRModal} disabled={submitting} style={{ borderRadius: '8px', fontWeight: 600 }}>
                <i className="fas fa-times me-1"></i>Cancel
              </Button>
              <Button variant="success" size="sm" onClick={handleFIRSubmit} disabled={submitting} style={{ borderRadius: '8px', fontWeight: 600, background: '#10b981', border: 'none' }}>
                {submitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Filing FIR...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane me-1"></i>File FIR
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Modal>

        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </>
  );
};

export default UserDashboard;