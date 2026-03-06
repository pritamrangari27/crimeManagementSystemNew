import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Card, Badge, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { firsAPI } from '../api/client';
import '../styles/forms.css';
import '../styles/dashboard.css';

const PoliceSentFIRs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const stationId = user?.station_id;
  const role = localStorage.getItem('userRole');

  // Derive initial filter from URL path
  const getInitialFilter = () => {
    if (location.pathname.includes('/approved')) return 'Approved';
    if (location.pathname.includes('/rejected')) return 'Rejected';
    if (location.pathname.includes('/sent')) return 'Sent';
    return '';
  };

  const [firs, setFirs] = useState([]);
  const [allFirs, setAllFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState(getInitialFilter());
  const [actionLoading, setActionLoading] = useState(null);

  // Sync filter when URL changes (sidebar click)
  useEffect(() => {
    setFilterStatus(getInitialFilter());
  }, [location.pathname]);

  const fetchFIRs = async () => {
    try {
      setLoading(true);
      setError('');
      let response;
      if (stationId) {
        response = await firsAPI.getByStation(stationId);
      } else {
        response = await firsAPI.getAll();
      }
      const data = response.data;
      
      if (data.status === 'success' && Array.isArray(data.data)) {
        setAllFirs(data.data);
        if (filterStatus) {
          setFirs(data.data.filter(f => f.status === filterStatus));
        } else {
          setFirs(data.data);
        }
      } else {
        setAllFirs([]);
        setFirs([]);
      }
    } catch (err) {
      setError('Failed to load FIRs. Please try again later.');
      console.error('Error fetching FIRs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch FIRs for the station
  useEffect(() => {
    if (stationId) {
      fetchFIRs();
    }
  }, [stationId]);

  // Filter FIRs when filter changes
  useEffect(() => {
    if (filterStatus) {
      setFirs(allFirs.filter(f => f.status === filterStatus));
    } else {
      setFirs(allFirs);
    }
  }, [filterStatus, allFirs]);

  // Handle status change via dropdown
  const handleStatusChange = async (firId, newStatus) => {
    if (!newStatus) return;
    const action = newStatus === 'Approved' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${action} this FIR?`)) return;

    setActionLoading(firId);
    try {
      if (newStatus === 'Approved') {
        await firsAPI.approve(firId, user?.id || null);
      } else {
        await firsAPI.reject(firId, `Rejected by officer ${user?.username || ''}`);
      }
      alert(`FIR ${newStatus.toLowerCase()} successfully!`);
      fetchFIRs();
    } catch (err) {
      alert(`Error: Could not ${action} FIR`);
      console.error(err);
    } finally {
      setActionLoading(null);
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

  // Status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Sent': return 'info';
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      default: return 'secondary';
    }
  };

  if (role !== 'Police') {
    return null;
  }

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
      <Container fluid className="mgmt-container page-stagger">
        {/* Header */}
        <div className="mgmt-header">
          <div>
            <h2><i className="fas fa-file-alt me-2"></i> FIR Management</h2>
            <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Review and manage FIRs sent to your station</p>
          </div>
          <div className="mgmt-header-actions">
            <button className="mgmt-btn-back" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left me-2"></i> Back
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="mgmt-controls">
          <select
            className="mgmt-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All FIRs ({allFirs.length})</option>
            <option value="Sent">Sent ({allFirs.filter(f => f.status === 'Sent').length})</option>
            <option value="Approved">Approved ({allFirs.filter(f => f.status === 'Approved').length})</option>
            <option value="Rejected">Rejected ({allFirs.filter(f => f.status === 'Rejected').length})</option>
          </select>
        </div>

        {/* FIR Table */}
        {loading ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2 text-muted small">Loading FIRs...</p>
              </div>
            ) : error ? (
              <Alert variant="danger" className="m-2">
                {error}
              </Alert>
            ) : firs.length === 0 ? (
              <div className="text-center py-3">
                <i className={`fas ${filterStatus === 'Approved' ? 'fa-check-circle text-success' : filterStatus === 'Rejected' ? 'fa-times-circle text-danger' : 'fa-folder-open text-muted'}`} style={{ fontSize: '36px' }}></i>
                <h6 className="mt-2 fw-bold" style={{ color: '#334155' }}>
                  {filterStatus === 'Approved' ? 'No Approved FIRs Yet' : filterStatus === 'Rejected' ? 'No Rejected FIRs Yet' : filterStatus === 'Sent' ? 'No New FIRs' : 'No FIRs Found'}
                </h6>
                <p className="text-muted small">
                  {filterStatus === 'Approved' ? 'FIRs you approve will appear here.' : filterStatus === 'Rejected' ? 'FIRs you reject will appear here.' : filterStatus === 'Sent' ? 'No new FIRs have been sent to your station yet.' : 'There are no FIRs in your station.'}
                </p>
              </div>
            ) : (
              <div className="mgmt-table-wrap">
                <div className="mgmt-table-scroll">
                <table className="mgmt-table">
                  <thead>
                    <tr>
                      <th>FIR ID</th>
                      <th>Crime Type</th>
                      <th>Location</th>
                      <th>Accused</th>
                      <th>Complainant</th>
                      <th>Address</th>
                      <th>Filed Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {firs.map(fir => (
                      <tr key={fir.id}>
                        <td className="fw-bold text-primary">
                          FIR-{String(fir.id).padStart(4, '0')}
                        </td>
                        <td>
                          <span className="mgmt-badge info">{fir.crime_type}</span>
                        </td>
                        <td>{fir.location || '-'}</td>
                        <td className="fw-bold">{fir.accused || '-'}</td>
                        <td>{fir.complainant_name || fir.name || '-'}</td>
                        <td>{fir.address || '-'}</td>
                        <td className="small text-muted">
                          {formatDate(fir.created_at || fir.date)}
                        </td>
                        <td>
                          <span className={`mgmt-badge ${getStatusVariant(fir.status)}`}>{fir.status}</span>
                        </td>
                        <td>
                          <div className="mgmt-actions">
                            {fir.status === 'Sent' ? (
                              <Form.Select
                                size="sm"
                                className="mgmt-filter"
                                style={{ width: '140px', padding: '0.3rem 0.5rem', fontSize: '0.73rem' }}
                                defaultValue=""
                                disabled={actionLoading === fir.id}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === 'view') {
                                    navigate(`/fir/${fir.id}`);
                                  } else if (val) {
                                    handleStatusChange(fir.id, val);
                                  }
                                  e.target.value = '';
                                }}
                              >
                                <option value="" disabled>Action...</option>
                                <option value="view">View Details</option>
                                <option value="Approved">Approve</option>
                                <option value="Rejected">Reject</option>
                              </Form.Select>
                            ) : (
                              <button
                                className="view"
                                onClick={() => navigate(`/fir/${fir.id}`)}
                              >
                                <i className="fas fa-eye me-1"></i> View
                              </button>
                            )}
                            {actionLoading === fir.id && (
                              <Spinner animation="border" size="sm" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
      </Container>
      </div>
      <Footer />
    </>
  );
};

export default PoliceSentFIRs;
