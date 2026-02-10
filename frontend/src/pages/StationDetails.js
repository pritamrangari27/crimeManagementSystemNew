import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { stationsAPI } from '../api/client';

const StationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStation();
  }, [id]);

  const fetchStation = async () => {
    try {
      const response = await stationsAPI.get(id);
      if (response.data.status === 'success') {
        setStation(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching station:', error);
      alert('Error loading station details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  if (!station) return <div className="text-center py-5">Station not found</div>;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Police Station Details</h2>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" onClick={() => navigate('/admin/stations')} className="me-2">
            <i className="fas fa-arrow-left me-2"></i>Back
          </Button>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">{station.station_name}</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Station Code:</strong> {station.station_code}</p>
                </Col>
                <Col md={6}>
                  <p><strong>In-Charge:</strong> {station.in_charge || 'N/A'}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>City:</strong> {station.city}</p>
                </Col>
                <Col md={6}>
                  <p><strong>State:</strong> {station.state}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Phone:</strong> {station.phone || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Email:</strong> {station.email || 'N/A'}</p>
                </Col>
              </Row>

              <p><strong>Address:</strong> {station.address}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StationDetails;
