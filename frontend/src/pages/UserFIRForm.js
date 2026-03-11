import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Row, Col, Container, Spinner, Card, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { firsAPI, stationsAPI, advancedAPI } from '../api/client';
import { CRIME_TYPES } from '../constants/crimeTypes';
import '../styles/forms.css';

const UserFIRForm = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const role = localStorage.getItem('userRole');
  const [stations, setStations] = useState([]);
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [classifying, setClassifying] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [similarFIRs, setSimilarFIRs] = useState([]);
  const [checkingSimilarity, setCheckingSimilarity] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    station_id: '',
    crime_type: '',
    accused: '',
    name: user?.username || '',
    age: '',
    number: '',
    address: '',
    relation: '',
    purpose: '',
    latitude: '',
    longitude: ''
  });

  // Fetch stations and crime types
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const response = await stationsAPI.getAll();
        const data = response.data;
        if (data.status === 'success' && Array.isArray(data.data)) {
          setStations(data.data);
        }
      } catch (err) {
        console.error('Error fetching stations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // AI Crime Type Detection
  const handleClassify = async () => {
    if (!formData.purpose || formData.purpose.trim().length < 5) {
      setError('Please describe the incident (minimum 5 characters) before using AI detection');
      return;
    }
    setClassifying(true);
    setAiResult(null);
    setError('');
    try {
      const res = await firsAPI.classify(formData.purpose);
      if (res.data.status === 'success') {
        const { crime_type, confidence, all_scores } = res.data.data;
        setAiResult({ crime_type, confidence, all_scores });
        setFormData(prev => ({ ...prev, crime_type }));
      } else {
        setError(res.data.message || 'AI classification failed');
      }
    } catch (err) {
      setError('AI service unavailable. Please select crime type manually.');
    } finally {
      setClassifying(false);
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.station_id) {
      setError('Please select a police station');
      return false;
    }
    if (!formData.crime_type) {
      setError('Please enter crime type');
      return false;
    }
    if (!formData.accused) {
      setError('Please enter accused name/description');
      return false;
    }
    if (!formData.name) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.age || formData.age < 1 || formData.age > 120) {
      setError('Please enter valid age (1-120)');
      return false;
    }
    if (!formData.number || !/^\d{10,15}$/.test(formData.number)) {
      setError('Please enter valid phone number (10-15 digits)');
      return false;
    }
    if (!formData.address) {
      setError('Please enter address');
      return false;
    }
    if (!formData.relation) {
      setError('Please enter relation to accused');
      return false;
    }
    if (!formData.purpose) {
      setError('Please enter purpose of FIR');
      return false;
    }
    if (formData.latitude && (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90)) {
      setError('Please enter a valid latitude (-90 to 90)');
      return false;
    }
    if (formData.longitude && (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180)) {
      setError('Please enter a valid longitude (-180 to 180)');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Submit FIR
      const firData = {
        user_id: user.id,
        station_id: formData.station_id,
        crime_type: formData.crime_type,
        accused: formData.accused,
        name: formData.name,
        age: parseInt(formData.age),
        number: formData.number,
        address: formData.address,
        relation: formData.relation,
        purpose: formData.purpose,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        status: 'Sent'
      };

      const response = await firsAPI.create(firData);
      const data = response.data;
      if (data.status === 'success') {
        setSuccess(`FIR filed successfully! FIR ID: ${data.id}`);
        // Reset form
        setFormData({
          station_id: '',
          crime_type: '',
          accused: '',
          name: user?.username || '',
          age: '',
          number: '',
          address: '',
          relation: '',
          purpose: '',
          latitude: '',
          longitude: ''
        });
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/fir/list');
        }, 2000);
      } else {
        setError(data.message || 'Failed to file FIR');
      }
    } catch (err) {
      setError(err.message || 'Error filing FIR');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
      <Container fluid className="mgmt-container">
        <Row className="mb-2">
          <Col>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="fw-bold" style={{ fontSize: '1.4rem' }}>
                  <i className="fas fa-file-contract me-2"></i> File New FIR
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Submit a First Information Report about a crime</p>
              </div>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="fw-bold"
                style={{ marginTop: '2px' }}
              >
                <i className="fas fa-arrow-left me-2"></i>Back
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={8} md={10} xs={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header style={{ backgroundColor: '#10b981', color: 'white' }} className="fw-bold">
                FIR Details
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                  {/* Station Selection */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      <i className="fas fa-building me-2"></i> Select Police Station *
                    </Form.Label>
                    <Form.Select
                      name="station_id"
                      value={formData.station_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Police Station --</option>
                      {stations.map(station => (
                        <option key={station.id} value={station.station_code || station.station_id || station.id}>
                          {station.station_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* AI Crime Detection Section */}
                  <Card className="mb-4 border" style={{ borderColor: '#667eea', borderRadius: '10px', background: 'linear-gradient(135deg, #f5f7ff 0%, #f0f4ff 100%)' }}>
                    <Card.Body className="py-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-robot me-2" style={{ color: '#667eea', fontSize: '1.1rem' }}></i>
                        <span className="fw-bold" style={{ fontSize: '0.95rem', color: '#1a202c' }}>AI Crime Type Detection</span>
                        <Badge bg="info" className="ms-2" style={{ fontSize: '0.65rem' }}>Beta</Badge>
                      </div>
                      <p className="text-muted mb-2" style={{ fontSize: '0.78rem' }}>
                        Describe what happened and our AI will automatically detect the crime type.
                      </p>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="purpose"
                        placeholder="e.g. Someone stole my bike near the railway station..."
                        value={formData.purpose}
                        onChange={handleChange}
                        style={{ borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '0.9rem' }}
                      />
                      <div className="d-flex align-items-center mt-2 gap-2 flex-wrap">
                        <Button
                          size="sm"
                          onClick={handleClassify}
                          disabled={classifying || !formData.purpose || formData.purpose.trim().length < 5}
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem',
                            padding: '0.4rem 1rem',
                          }}
                        >
                          {classifying ? (
                            <><Spinner animation="border" size="sm" className="me-1" /> Analyzing...</>
                          ) : (
                            <><i className="fas fa-magic me-1"></i> Detect Crime Type</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-warning"
                          onClick={async () => {
                            if (!formData.purpose || formData.purpose.trim().length < 10) return;
                            setCheckingSimilarity(true);
                            try {
                              const res = await advancedAPI.checkSimilarity(formData.purpose, formData.crime_type);
                              setSimilarFIRs(res.data?.data?.similar_firs || []);
                            } catch { setSimilarFIRs([]); }
                            finally { setCheckingSimilarity(false); }
                          }}
                          disabled={checkingSimilarity || !formData.purpose || formData.purpose.trim().length < 10}
                          style={{ borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                        >
                          {checkingSimilarity ? <Spinner size="sm" /> : <><i className="fas fa-search me-1"></i> Check Similar FIRs</>}
                        </Button>
                        {aiResult && (
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <Badge bg="success" style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}>
                              <i className="fas fa-check-circle me-1"></i>{aiResult.crime_type}
                            </Badge>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip>
                                  {Object.entries(aiResult.all_scores || {}).map(([k, v]) => (
                                    <div key={k} style={{ fontSize: '0.72rem' }}>{k}: {(v * 100).toFixed(1)}%</div>
                                  ))}
                                </Tooltip>
                              }
                            >
                              <Badge bg="secondary" style={{ fontSize: '0.72rem', cursor: 'pointer' }}>
                                {(aiResult.confidence * 100).toFixed(1)}% confidence
                              </Badge>
                            </OverlayTrigger>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Similar FIRs Warning */}
                  {similarFIRs.length > 0 && (
                    <Alert variant="warning" className="mt-2" dismissible onClose={() => setSimilarFIRs([])}>
                      <Alert.Heading style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {similarFIRs.length} Similar FIR(s) Found
                      </Alert.Heading>
                      <p style={{ fontSize: '0.8rem', marginBottom: '8px' }}>
                        These existing FIRs have similar descriptions. Please check if yours is a duplicate:
                      </p>
                      {similarFIRs.slice(0, 3).map((f, i) => (
                        <div key={i} style={{ padding: '6px 0', borderTop: i > 0 ? '1px solid #ffeeba' : 'none', fontSize: '0.78rem' }}>
                          <strong>{f.fir_number || `FIR #${f.id}`}</strong> — {f.crime_type} ({f.similarity}% match)
                          <br /><span className="text-muted">{f.location}</span>
                        </div>
                      ))}
                    </Alert>
                  )}

                  {/* Crime Type */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      <i className="fas fa-exclamation-circle me-2"></i> Crime Type *
                      {aiResult && <span className="text-success ms-2" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>(AI auto-filled)</span>}
                    </Form.Label>
                    <Form.Select
                      name="crime_type"
                      value={formData.crime_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Crime Type --</option>
                      {CRIME_TYPES.map((crime) => (
                        <option key={crime.value} value={crime.value}>
                          {crime.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* Accused Heading */}
                  <h5 className="mt-4 mb-3 fw-bold">
                    <i className="fas fa-user-secret me-2"></i> Accused Information
                  </h5>

                  {/* Accused Name/Description */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      Accused Name/Description *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="accused"
                      placeholder="Name or description of accused person"
                      value={formData.accused}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  {/* Complainant Heading */}
                  <h5 className="mt-4 mb-3 fw-bold">
                    <i className="fas fa-user me-2"></i> Your Information
                  </h5>

                  {/* Your Name */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      Your Full Name *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Row>
                    {/* Age */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Age *</Form.Label>
                        <Form.Control
                          type="number"
                          name="age"
                          placeholder="Age"
                          value={formData.age}
                          onChange={handleChange}
                          min="1"
                          max="120"
                          required
                        />
                      </Form.Group>
                    </Col>

                    {/* Phone */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                          Phone Number *
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="number"
                          placeholder="10-15 digit phone number"
                          value={formData.number}
                          onChange={handleChange}
                          pattern="\d{10,15}"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Address */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Address *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="address"
                      placeholder="Your address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  {/* Relation */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      Relation to Accused *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="relation"
                      placeholder="e.g., Victim, Witness, Family Member"
                      value={formData.relation}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  {/* Crime Location Coordinates */}
                  <h5 className="mt-4 mb-3 fw-bold">
                    <i className="fas fa-map-marker-alt me-2"></i> Crime Location (Optional)
                  </h5>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Latitude</Form.Label>
                        <Form.Control
                          type="number"
                          step="any"
                          name="latitude"
                          placeholder="e.g. 28.6139"
                          value={formData.latitude}
                          onChange={handleChange}
                          min="-90"
                          max="90"
                        />
                        <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Range: -90 to 90
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Longitude</Form.Label>
                        <Form.Control
                          type="number"
                          step="any"
                          name="longitude"
                          placeholder="e.g. 77.2090"
                          value={formData.longitude}
                          onChange={handleChange}
                          min="-180"
                          max="180"
                        />
                        <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Range: -180 to 180
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Buttons */}
                  <div className="d-flex gap-2">
                    <Button
                      style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: '600' }}
                      type="submit"
                      disabled={submitting || loading}
                      size="sm"
                      className="fw-bold"
                    >
                      {submitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i> Submit FIR
                        </>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      type="reset"
                      size="lg"
                      className="fw-bold"
                      onClick={() => {
                        setFormData({
                          station_id: '',
                          crime_type: '',
                          accused: '',
                          name: user?.username || '',
                          age: '',
                          number: '',
                          address: '',
                          relation: '',
                          purpose: '',
                          latitude: '',
                          longitude: ''
                        });
                        setError('');
                      }}
                    >
                      <i className="fas fa-redo me-2"></i> Clear
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => navigate('/user/dashboard')}
                      size="lg"
                      className="fw-bold"
                    >
                      <i className="fas fa-times me-2"></i> Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      </div>

    </>
  );
};

export default UserFIRForm;
