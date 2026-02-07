import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Card, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/forms.css';

const PoliceSentFIRs = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const stationId = user?.station_id;
  const role = localStorage.getItem('userRole');
  
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFIR, setSelectedFIR] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actioning, setActioning] = useState(false);
  const [action, setAction] = useState(''); // 'approve' or 'reject'

  // Verify user is Police role
  useEffect(() => {
    if (role !== 'Police') {
      navigate('/login');
      return;
    }
  }, [role, navigate]);

  // Fetch FIRs for the station
  useEffect(() => {
    const fetchFIRs = async () => {
      try {
        setLoading(true);
        setError('');
        const endpoint = stationId 
          ? `http://localhost:3000/api/firs/station/${stationId}`
          : `http://localhost:3000/api/firs`;
        
        const response = await fetch(endpoint);
        const data = await response.json();
        
        if (data.status === 'success' && Array.isArray(data.data)) {
          // Filter for only "Sent" status
          const sentFirs = data.data.filter(f => f.status === 'Sent');
          setFirs(sentFirs);
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

    if (stationId) {
      fetchFIRs();
    }
  }, [stationId]);

  // Open modal for action
  const openActionModal = (fir, actionType) => {
    setSelectedFIR(fir);
    setAction(actionType);
    setShowModal(true);
  };

  // Handle action (approve/reject)
  const handleAction = async () => {
    if (!selectedFIR) return;

    setActioning(true);
    try {
      const status = action === 'approve' ? 'Approved' : 'Rejected';
      const response = await fetch(`http://localhost:3000/api/firs/${selectedFIR.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (data.status === 'success') {
        // Remove from list
        setFirs(firs.filter(f => f.id !== selectedFIR.id));
        setShowModal(false);
        setSelectedFIR(null);
        alert(`FIR ${status.toLowerCase()} successfully!`);
      } else {
        alert('Failed to process FIR');
      }
    } catch (err) {
      alert('Error processing FIR');
    } finally {
      setActioning(false);
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

  if (role !== 'Police') {
    return null;
  }

  return (
    <div className="d-flex">
      <Sidebar userRole={role} />
      <Container fluid className="main-content py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold">
              <i className="fas fa-inbox me-2"></i> New FIRs (Sent)
            </h2>
            <p className="text-muted">Review and process FIRs sent to your station</p>
          </Col>
          <Col className="text-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(-1)}
              className="fw-bold"
            >
              <i className="fas fa-arrow-left me-2"></i> Back
            </Button>
          </Col>
        </Row>

        {/* FIR Table */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-primary text-white fw-bold">
            <i className="fas fa-list me-2"></i> Pending FIRs ({firs.length})
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3 text-muted">Loading FIRs...</p>
              </div>
            ) : error ? (
              <Alert variant="danger" className="m-3">
                {error}
              </Alert>
            ) : firs.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-check-circle text-success" style={{ fontSize: '48px' }}></i>
                <p className="mt-3 text-muted">No pending FIRs at this moment</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="fw-bold">FIR ID</th>
                      <th className="fw-bold">Crime Type</th>
                      <th className="fw-bold">Accused</th>
                      <th className="fw-bold">Complainant</th>
                      <th className="fw-bold">Filed Date</th>
                      <th className="fw-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {firs.map(fir => (
                      <tr key={fir.id} className="align-middle">
                        <td className="fw-bold text-primary">
                          FIR-{String(fir.id).padStart(4, '0')}
                        </td>
                        <td>
                          <span className="badge bg-info">{fir.crime_type}</span>
                        </td>
                        <td className="fw-bold">{fir.accused}</td>
                        <td>{fir.name}</td>
                        <td className="small text-muted">
                          {formatDate(fir.created_at || fir.date)}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => navigate(`/fir/${fir.id}`)}
                              className="fw-bold"
                            >
                              <i className="fas fa-eye me-1"></i> View
                            </Button>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => openActionModal(fir, 'approve')}
                              className="fw-bold"
                            >
                              <i className="fas fa-check me-1"></i> Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => openActionModal(fir, 'reject')}
                              className="fw-bold"
                            >
                              <i className="fas fa-times me-1"></i> Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Confirmation Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className={`fas fa-${action === 'approve' ? 'check-circle text-success' : 'times-circle text-danger'} me-2`}></i>
              {action === 'approve' ? 'Approve' : 'Reject'} FIR
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedFIR && (
              <div>
                <p className="mb-3">
                  Are you sure you want to <strong>{action}</strong> this FIR?
                </p>
                <div className="bg-light p-3 rounded">
                  <p className="mb-2">
                    <strong>FIR ID:</strong> FIR-{String(selectedFIR.id).padStart(4, '0')}
                  </p>
                  <p className="mb-2">
                    <strong>Crime:</strong> {selectedFIR.crime_type}
                  </p>
                  <p className="mb-2">
                    <strong>Accused:</strong> {selectedFIR.accused}
                  </p>
                  <p className="mb-0">
                    <strong>Complainant:</strong> {selectedFIR.name}
                  </p>
                </div>
                <Alert variant={action === 'approve' ? 'success' : 'warning'} className="mt-3 mb-0">
                  {action === 'approve'
                    ? 'The complainant will be notified of the approval.'
                    : 'The complainant will be notified of the rejection.'}
                </Alert>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant={action === 'approve' ? 'success' : 'danger'}
              onClick={handleAction}
              disabled={actioning}
            >
              {actioning ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                <>
                  <i className={`fas fa-${action === 'approve' ? 'check' : 'times'} me-2`}></i>
                  {action === 'approve' ? 'Approve' : 'Reject'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default PoliceSentFIRs;
