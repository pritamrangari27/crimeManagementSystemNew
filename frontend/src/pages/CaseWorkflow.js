import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Spinner, Alert, Badge, Modal, Form } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import { firsAPI, advancedAPI } from '../api/client';
import '../styles/dashboard.css';

const STAGES = ['FIR Filed', 'Under Review', 'Investigation', 'Charge Sheet Filed', 'Court Proceedings', 'Closed'];
const STAGE_ICONS = ['fas fa-file-alt', 'fas fa-edit', 'fas fa-magnifying-glass', 'fas fa-book', 'fas fa-gavel', 'fas fa-check'];
const STAGE_COLORS = ['#64748b', '#0ea5e9', '#8b5cf6', '#ec4899', '#6366f1', '#10b981'];

const CaseWorkflow = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const user = JSON.parse(localStorage.getItem('authUser'));
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFIR, setSelectedFIR] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailFIR, setDetailFIR] = useState(null);
  const [advancing, setAdvancing] = useState(false);
  const [filterStage, setFilterStage] = useState('All');

  useEffect(() => {
    if (role !== 'Admin' && role !== 'Police') { navigate('/login'); return; }
    fetchFIRs();
  }, []);

  const fetchFIRs = async () => {
    try {
      setLoading(true);
      let res;
      
      // Admin sees all FIRs, Police sees only their assigned FIRs
      if (role === 'Admin') {
        res = await firsAPI.getAll();
      } else if (role === 'Police') {
        res = await firsAPI.getMyAssigned();
      } else {
        throw new Error('Invalid role');
      }
      
      const data = res.data?.firs || res.data?.data || [];
      setFirs(data);
    } catch (err) {
      setError('Failed to load FIRs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewTimeline = async (fir) => {
    setSelectedFIR(fir);
    try {
      const res = await advancedAPI.getWorkflowTimeline(fir.id);
      setTimeline(res.data?.data?.timeline || []);
    } catch {
      // Build timeline locally if endpoint fails
      const stageIdx = STAGES.indexOf(fir.workflow_stage || 'FIR Filed');
      setTimeline(STAGES.map((s, i) => ({
        stage: s, status: i < stageIdx ? 'completed' : i === stageIdx ? 'current' : 'pending', order: i + 1
      })));
    }
    setShowModal(true);
  };

  const advanceStage = async () => {
    if (!selectedFIR) return;
    setAdvancing(true);
    try {
      await advancedAPI.advanceWorkflow(selectedFIR.id);
      await fetchFIRs();
      // Refresh timeline
      const res = await advancedAPI.getWorkflowTimeline(selectedFIR.id);
      setTimeline(res.data?.data?.timeline || []);
      setSelectedFIR(prev => {
        const idx = STAGES.indexOf(prev.workflow_stage || 'FIR Filed');
        return { ...prev, workflow_stage: STAGES[Math.min(idx + 1, STAGES.length - 1)] };
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to advance stage');
    } finally {
      setAdvancing(false);
    }
  };

  const viewFIRDetails = async (fir) => {
    try {
      const res = await firsAPI.getById(fir.id);
      setDetailFIR(res.data?.data || fir);
    } catch {
      setDetailFIR(fir);
    }
    setShowDetailModal(true);
  };

  const getStageBadge = (stage) => {
    const idx = STAGES.indexOf(stage || 'FIR Filed');
    return (
      <Badge style={{ background: STAGE_COLORS[idx] || '#64748b', fontSize: '0.75rem' }}>
        <i className={`${STAGE_ICONS[idx]} me-1`}></i>{stage || 'FIR Filed'}
      </Badge>
    );
  };

  const normalizeStage = (stage) => {
    if (!stage || !STAGES.includes(stage)) return 'FIR Filed';
    return stage;
  };

  const filteredFIRs = filterStage === 'All' ? firs : firs.filter(f => normalizeStage(f.workflow_stage) === filterStage);

  const stageCounts = STAGES.map(s => ({ stage: s, count: firs.filter(f => normalizeStage(f.workflow_stage) === s).length }));

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: '38px' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    </div>
  );

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
        <Container fluid className="mgmt-container page-stagger">
          {/* Header */}
          <div className="mgmt-header">
            <h2><i className="fas fa-project-diagram me-2" style={{ color: '#6366f1' }}></i>
              {role === 'Admin' ? 'Cases Workflow' : 'My Cases'}
            </h2>
            <div
              className="mgmt-header-actions"
            >
              <button className="mgmt-btn-back" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left me-2"></i>Back
              </button>
            </div>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          {role === 'Police' && (
            <Alert variant="info" style={{ marginBottom: '12px', borderRadius: '8px', borderLeft: '4px solid #6366f1', fontSize: '0.9rem' }}>
              <i className="fas fa-info-circle me-2"></i>
              Showing cases assigned to you
            </Alert>
          )}

          {/* Stage Filter Buttons */}
          <div className="mgmt-controls" style={{ flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            <Button
              size="sm"
              variant={filterStage === 'All' ? 'primary' : 'outline-secondary'}
              onClick={() => setFilterStage('All')}
              style={{ whiteSpace: 'nowrap', borderRadius: '20px', fontSize: '0.78rem', padding: '5px 14px' }}
            >
              All ({firs.length})
            </Button>
            {STAGES.map((stage, i) => {
              const count = firs.filter(f => (f.workflow_stage || 'FIR Filed') === stage).length;
              return (
                <Button
                  key={stage}
                  size="sm"
                  variant={filterStage === stage ? 'primary' : 'outline-secondary'}
                  onClick={() => setFilterStage(stage)}
                  style={{
                    whiteSpace: 'nowrap',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    padding: '5px 14px',
                    borderColor: filterStage === stage ? STAGE_COLORS[i] : STAGE_COLORS[i] + '60',
                    color: filterStage === stage ? '#fff' : STAGE_COLORS[i],
                    background: filterStage === stage ? STAGE_COLORS[i] : 'transparent'
                  }}
                >
                  <i className={`${STAGE_ICONS[i]} me-1`}></i>{stage} ({count})
                </Button>
              );
            })}
          </div>

          {/* Simple Table */}
          <div className="mgmt-table-wrap">
            <div className="mgmt-table-scroll">
              <table className="mgmt-table">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>FIR #</th>
                    <th>Crime Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(filterStage === 'All' ? firs : firs.filter(f => (f.workflow_stage || 'FIR Filed') === filterStage)).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="mgmt-empty">
                        <i className="fas fa-inbox me-2"></i>No cases found
                      </td>
                    </tr>
                  ) : (filterStage === 'All' ? firs : firs.filter(f => (f.workflow_stage || 'FIR Filed') === filterStage)).map((fir, idx) => {
                    const stageIdx = STAGES.indexOf(fir.workflow_stage || 'FIR Filed');
                    return (
                      <tr key={fir.id}>
                        <td style={{ fontWeight: 700, color: '#6366f1', textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>FIR-{String(fir.id).padStart(4, '0')}</td>
                        <td><Badge bg="danger" style={{ fontSize: '0.75rem' }}>{fir.crime_type || 'N/A'}</Badge></td>
                        <td>
                          <Badge style={{ background: STAGE_COLORS[stageIdx] || '#64748b', fontSize: '0.75rem' }}>
                            <i className={`${STAGE_ICONS[stageIdx]} me-1`}></i>{fir.workflow_stage || 'FIR Filed'}
                          </Badge>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="mgmt-actions">
                            <button className="view" onClick={() => viewTimeline(fir)} title="View Timeline">
                              <i className="fas fa-timeline"></i>
                            </button>
                            <button className="view" onClick={() => viewFIRDetails(fir)} title="View Details">
                              <i className="fas fa-eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </div>

      {/* Timeline Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="md" centered>
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', borderBottom: 'none', borderRadius: '8px 8px 0 0' }}>
          <Modal.Title style={{ fontSize: '0.95rem', fontWeight: 700 }}>
            <i className="fas fa-timeline me-2"></i>Timeline — FIR-{selectedFIR ? String(selectedFIR.id).padStart(4, '0') : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
            {timeline.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', position: 'relative' }}>
                <div style={{
                  background: step.status === 'completed' ? '#10b981' : step.status === 'current' ? STAGE_COLORS[i] : '#e2e8f0',
                  color: step.status === 'pending' ? '#94a3b8' : '#fff',
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
                  boxShadow: step.status === 'current' ? `0 0 0 3px ${STAGE_COLORS[i]}30` : 'none'
                }}>
                  {step.status === 'completed' ? <i className="fas fa-check"></i> : step.order}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: step.status === 'current' ? 700 : 500, color: step.status === 'pending' ? '#94a3b8' : '#1e293b', fontSize: '0.9rem' }}>
                    <i className={`${STAGE_ICONS[i]} me-2`} style={{ color: STAGE_COLORS[i] }}></i>{step.stage}
                  </div>
                  {step.status === 'current' && <Badge bg="primary" style={{ fontSize: '0.65rem', marginTop: '4px' }}>CURRENT</Badge>}
                </div>
              </div>
            ))}
          </div>

          {selectedFIR && (selectedFIR.workflow_stage || 'FIR Filed') !== 'Closed' && (role === 'Admin' || role === 'Police') && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Button size="sm" onClick={advanceStage} disabled={advancing} style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '8px', padding: '8px 24px', fontSize: '0.85rem'
              }}>
                {advancing ? <Spinner size="sm" className="me-2" /> : <i className="fas fa-arrow-right me-2"></i>}
                Advance Stage
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* FIR Details Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="md" centered>
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '14px 18px', borderBottom: 'none' }}>
          <Modal.Title style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700 }}>
            <i className="fas fa-file-invoice me-2" style={{ color: '#06b6d4' }}></i>Case Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '16px 20px', fontSize: '0.85rem' }}>
          {detailFIR && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>FIR #</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}>FIR-{String(detailFIR.id).padStart(4, '0')}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Crime Type</span>
                <p style={{ margin: '4px 0 0' }}><Badge bg="danger" style={{ fontSize: '0.7rem' }}>{detailFIR.crime_type || 'N/A'}</Badge></p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Crime Date</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}>{detailFIR.crime_date || 'N/A'}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</span>
                <p style={{ margin: '4px 0 0' }}>
                  <Badge bg={detailFIR.status === 'Approved' ? 'success' : detailFIR.status === 'Rejected' ? 'danger' : 'info'} style={{ fontSize: '0.7rem' }}>
                    {detailFIR.status || 'Sent'}
                  </Badge>
                </p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Complainant</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}>{detailFIR.complainant_name || detailFIR.name || 'N/A'}</p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Accused</span>
                <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#ef4444' }}>{detailFIR.accused || 'N/A'}</p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Location</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}>{detailFIR.location || 'N/A'}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '10px 20px' }}>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowDetailModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CaseWorkflow;
