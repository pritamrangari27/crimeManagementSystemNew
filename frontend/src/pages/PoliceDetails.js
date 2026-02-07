import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { policeAPI } from '../api/client';

const PoliceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficer();
  }, [id]);

  const fetchOfficer = async () => {
    try {
      const response = await policeAPI.get(id);
      if (response.data.status === 'success') {
        setOfficer(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching police officer:', error);
      alert('Error loading police officer details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  if (!officer) return <div className="text-center py-5">Police officer not found</div>;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Police Officer Details</h2>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" onClick={() => navigate('/admin/police')} className="me-2">
            <i className="fas fa-arrow-left me-2"></i>Back
          </Button>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">{officer.name || 'N/A'}</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Badge Number:</strong> {officer.badge_number || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Rank:</strong> {officer.rank || 'N/A'}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Contact:</strong> {officer.contact || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Station Name:</strong> {officer.station_name || 'N/A'}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Email:</strong> {officer.email || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Department:</strong> {officer.department || 'N/A'}</p>
                </Col>
              </Row>

              <p><strong>Address:</strong> {officer.address || 'N/A'}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PoliceDetails;
