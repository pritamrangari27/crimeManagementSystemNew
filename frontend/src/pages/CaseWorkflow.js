import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Spinner, Alert, Card, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { firsAPI, advancedAPI } from '../api/client';
import '../styles/dashboard.css';

const STAGES = ['FIR Filed', 'Under Review', 'Investigation', 'Charge Sheet Filed', 'Court Proceedings', 'Closed'];
const STAGE_ICONS = ['fas fa-file-alt', 'fas fa-search', 'fas fa-user-secret', 'fas fa-gavel', 'fas fa-balance-scale', 'fas fa-check-double'];
const STAGE_COLORS = ['#64748b', '#0ea5e9', '#8b5cf6', '#ec4899', '#6366f1', '#10b981'];

const CaseWorkflow = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const user = JSON.parse(localStorage.getItem('authUser'));
  const userPoliceId = user?.badge_number;
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
  const [stageSelectFIR, setStageSelectFIR] = useState(null);
  const [selectedStage, setSelectedStage] = useState('');

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

  const handleSetStage = async () => {
    if (!stageSelectFIR || !selectedStage) return;
    setAdvancing(true);
    try {
      await advancedAPI.setWorkflowStage(stageSelectFIR.id, selectedStage);
      await fetchFIRs();
      setStageSelectFIR(null);
      setSelectedStage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stage');
    } finally {
      setAdvancing(false);
    }
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
          <div className="mgmt-header">
            <h2><i className="fas fa-project-diagram me-2" style={{ color: '#6366f1' }}></i>
              {role === 'Admin' ? 'All Cases Workflow' : 'My Case Workflow'}
            </h2>
            <div className="mgmt-header-actions">
              <button className="mgmt-btn-back" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left me-2"></i>Back
              </button>
            </div>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          {role === 'Police' && (
            <Alert variant="info" style={{ marginBottom: 'var(--grid-gap)', borderRadius: '10px', borderLeft: '4px solid #6366f1' }}>
              <i className="fas fa-info-circle me-2"></i>
              Showing only cases assigned to you.
            </Alert>
          )}

          {/* Stage Pipeline Filters */}
          <div className="mgmt-controls" style={{ flexWrap: 'wrap', gap: '6px' }}>
            <Button size="sm" variant={filterStage === 'All' ? 'primary' : 'outline-secondary'} onClick={() => setFilterStage('All')} style={{ whiteSpace: 'nowrap', borderRadius: '20px', fontSize: '0.78rem' }}>
              All ({firs.length})
            </Button>
            {stageCounts.map(({ stage, count }, i) => (
              <Button key={stage} size="sm" variant={filterStage === stage ? 'primary' : 'outline-secondary'} onClick={() => setFilterStage(stage)}
                style={{ whiteSpace: 'nowrap', borderRadius: '20px', fontSize: '0.78rem', borderColor: STAGE_COLORS[i] + '40', color: filterStage === stage ? '#fff' : STAGE_COLORS[i], background: filterStage === stage ? STAGE_COLORS[i] : 'transparent' }}>
                <i className={`${STAGE_ICONS[i]} me-1`}></i>{stage} ({count})
              </Button>
            ))}
          </div>

          {/* FIR Table */}
          <div className="mgmt-table-wrap">
            <div className="mgmt-table-scroll">
              <table className="mgmt-table">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>FIR #</th>
                    <th>Crime Type</th>
                    <th>Complainant</th>
                    <th>Station</th>
                    <th>Priority</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFIRs.length === 0 ? (
                    <tr><td colSpan={7} className="mgmt-empty">No cases found</td></tr>
                  ) : filteredFIRs.map((fir, idx) => (
                    <tr key={fir.id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{fir.fir_number || `FIR-${String(fir.id).padStart(4, '0')}`}</td>
                      <td>{fir.crime_type}</td>
                      <td>{fir.complainant_name || fir.name || '-'}</td>
                      <td>{fir.station_name || '-'}</td>
                      <td>
                        <span className={`mgmt-badge ${fir.priority === 'Critical' ? 'danger' : fir.priority === 'High' ? 'warning' : fir.priority === 'Low' ? 'secondary' : 'info'}`}>
                          {fir.priority || 'Medium'}
                        </span>
                      </td>
                      <td>
                        <div className="mgmt-actions">
                          <button className="view" onClick={() => viewTimeline(fir)}>
                            <i className="fas fa-timeline me-1"></i>Timeline
                          </button>
                          <button className="view" style={{ background: 'rgba(6,182,212,0.10)', color: '#06b6d4' }} onClick={() => viewFIRDetails(fir)}>
                            <i className="fas fa-eye"></i>
                          </button>
                          {(role === 'Admin' || role === 'Police') && (fir.workflow_stage || 'FIR Filed') !== 'Closed' && (
                            <button className="view" style={{ background: 'rgba(139,92,246,0.10)', color: '#8b5cf6' }} onClick={() => { setStageSelectFIR(fir); setSelectedStage(fir.workflow_stage || 'FIR Filed'); }}>
                              <i className="fas fa-step-forward me-1"></i>Stage
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </div>

      {/* Timeline Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered dialogClassName="fir-view-modal">
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none' }}>
          <Modal.Title style={{ fontSize: '1rem', fontWeight: 700 }}>
            <i className="fas fa-project-diagram me-2"></i>
            Case Timeline — {selectedFIR?.fir_number || `FIR #${selectedFIR?.id}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '30px' }}>
          <div className="workflow-timeline">
            {timeline.map((step, i) => (
              <div key={i} className={`workflow-step ${step.status}`}>
                <div className="workflow-step-indicator" style={{
                  background: step.status === 'completed' ? '#10b981' : step.status === 'current' ? STAGE_COLORS[i] : '#e2e8f0',
                  color: step.status === 'pending' ? '#94a3b8' : '#fff',
                  width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.85rem', position: 'relative', zIndex: 2,
                  boxShadow: step.status === 'current' ? `0 0 0 4px ${STAGE_COLORS[i]}30` : 'none'
                }}>
                  {step.status === 'completed' ? <i className="fas fa-check"></i> : step.order}
                </div>
                <div style={{ flex: 1, marginLeft: 16 }}>
                  <div style={{ fontWeight: step.status === 'current' ? 700 : 500, color: step.status === 'pending' ? '#94a3b8' : '#1e293b', fontSize: '0.95rem' }}>
                    <i className={`${STAGE_ICONS[i]} me-2`} style={{ color: STAGE_COLORS[i] }}></i>
                    {step.stage}
                  </div>
                  {step.status === 'current' && (
                    <Badge bg="primary" className="mt-1" style={{ fontSize: '0.7rem' }}>CURRENT STAGE</Badge>
                  )}
                </div>
                {i < timeline.length - 1 && (
                  <div style={{
                    position: 'absolute', left: 19, top: 44, width: 2, height: 'calc(100% - 28px)',
                    background: step.status === 'completed' ? '#10b981' : '#e2e8f0'
                  }}></div>
                )}
              </div>
            ))}
          </div>

          {selectedFIR && (selectedFIR.workflow_stage || 'FIR Filed') !== 'Closed' && (role === 'Admin' || role === 'Police') && (
            <div className="text-center mt-4">
              <Button variant="primary" onClick={advanceStage} disabled={advancing} style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', padding: '10px 30px'
              }}>
                {advancing ? <Spinner size="sm" className="me-2" /> : <i className="fas fa-arrow-right me-2"></i>}
                Advance to Next Stage
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* FIR Details Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="md" centered dialogClassName="fir-view-modal animated-modal">
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '14px 18px', borderBottom: 'none' }}>
          <Modal.Title style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>
            <i className="fas fa-file-invoice me-2" style={{ color: '#06b6d4' }}></i>
            FIR Details
            {detailFIR && (
              <Badge bg={detailFIR.status === 'Approved' ? 'success' : detailFIR.status === 'Rejected' ? 'danger' : 'info'} className="ms-2" style={{ fontSize: '0.7rem', padding: '4px 8px', verticalAlign: 'middle' }}>
                {detailFIR.status}
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '20px 24px', background: '#ffffff' }}>
          {detailFIR && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>FIR Number</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}>{detailFIR.fir_number || `FIR-${String(detailFIR.id).padStart(4, '0')}`}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crime Type</span>
                <p style={{ margin: '4px 0 0' }}><span className="badge bg-danger" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>{detailFIR.crime_type}</span></p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crime Date</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="far fa-calendar me-1" style={{ color: '#3b82f6', fontSize: '0.8rem' }}></i>{detailFIR.crime_date || 'N/A'}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-map-pin me-1" style={{ color: '#f59e0b', fontSize: '0.8rem' }}></i>{detailFIR.location || 'N/A'}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Workflow Stage</span>
                <p style={{ margin: '4px 0 0' }}>{getStageBadge(detailFIR.workflow_stage)}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Station</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-building me-1" style={{ color: '#6366f1', fontSize: '0.8rem' }}></i>{detailFIR.station_name || detailFIR.station_id || 'N/A'}</p>
              </div>
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', margin: '2px 0' }}></div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Accused Name</span>
                <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#ef4444' }}><i className="fas fa-user-secret me-1" style={{ fontSize: '0.8rem' }}></i>{detailFIR.accused || '-'}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Relation to Accused</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}>{detailFIR.relation || '-'}</p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Purpose of FIR</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#334155' }}>{detailFIR.purpose || '-'}</p>
              </div>
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', margin: '2px 0' }}></div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Complainant</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="fas fa-user-shield me-1" style={{ color: '#10b981', fontSize: '0.8rem' }}></i>{detailFIR.complainant_name || detailFIR.name || '-'}</p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filed On</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0f172a' }}><i className="far fa-clock me-1" style={{ color: '#f59e0b', fontSize: '0.8rem' }}></i>{detailFIR.created_at ? new Date(detailFIR.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '10px 20px', justifyContent: 'center' }}>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowDetailModal(false)} style={{ borderRadius: '8px', padding: '5px 20px', fontWeight: 600 }}>
            <i className="fas fa-times me-1"></i>Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Set Stage Modal */}
      <Modal show={!!stageSelectFIR} onHide={() => setStageSelectFIR(null)} size="sm" centered>
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', border: 'none' }}>
          <Modal.Title style={{ fontSize: '0.95rem', fontWeight: 700 }}>
            <i className="fas fa-step-forward me-2"></i>Set Stage
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
            FIR: <strong>{stageSelectFIR?.fir_number || `#${stageSelectFIR?.id}`}</strong>
          </p>
          <Form.Select value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)} style={{ borderRadius: '8px' }}>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setStageSelectFIR(null)}>Cancel</Button>
          <Button size="sm" onClick={handleSetStage} disabled={advancing} style={{ background: '#8b5cf6', border: 'none', borderRadius: '8px' }}>
            {advancing ? <Spinner size="sm" className="me-1" /> : <i className="fas fa-check me-1"></i>}
            Update Stage
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
      <style>{`
        .workflow-timeline { position: relative; }
        .workflow-step { display: flex; align-items: flex-start; position: relative; padding-bottom: 28px; }
        .workflow-step:last-child { padding-bottom: 0; }
      `}</style>
    </>
  );
};

export default CaseWorkflow;
