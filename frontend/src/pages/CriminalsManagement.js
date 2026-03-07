import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { criminalsAPI } from '../api/client';
import { CRIME_TYPES } from '../constants/crimeTypes';
import ConfirmModal from '../components/ConfirmModal';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import '../styles/dashboard.css';

const CriminalsManagement = () => {
  const navigate = useNavigate();
  const [criminals, setCriminals] = useState([]);
  const [allCriminals, setAllCriminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCriminal, setSelectedCriminal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    Criminal_name: '',
    crime_type: '',
    crime_date: '',
    email: '',
    contact: '',
    DateOfBirth: '',
    gender: '',
    state: '',
    city: '',
    address: ''
  });

  useEffect(() => {
    fetchCriminals();
  }, []);

  const fetchCriminals = async () => {
    try {
      const response = await criminalsAPI.getAll();
      if (response.data.status === 'success') {
        setAllCriminals(response.data.data);
        setCriminals(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching criminals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      const q = query.toLowerCase();
      setCriminals(allCriminals.filter(criminal =>
        Object.values(criminal).some(v => String(v || '').toLowerCase().includes(q))
      ));
    } else {
      setCriminals(allCriminals);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddCriminal = async (e) => {
    e.preventDefault();
    try {
      await criminalsAPI.add(formData);
      toast.success('Criminal record added successfully!');
      setFormData({
        Criminal_name: '',
        crime_type: '',
        crime_date: '',
        email: '',
        contact: '',
        DateOfBirth: '',
        gender: '',
        state: '',
        city: '',
        address: ''
      });
      setShowForm(false);
      fetchCriminals();
    } catch (error) {
      toast.error('Error: ' + (error.response?.data?.message || 'Failed to add criminal'));
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await criminalsAPI.delete(deleteId);
      toast.success('Criminal record deleted successfully!');
      fetchCriminals();
    } catch (error) {
      toast.error('Error deleting criminal record');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const handleViewCriminal = (criminal) => {
    setSelectedCriminal(criminal);
    setShowViewModal(true);
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
        <Container fluid className="mgmt-container page-stagger">
      <div className="mgmt-header">
        <h2>Criminal Management</h2>
        <div className="mgmt-header-actions">
          <button className="mgmt-btn-back" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-2"></i>Back
          </button>
          <button className="mgmt-btn-primary" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus me-2"></i>Add Criminal
          </button>
        </div>
      </div>

      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Criminal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form onSubmit={handleAddCriminal}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Criminal Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="Criminal_name"
                      value={formData.Criminal_name}
                      onChange={handleFormChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Crime Type *</Form.Label>
                    <Form.Select
                      name="crime_type"
                      value={formData.crime_type}
                      onChange={handleFormChange}
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
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Contact</Form.Label>
                    <Form.Control
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Crime Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="crime_date"
                      value={formData.crime_date}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      name="DateOfBirth"
                      value={formData.DateOfBirth}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleFormChange}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleFormChange}
                />
              </Form.Group>

            </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowForm(false)}>
            Close
          </Button>
          <Button style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: '600' }} onClick={(e) => handleAddCriminal(e)}>
            Add Criminal
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Criminal Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="md" centered dialogClassName="fir-view-modal">
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '12px 18px', borderBottom: 'none' }}>
          <Modal.Title style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>
            <i className="fas fa-user-secret me-2" style={{ color: '#10b981' }}></i>
            Criminal Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '16px 20px', background: '#ffffff' }}>
          {selectedCriminal && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-id-card me-1" style={{ color: '#10b981', fontSize: '0.8rem' }}></i>{selectedCriminal.Criminal_name || selectedCriminal.criminal_name || 'N/A'}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crime Type</span>
                <p style={{ margin: '2px 0 0' }}><span className="badge bg-danger" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>{selectedCriminal.crime_type}</span></p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crime Date</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="far fa-calendar me-1" style={{ color: '#3b82f6', fontSize: '0.8rem' }}></i>{selectedCriminal.crime_date}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crime Location</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-map-pin me-1" style={{ color: '#f59e0b', fontSize: '0.8rem' }}></i>{selectedCriminal.address}</p>
              </div>
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', margin: '2px 0' }}></div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date of Birth</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-cake-candles me-1" style={{ color: '#8b5cf6', fontSize: '0.8rem' }}></i>{selectedCriminal.DateOfBirth}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gender</span>
                <p style={{ margin: '2px 0 0' }}><span className="badge bg-info" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>{selectedCriminal.gender}</span></p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a', wordBreak: 'break-word' }}><i className="fas fa-envelope me-1" style={{ color: '#3b82f6', fontSize: '0.8rem' }}></i>{selectedCriminal.email}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-phone me-1" style={{ color: '#10b981', fontSize: '0.8rem' }}></i>{selectedCriminal.contact}</p>
              </div>
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', margin: '2px 0' }}></div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>State</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}>{selectedCriminal.state}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>City</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}>{selectedCriminal.city}</p>
              </div>
              <div style={{ gridColumn: '1 / -1', background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', borderLeft: '3px solid #10b981' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Address</span>
                <p style={{ margin: '2px 0 0', fontWeight: 500, color: '#334155', lineHeight: 1.4, fontSize: '0.84rem' }}><i className="fas fa-location-dot me-1" style={{ color: '#ef4444', fontSize: '0.8rem' }}></i>{selectedCriminal.address}</p>
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

      <div className="mgmt-controls">
        <input
          type="text"
          className="mgmt-search"
          placeholder="Search by name, email, or contact..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <div className="mgmt-table-wrap">
        <div className="mgmt-table-scroll">
      <table className="mgmt-table">
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Name</th>
            <th>Crime Type</th>
            <th>Location/Address</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {criminals.length > 0 ? (
            criminals.map((criminal, idx) => (
              <tr key={criminal.id}>
                <td>{idx + 1}</td>
                <td>{criminal.Criminal_name}</td>
                <td>{criminal.crime_type}</td>
                <td>{criminal.address || '-'}</td>
                <td>{criminal.email}</td>
                <td>{criminal.contact}</td>
                <td>
                  <div className="mgmt-actions">
                    <button className="view" onClick={() => handleViewCriminal(criminal)}>
                      <i className="fas fa-eye me-1"></i>View
                    </button>
                    <button className="delete" onClick={() => handleDeleteClick(criminal.id)}>
                      <i className="fas fa-trash me-1"></i>Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="mgmt-empty">
                No criminals found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      </div>
        </Container>
      </div>
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => { setShowDeleteModal(false); setDeleteId(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Criminal Record"
        message="Are you sure you want to delete this criminal record? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        icon="fas fa-trash-alt"
        loading={deleting}
      />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="colored" />
      <Footer />
    </>
  );
};

export default CriminalsManagement;
