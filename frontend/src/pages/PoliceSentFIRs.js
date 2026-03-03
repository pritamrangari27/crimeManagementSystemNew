import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Card, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { firsAPI } from '../api/client';
import '../styles/forms.css';

const PoliceSentFIRs = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const stationId = user?.station_id;
  const role = localStorage.getItem('userRole');
  
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        let response;
        if (stationId) {
          response = await firsAPI.getByStation(stationId);
        } else {
          response = await firsAPI.getAll();
        }
        const data = response.data;
        
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
      <Sidebar />
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
            <i className="fas fa-list me-2"></i> New FIRs - Sent ({firs.length})
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
                <p className="mt-3 text-muted">No new FIRs at this moment</p>
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
      </Container>
    </div>
  );
};

export default PoliceSentFIRs;
