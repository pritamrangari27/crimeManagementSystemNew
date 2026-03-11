import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Modal, Form, Row, Col, Button, Badge, Table } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { policeAPI } from '../api/client';
import ConfirmModal from '../components/ConfirmModal';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';

const PoliceManagement = () => {
  const navigate = useNavigate();
  const [police, setPolice] = useState([]);
  const [allPolice, setAllPolice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPolice, setSelectedPolice] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    police_id: '',
    name: '',
    email: '',
    phone: '',
    position: '',
    station_id: '',
    joining_date: ''
  });

  useEffect(() => {
    fetchPolice();
  }, []);

  const fetchPolice = async () => {
    try {
      const response = await policeAPI.getAll();
      if (response.data.status === 'success') {
        setAllPolice(response.data.data);
        setPolice(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching police:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      const q = query.toLowerCase();
      setPolice(allPolice.filter(officer =>
        Object.values(officer).some(v => String(v || '').toLowerCase().includes(q))
      ));
    } else {
      setPolice(allPolice);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddPolice = async (e) => {
    e.preventDefault();
    try {
      await policeAPI.add(formData);
      toast.success('Police officer added successfully!');
      setFormData({
        police_id: '',
        name: '',
        email: '',
        phone: '',
        position: '',
        station_id: '',
        joining_date: ''
      });
      setShowForm(false);
      fetchPolice();
    } catch (error) {
      toast.error('Error: ' + (error.response?.data?.message || 'Failed to add officer'));
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleEditClick = (officer) => {
    setEditData({
      id: officer.id,
      police_id: officer.police_id || '',
      name: officer.name || '',
      email: officer.email || '',
      phone: officer.phone || '',
      position: officer.position || '',
      station_name: officer.station_name || '',
      station_id: officer.station_id || '',
      address: officer.address || '',
      crime_type: officer.crime_type || ''
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const { id, ...updateData } = editData;
      await policeAPI.update(id, updateData);
      toast.success('Police officer updated successfully!');
      setShowEditModal(false);
      fetchPolice();
    } catch (error) {
      toast.error('Error: ' + (error.response?.data?.message || 'Failed to update officer'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFromEdit = () => {
    setDeleteId(editData.id);
    setShowEditModal(false);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await policeAPI.delete(deleteId);
      toast.success('Police officer deleted successfully!');
      fetchPolice();
    } catch (error) {
      toast.error('Error deleting police officer');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const handleViewPolice = (officer) => {
    setSelectedPolice(officer);
    setShowViewModal(true);
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
        <Container fluid className="mgmt-container page-stagger">
      <div className="mgmt-header">
        <h2>Police Management</h2>
        <div className="mgmt-header-actions">
          <button className="mgmt-btn-back" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left me-2"></i>Back
          </button>
          <button className="mgmt-btn-primary" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus me-2"></i>Add Police Officer
          </button>
        </div>
      </div>

      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Police Officer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddPolice}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Police ID *</Form.Label>
                  <Form.Control
                    type="text"
                    name="police_id"
                    value={formData.police_id}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Position</Form.Label>
                  <Form.Control
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Joining Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button variant="secondary" onClick={() => setShowForm(false)}>
            Close
          </Button>
          <Button style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: '600' }} onClick={(e) => handleAddPolice(e)}>
            Add Police Officer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Police Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="md" centered dialogClassName="fir-view-modal">
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '12px 18px', borderBottom: 'none' }}>
          <Modal.Title style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>
            <i className="fas fa-shield-halved me-2" style={{ color: '#10b981' }}></i>
            Police Officer Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '16px 20px', background: '#ffffff' }}>
          {selectedPolice && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Officer Name</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-user-tie me-1" style={{ color: '#10b981', fontSize: '0.8rem' }}></i>{selectedPolice.name}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Police ID</span>
                <p style={{ margin: '2px 0 0' }}><span className="badge bg-primary" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>{selectedPolice.police_id}</span></p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a', wordBreak: 'break-word' }}><i className="fas fa-envelope me-1" style={{ color: '#3b82f6', fontSize: '0.8rem' }}></i>{selectedPolice.email}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-phone me-1" style={{ color: '#10b981', fontSize: '0.8rem' }}></i>{selectedPolice.phone}</p>
              </div>
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', margin: '2px 0' }}></div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Station Name</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-building me-1" style={{ color: '#f59e0b', fontSize: '0.8rem' }}></i>{selectedPolice.station_name}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Position</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-id-badge me-1" style={{ color: '#8b5cf6', fontSize: '0.8rem' }}></i>{selectedPolice.position || 'N/A'}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Specialization</span>
                <p style={{ margin: '2px 0 0' }}><span className="badge bg-danger" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>{selectedPolice.crime_type}</span></p>
              </div>
              <div style={{ gridColumn: '1 / -1', background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', borderLeft: '3px solid #10b981' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</span>
                <p style={{ margin: '2px 0 0', fontWeight: 500, color: '#334155', lineHeight: 1.4, fontSize: '0.84rem' }}><i className="fas fa-location-dot me-1" style={{ color: '#ef4444', fontSize: '0.8rem' }}></i>{selectedPolice.address}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date Joined</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="far fa-calendar me-1" style={{ color: '#3b82f6', fontSize: '0.8rem' }}></i>{selectedPolice.created_at ? new Date(selectedPolice.created_at).toLocaleDateString() : 'N/A'}</p>
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

      {/* Edit Police Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered dialogClassName="fir-view-modal">
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '12px 18px', borderBottom: 'none' }}>
          <Modal.Title style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>
            <i className="fas fa-edit me-2"></i>Edit Police Officer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '20px', background: '#ffffff' }}>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}>Police ID</Form.Label>
                  <Form.Control type="text" name="police_id" value={editData.police_id} onChange={handleEditChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}>Full Name</Form.Label>
                  <Form.Control type="text" name="name" value={editData.name} onChange={handleEditChange} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}>Email</Form.Label>
                  <Form.Control type="email" name="email" value={editData.email} onChange={handleEditChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}>Phone</Form.Label>
                  <Form.Control type="text" name="phone" value={editData.phone} onChange={handleEditChange} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}>Position</Form.Label>
                  <Form.Control type="text" name="position" value={editData.position} onChange={handleEditChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}>Station Name</Form.Label>
                  <Form.Control type="text" name="station_name" value={editData.station_name} onChange={handleEditChange} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}>Address</Form.Label>
                  <Form.Control type="text" name="address" value={editData.address} onChange={handleEditChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold" style={{ fontSize: '0.85rem' }}>Specialization</Form.Label>
                  <Form.Control type="text" name="crime_type" value={editData.crime_type} onChange={handleEditChange} />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '10px 20px', display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="danger" size="sm" onClick={handleDeleteFromEdit} style={{ borderRadius: '8px', fontWeight: 600 }}>
            <i className="fas fa-trash me-1"></i>Delete
          </Button>
          <Button variant="success" size="sm" onClick={handleSaveEdit} disabled={saving} style={{ borderRadius: '8px', fontWeight: 600, background: '#10b981', border: 'none' }}>
            {saving ? 'Saving...' : <><i className="fas fa-save me-1"></i>Save Changes</>}
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="mgmt-controls">
        <input
          type="text"
          className="mgmt-search"
          placeholder="&#128269; Search by name, email, phone, or station..."
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
            <th>Police ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Position</th>
            <th>Station</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {police.length > 0 ? (
            police.map((officer, idx) => (
              <tr key={officer.id}>
                <td>{idx + 1}</td>
                <td>{officer.police_id}</td>
                <td>{officer.name}</td>
                <td>{officer.email}</td>
                <td>{officer.phone}</td>
                <td>{officer.position || '-'}</td>
                <td>{officer.station_name}</td>
                <td>
                  <div className="mgmt-actions">
                    <button className="view" onClick={() => handleViewPolice(officer)}>
                      <i className="fas fa-eye me-1"></i>View
                    </button>
                    <button className="view" style={{ background: 'rgba(245,158,11,0.10)', color: '#f59e0b' }} onClick={() => handleEditClick(officer)}>
                      <i className="fas fa-edit me-1"></i>Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="mgmt-empty">
                No police officers found
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
        title="Delete Police Officer"
        message="Are you sure you want to delete this officer record? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        icon="fas fa-trash-alt"
        loading={deleting}
      />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="colored" />
    </>
  );
};

export default PoliceManagement;
