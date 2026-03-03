import React, { useEffect, useState } from 'react';
import { Container, Button, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { firsAPI } from '../api/client';
import '../styles/dashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const [myFIRs, setMyFIRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingFIR, setViewingFIR] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const handleViewFIR = (fir) => { setViewingFIR(fir); setShowViewModal(true); };

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
      <div className="with-sidebar">
        <div className="text-center py-5">Loading dashboard...</div>
      </div>
      <Footer />
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
      <Footer />
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
        <Container fluid className="dashboard-container">

          {/* ── Header ── */}
          <div className="dash-header">
            <div>
              <h2><i className="fas fa-tachometer-alt me-2" style={{ color: '#10b981' }}></i>User Dashboard</h2>
              <p>Welcome back! Manage your FIRs and track their status.</p>
            </div>
            <Button size="sm" className="fw-bold" style={{ backgroundColor: '#10b981', borderColor: '#10b981', borderRadius: 8 }}
              onClick={() => navigate('/fir/form')}>
              <i className="fas fa-file-medical me-1"></i> File New FIR
            </Button>
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
          <div className="bento-card stagger-enter" style={{ padding: 0, overflow: 'hidden' }}>
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
          <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="md" dialogClassName="fir-view-modal">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '12px 18px', borderBottom: 'none' }}>
              <Modal.Title style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>
                <i className="fas fa-file-invoice me-2" style={{ color: '#10b981' }}></i>
                FIR Details
                {viewingFIR && (
                  <Badge bg={statusColor(viewingFIR.status)} className="ms-2"
                    style={{ fontSize: '0.7rem', padding: '4px 8px', verticalAlign: 'middle' }}>
                    {viewingFIR.status}
                  </Badge>
                )}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '16px 20px', background: '#ffffff' }}>
              {viewingFIR && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>FIR Number</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}>FIR-{String(viewingFIR.id).padStart(4, '0')}</p>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crime Type</span>
                    <p style={{ margin: '2px 0 0' }}><span className="badge bg-danger" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>{viewingFIR.crime_type}</span></p>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crime Date</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="far fa-calendar me-1" style={{ color: '#3b82f6', fontSize: '0.8rem' }}></i>{viewingFIR.crime_date || 'N/A'}</p>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crime Location</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-map-pin me-1" style={{ color: '#f59e0b', fontSize: '0.8rem' }}></i>{viewingFIR.crime_location || 'N/A'}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1', background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', borderLeft: '3px solid #10b981' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 500, color: '#334155', lineHeight: 1.4, fontSize: '0.84rem' }}>{viewingFIR.description || 'N/A'}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', margin: '2px 0' }}></div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Victim Name</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-user-shield me-1" style={{ color: '#10b981', fontSize: '0.8rem' }}></i>{viewingFIR.victim_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Accused Name</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 700, color: '#ef4444' }}><i className="fas fa-user-secret me-1" style={{ fontSize: '0.8rem' }}></i>{viewingFIR.accused_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filed On</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="far fa-clock me-1" style={{ color: '#f59e0b', fontSize: '0.8rem' }}></i>{viewingFIR.created_at ? new Date(viewingFIR.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Station</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-building me-1" style={{ color: '#6366f1', fontSize: '0.8rem' }}></i>{viewingFIR.station_id || 'N/A'}</p>
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

export default UserDashboard;