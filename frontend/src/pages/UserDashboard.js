import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { firsAPI } from '../api/client';
import '../styles/dashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const role = localStorage.getItem('userRole');
  const [myFIRs, setMyFIRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingFIR, setViewingFIR] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const handleViewFIR = (fir) => {
    setViewingFIR(fir);
    setShowViewModal(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !user.id) {
          setError('User not found. Please log in again.');
          setLoading(false);
          return;
        }

        const firsRes = await firsAPI.getByUser(user.id);

        if (firsRes.data.status === 'success') {
          setMyFIRs(firsRes.data.data || []);
          setError(null);
        } else {
          setError('Failed to load FIRs. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load FIRs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  if (loading) return (
    <div className="d-flex">
      <Sidebar />
      <div className="with-sidebar w-100">
        <div className="text-center py-5">Loading dashboard...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="d-flex">
      <Sidebar />
      <div className="with-sidebar w-100">
        <div className="text-center py-5 text-danger">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/user/dashboard')}>Retry</button>
        </div>
      </div>
    </div>
  );

  const sentFIRs = myFIRs.filter(f => f.status === 'Sent').length;
  const approvedFIRs = myFIRs.filter(f => f.status === 'Approved').length;
  const rejectedFIRs = myFIRs.filter(f => f.status === 'Rejected').length;

  return (
    <>
      <Sidebar />
      
      <div className="with-sidebar">
        <Container fluid className="dashboard-container py-3 px-3">
      <Row className="mb-2">
        <Col>
          <h2 className="fw-bold" style={{ fontSize: '1.4rem' }}>User Dashboard</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Welcome back! Manage your FIRs and track their status.</p>
        </Col>
        <Col md={3} className="text-end">
          <Button 
            style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: '600' }}
            size="sm"
            onClick={() => navigate('/fir/form')}
            className="fw-bold"
          >
            <i className="fas fa-file-medical me-2"></i>File New FIR
          </Button>
        </Col>
      </Row>

      <Row>
        <Col md={3} className="mb-2">
          <Card className="shadow-sm border-0">
            <Card.Body className="py-2 px-3">
              <h6 className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>My FIRs</h6>
              <h3 className="fw-bold mb-0" style={{ fontSize: '1.3rem' }}>{myFIRs.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-2">
          <Card className="shadow-sm border-0">
            <Card.Body className="py-2 px-3">
              <h6 className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Sent</h6>
              <h3 className="fw-bold text-info mb-0" style={{ fontSize: '1.3rem' }}>{sentFIRs}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-2">
          <Card className="shadow-sm border-0">
            <Card.Body className="py-2 px-3">
              <h6 className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Approved</h6>
              <h3 className="fw-bold text-success mb-0" style={{ fontSize: '1.3rem' }}>{approvedFIRs}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-2">
          <Card className="shadow-sm border-0">
            <Card.Body className="py-2 px-3">
              <h6 className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Rejected</h6>
              <h3 className="fw-bold text-danger mb-0" style={{ fontSize: '1.3rem' }}>{rejectedFIRs}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white fw-bold py-2" style={{ fontSize: '0.85rem' }}>
          Recent FIRs
        </Card.Header>
        <Card.Body className="p-0">
          {myFIRs.length > 0 ? (
            <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 380px)', overflowY: 'auto' }}>
              <table className="table table-sm mb-0" style={{ fontSize: '0.82rem' }}>
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
                      <td>FIR-{String(fir.id).padStart(4, '0')}</td>
                      <td>{fir.crime_type}</td>
                      <td>
                        <span
                          className={`badge bg-${
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
                      <td>{new Date(fir.created_at).toLocaleDateString()}</td>
                      <td>
                        <Button onClick={() => handleViewFIR(fir)} variant="info" size="sm">
                          <i className="fas fa-eye me-1"></i>View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted">You haven't filed any FIRs yet.</p>
          )}
        </Card.Body>
      </Card>

      {/* FIR View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="md" dialogClassName="fir-view-modal">
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '12px 18px', borderBottom: 'none' }}>
          <Modal.Title style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>
            <i className="fas fa-file-invoice me-2" style={{ color: '#10b981' }}></i>
            FIR Details
            {viewingFIR && (
              <Badge
                bg={viewingFIR.status === 'Approved' ? 'success' : viewingFIR.status === 'Rejected' ? 'danger' : 'info'}
                className="ms-2"
                style={{ fontSize: '0.7rem', padding: '4px 8px', verticalAlign: 'middle' }}
              >
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