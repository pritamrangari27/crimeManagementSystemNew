import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { criminalsAPI } from '../api/client';

const CriminalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [criminal, setCriminal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCriminal();
  }, [id]);

  const fetchCriminal = async () => {
    try {
      const response = await criminalsAPI.get(id);
      if (response.data.status === 'success') {
        setCriminal(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching criminal:', error);
      alert('Error loading criminal details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  if (!criminal) return <div className="text-center py-5">Criminal record not found</div>;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Criminal Details</h2>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" onClick={() => navigate('/admin/criminals')} className="me-2">
            <i className="fas fa-arrow-left me-2"></i>Back
          </Button>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">{criminal.name || 'N/A'}</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Contact:</strong> {criminal.contact || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Gender:</strong> {criminal.gender || 'N/A'}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>City:</strong> {criminal.city || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>State:</strong> {criminal.state || 'N/A'}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Crime Type:</strong> {criminal.crime_type || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Crime Location:</strong> {criminal.crime_location || 'N/A'}</p>
                </Col>
              </Row>

              <p><strong>Address:</strong> {criminal.address || 'N/A'}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CriminalDetails;
