import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
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
    file: null
  });

  // Verify user is User role
  useEffect(() => {
    if (role !== 'User') {
      navigate('/login');
      return;
    }
  }, [role, navigate]);

  // Fetch stations and crime types
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/stations/all');
        const data = await response.json();
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

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF, JPG, PNG, and GIF files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        file: file
      }));
      setError('');
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
      let filename = null;

      // Upload file only if provided
      if (formData.file) {
        const fileFormData = new FormData();
        fileFormData.append('file', formData.file);

        const fileResponse = await fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          body: fileFormData
        });

        const fileData = await fileResponse.json();
        if (fileData.status !== 'success') {
          throw new Error('File upload failed');
        }
        filename = fileData.filename || fileData.data.path;
      }

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
        file: filename,
        status: 'Sent'
      };

      const response = await fetch('http://localhost:3000/api/firs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(firData)
      });

      const data = await response.json();
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
          file: null
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
    <div className="d-flex">
      <Sidebar userRole={role} />
      <Container fluid className="main-content py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="fw-bold">
                  <i className="fas fa-file-contract me-2"></i> File New FIR
                </h2>
                <p className="text-muted">Submit a First Information Report about a crime</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left me-2"></i>Back
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-primary text-white fw-bold">
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

                  {/* Crime Type */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      <i className="fas fa-exclamation-circle me-2"></i> Crime Type *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="crime_type"
                      placeholder="e.g., Theft, Assault, Burglary"
                      value={formData.crime_type}
                      onChange={handleChange}
                      required
                    />
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

                  {/* Purpose */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      Purpose of FIR *
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="purpose"
                      placeholder="Describe why you are filing this FIR"
                      value={formData.purpose}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  {/* File Upload */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      <i className="fas fa-file-upload me-2"></i> Upload Evidence File
                    </Form.Label>
                    <Form.Control
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.gif"
                    />
                    <Form.Text className="text-muted">
                      Allowed: PDF, JPG, PNG, GIF (Max 5MB)
                    </Form.Text>
                  </Form.Group>

                  {/* Buttons */}
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={submitting || loading}
                      size="lg"
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
                          file: null
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

          <Col lg={4}>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserFIRForm;
