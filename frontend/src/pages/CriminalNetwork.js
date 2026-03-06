import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form, Badge, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { advancedAPI, criminalsAPI } from '../api/client';
import '../styles/dashboard.css';

const NODE_COLORS = {
  Active: '#ef4444', Arrested: '#f59e0b', Released: '#10b981', Wanted: '#8b5cf6', default: '#64748b'
};

const CriminalNetwork = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [criminals, setCriminals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ criminal_id_1: '', criminal_id_2: '', link_type: 'associate', description: '' });

  // Canvas state
  const [nodePositions, setNodePositions] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const dragRef = useRef({ dragging: false, nodeId: null, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    if (role !== 'Admin' && role !== 'Police') { navigate('/login'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [graphRes, crimRes] = await Promise.all([
        advancedAPI.getNetworkGraph(),
        criminalsAPI.getAll()
      ]);
      const graph = graphRes.data?.data || { nodes: [], edges: [] };
      setGraphData(graph);
      setCriminals(crimRes.data?.criminals || crimRes.data?.data || []);

      // Initialize node positions in a circle layout
      const positions = {};
      const count = graph.nodes.length;
      graph.nodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / count;
        const radius = Math.min(300, count * 30);
        positions[node.id] = {
          x: 400 + radius * Math.cos(angle),
          y: 300 + radius * Math.sin(angle)
        };
      });
      setNodePositions(positions);
    } catch (err) {
      setError('Failed to load network data');
    } finally {
      setLoading(false);
    }
  };

  // Canvas rendering
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Draw edges
    graphData.edges.forEach(edge => {
      const from = nodePositions[edge.source];
      const to = nodePositions[edge.target];
      if (!from || !to) return;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = Math.max(1, (edge.strength || 1));
      ctx.stroke();

      // Edge label
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(edge.type || '', mx, my - 4);
    });

    // Draw nodes
    graphData.nodes.forEach(node => {
      const pos = nodePositions[node.id];
      if (!pos) return;
      const isSelected = selectedNode === node.id;
      const isHovered = hoveredNode === node.id;
      const r = isSelected ? 22 : isHovered ? 20 : 16;
      const color = NODE_COLORS[node.status] || NODE_COLORS.default;

      // Shadow
      ctx.shadowColor = color + '40';
      ctx.shadowBlur = isSelected ? 16 : 8;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      if (isSelected) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Label
      ctx.font = `${isSelected ? 'bold ' : ''}11px sans-serif`;
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.fillText(node.name || `ID:${node.id}`, pos.x, pos.y + r + 14);

      // Crime type
      ctx.font = '9px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(node.crime_type || '', pos.x, pos.y + r + 26);
    });
  }, [graphData, nodePositions, selectedNode, hoveredNode]);

  useEffect(() => { drawGraph(); }, [drawGraph]);

  // Mouse handlers for canvas interactivity
  const getNodeAtPos = (x, y) => {
    for (const node of graphData.nodes) {
      const pos = nodePositions[node.id];
      if (!pos) continue;
      const dist = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
      if (dist < 20) return node.id;
    }
    return null;
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nodeId = getNodeAtPos(x, y);
    if (nodeId !== null) {
      dragRef.current = { dragging: true, nodeId, offsetX: nodePositions[nodeId].x - x, offsetY: nodePositions[nodeId].y - y };
      setSelectedNode(nodeId);
    } else {
      setSelectedNode(null);
    }
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (dragRef.current.dragging) {
      const { nodeId, offsetX, offsetY } = dragRef.current;
      setNodePositions(prev => ({ ...prev, [nodeId]: { x: x + offsetX, y: y + offsetY } }));
    } else {
      setHoveredNode(getNodeAtPos(x, y));
    }
  };

  const handleMouseUp = () => { dragRef.current.dragging = false; };

  const addLink = async () => {
    try {
      await advancedAPI.addNetworkLink(linkForm);
      setShowAddModal(false);
      setLinkForm({ criminal_id_1: '', criminal_id_2: '', link_type: 'associate', description: '' });
      fetchData();
    } catch (err) {
      setError('Failed to add link');
    }
  };

  const selectedNodeData = graphData.nodes.find(n => n.id === selectedNode);
  const selectedEdges = graphData.edges.filter(e => e.source === selectedNode || e.target === selectedNode);

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: '38px' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: '38px' }}>
      <Sidebar />
      <div style={{ flex: 1, overflowX: 'hidden' }}>
        <Container fluid className="py-4 px-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold mb-1"><i className="fas fa-project-diagram me-2" style={{ color: '#ef4444' }}></i>Criminal Network Analysis</h3>
              <p className="text-muted mb-0">Visualize relationships between criminals based on shared crimes and cases</p>
            </div>
            <Button variant="primary" onClick={() => setShowAddModal(true)} style={{ borderRadius: '10px' }}>
              <i className="fas fa-plus me-2"></i>Add Link
            </Button>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          {/* Stats */}
          <Row className="g-3 mb-4">
            <Col md={3}>
              <Card className="border-0 shadow-sm text-center py-3">
                <h2 className="fw-bold mb-0" style={{ color: '#6366f1' }}>{graphData.nodes.length}</h2>
                <small className="text-muted">Criminals</small>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm text-center py-3">
                <h2 className="fw-bold mb-0" style={{ color: '#ef4444' }}>{graphData.edges.length}</h2>
                <small className="text-muted">Connections</small>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm text-center py-3">
                <h2 className="fw-bold mb-0" style={{ color: '#f59e0b' }}>
                  {graphData.nodes.length > 0 ? (graphData.edges.length * 2 / graphData.nodes.length).toFixed(1) : '0'}
                </h2>
                <small className="text-muted">Avg Connections</small>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm text-center py-3">
                <h2 className="fw-bold mb-0" style={{ color: '#10b981' }}>
                  {[...new Set(graphData.edges.map(e => e.type).filter(Boolean))].length}
                </h2>
                <small className="text-muted">Link Types</small>
              </Card>
            </Col>
          </Row>

          <Row className="g-3">
            {/* Canvas Graph */}
            <Col lg={selectedNode ? 8 : 12}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-2">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    style={{ width: '100%', height: 'auto', cursor: hoveredNode ? 'grab' : 'default', background: '#fafbfc', borderRadius: '8px' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />
                  <div className="d-flex gap-3 justify-content-center mt-2" style={{ fontSize: '0.75rem' }}>
                    {Object.entries(NODE_COLORS).filter(([k]) => k !== 'default').map(([label, color]) => (
                      <span key={label}><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: color, marginRight: 4 }}></span>{label}</span>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Detail Panel */}
            {selectedNode && selectedNodeData && (
              <Col lg={4}>
                <Card className="border-0 shadow-sm">
                  <Card.Header style={{ background: NODE_COLORS[selectedNodeData.status] || '#64748b', color: '#fff', border: 'none', borderRadius: '8px 8px 0 0' }}>
                    <h6 className="mb-0"><i className="fas fa-user me-2"></i>{selectedNodeData.name}</h6>
                  </Card.Header>
                  <Card.Body>
                    <p className="mb-2"><strong>Crime Type:</strong> {selectedNodeData.crime_type}</p>
                    <p className="mb-2"><strong>Station:</strong> {selectedNodeData.station}</p>
                    <p className="mb-2"><strong>Status:</strong> <Badge bg={selectedNodeData.status === 'Active' ? 'danger' : 'secondary'}>{selectedNodeData.status}</Badge></p>
                    <p className="mb-2"><strong>Connections:</strong> {selectedEdges.length}</p>
                    <hr />
                    <h6 className="fw-bold">Connections</h6>
                    {selectedEdges.length === 0 ? <p className="text-muted">No connections</p> : (
                      <Table size="sm" hover>
                        <thead><tr><th>Criminal</th><th>Type</th></tr></thead>
                        <tbody>
                          {selectedEdges.map((e, i) => {
                            const otherId = e.source === selectedNode ? e.target : e.source;
                            const other = graphData.nodes.find(n => n.id === otherId);
                            return (
                              <tr key={i}>
                                <td>{other?.name || `#${otherId}`}</td>
                                <td><Badge bg="info">{e.type}</Badge></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    )}
                    <Button size="sm" variant="outline-primary" onClick={() => navigate(`/admin/criminal/${selectedNode}`)}>
                      <i className="fas fa-external-link-alt me-1"></i>View Profile
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </Container>
        <Footer />
      </div>

      {/* Add Link Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', color: '#fff', border: 'none' }}>
          <Modal.Title><i className="fas fa-link me-2"></i>Add Criminal Link</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Criminal 1</Form.Label>
            <Form.Select value={linkForm.criminal_id_1} onChange={e => setLinkForm({ ...linkForm, criminal_id_1: e.target.value })}>
              <option value="">Select Criminal</option>
              {criminals.map(c => <option key={c.id} value={c.id}>{c.Criminal_name || c.name} (ID: {c.id})</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Criminal 2</Form.Label>
            <Form.Select value={linkForm.criminal_id_2} onChange={e => setLinkForm({ ...linkForm, criminal_id_2: e.target.value })}>
              <option value="">Select Criminal</option>
              {criminals.map(c => <option key={c.id} value={c.id}>{c.Criminal_name || c.name} (ID: {c.id})</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Link Type</Form.Label>
            <Form.Select value={linkForm.link_type} onChange={e => setLinkForm({ ...linkForm, link_type: e.target.value })}>
              <option value="associate">Associate</option>
              <option value="gang_member">Gang Member</option>
              <option value="co-accused">Co-Accused</option>
              <option value="family">Family</option>
              <option value="accomplice">Accomplice</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={2} value={linkForm.description} onChange={e => setLinkForm({ ...linkForm, description: e.target.value })} placeholder="Describe relationship..." />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={addLink} disabled={!linkForm.criminal_id_1 || !linkForm.criminal_id_2}>
            <i className="fas fa-plus me-1"></i>Add Link
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CriminalNetwork;
