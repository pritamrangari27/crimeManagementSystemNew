import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { advancedAPI } from '../api/client';
import '../styles/dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b'];

const CrimePatterns = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({});

  useEffect(() => {
    if (role !== 'Admin' && role !== 'Police') { navigate('/login'); return; }
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const res = await advancedAPI.getPatterns();
      setData(res.data?.data || {});
    } catch (err) {
      setError('Failed to load crime patterns');
    } finally {
      setLoading(false);
    }
  };

  const timeSlotChart = {
    labels: (data.crimeByTimeSlot || []).map(d => d.time_slot),
    datasets: [{
      data: (data.crimeByTimeSlot || []).map(d => d.count),
      backgroundColor: COLORS.slice(0, 4),
      borderWidth: 0
    }]
  };

  const monthlyData = data.monthlyTrend || [];
  const months = [...new Set(monthlyData.map(d => d.month))].sort();
  const crimeTypes = [...new Set(monthlyData.map(d => d.crime_type))];
  const trendChart = {
    labels: months,
    datasets: crimeTypes.slice(0, 5).map((ct, i) => ({
      label: ct,
      data: months.map(m => {
        const entry = monthlyData.find(d => d.month === m && d.crime_type === ct);
        return entry ? entry.count : 0;
      }),
      borderColor: COLORS[i],
      backgroundColor: COLORS[i] + '20',
      tension: 0.3,
      fill: true
    }))
  };

  const hotspots = data.hotspotLocations || [];
  const hotspotChart = {
    labels: hotspots.slice(0, 10).map(h => h.location?.substring(0, 20) + (h.location?.length > 20 ? '...' : '')),
    datasets: [{
      label: 'Crime Count',
      data: hotspots.slice(0, 10).map(h => h.crime_count),
      backgroundColor: COLORS.slice(0, 10).map(c => c + '80'),
      borderColor: COLORS.slice(0, 10),
      borderWidth: 1
    }]
  };

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
          <div className="mb-4">
            <h3 className="fw-bold mb-1"><i className="fas fa-brain me-2" style={{ color: '#8b5cf6' }}></i>Crime Pattern Detection</h3>
            <p className="text-muted mb-0">AI-driven analysis of crime patterns by location, time, and repeat offenders</p>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          <Row className="g-3 mb-4">
            {/* Time-of-Day Distribution */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h6 className="fw-bold mb-3"><i className="fas fa-clock me-2 text-primary"></i>Crime by Time of Day</h6>
                  {(data.crimeByTimeSlot || []).length > 0 ? (
                    <Doughnut data={timeSlotChart} options={{ plugins: { legend: { position: 'bottom' } }, cutout: '60%' }} />
                  ) : <p className="text-muted text-center">No time data</p>}
                </Card.Body>
              </Card>
            </Col>

            {/* Monthly Trend */}
            <Col lg={8}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h6 className="fw-bold mb-3"><i className="fas fa-chart-line me-2 text-success"></i>Monthly Crime Trends</h6>
                  {months.length > 0 ? (
                    <Line data={trendChart} options={{
                      responsive: true,
                      plugins: { legend: { position: 'bottom' } },
                      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                    }} />
                  ) : <p className="text-muted text-center">No trend data</p>}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-3 mb-4">
            {/* Hotspot Locations */}
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h6 className="fw-bold mb-3"><i className="fas fa-map-marker-alt me-2 text-danger"></i>Crime Hotspot Locations</h6>
                  {hotspots.length > 0 ? (
                    <Bar data={hotspotChart} options={{
                      indexAxis: 'y', responsive: true,
                      plugins: { legend: { display: false } },
                      scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
                    }} />
                  ) : <p className="text-muted text-center">No hotspot data</p>}
                </Card.Body>
              </Card>
            </Col>

            {/* Repeat Offenders */}
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h6 className="fw-bold mb-3"><i className="fas fa-user-criminal me-2 text-warning"></i>Repeat Offenders</h6>
                  <Table responsive size="sm" hover>
                    <thead>
                      <tr><th>Accused</th><th>FIR Count</th><th>Crime Types</th></tr>
                    </thead>
                    <tbody>
                      {(data.repeatOffenders || []).length === 0 ? (
                        <tr><td colSpan={3} className="text-center text-muted">No repeat offenders detected</td></tr>
                      ) : (data.repeatOffenders || []).map((o, i) => (
                        <tr key={i}>
                          <td className="fw-bold">{o.accused}</td>
                          <td><Badge bg="danger">{o.fir_count}</Badge></td>
                          <td style={{ fontSize: '0.8rem' }}>{o.crime_types}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Time Patterns detail */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h6 className="fw-bold mb-3"><i className="fas fa-table me-2 text-info"></i>Detailed Time Patterns</h6>
              <Table responsive size="sm" hover>
                <thead>
                  <tr><th>Time Slot</th><th>Crime Type</th><th>Occurrences</th></tr>
                </thead>
                <tbody>
                  {(data.timePatterns || []).slice(0, 15).map((t, i) => (
                    <tr key={i}>
                      <td><Badge bg="info">{t.time_slot}</Badge></td>
                      <td>{t.crime_type}</td>
                      <td><strong>{t.count}</strong></td>
                    </tr>
                  ))}
                  {(data.timePatterns || []).length === 0 && (
                    <tr><td colSpan={3} className="text-center text-muted">No time pattern data</td></tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Container>
        <Footer />
      </div>
    </div>
  );
};

export default CrimePatterns;
