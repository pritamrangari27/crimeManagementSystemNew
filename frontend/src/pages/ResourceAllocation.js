import React, { useEffect, useState } from 'react';
import { Container, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { advancedAPI } from '../api/client';
import '../styles/dashboard.css';

const ResourceAllocation = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [workload, setWorkload] = useState([]);

  useEffect(() => {
    if (role !== 'Admin' && role !== 'Police') { navigate('/login'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const wRes = await advancedAPI.getWorkload();
      setWorkload(wRes.data?.data || []);
    } catch (err) {
      setError('Failed to load allocation data');
    } finally {
      setLoading(false);
    }
  };

  const totalOfficers = workload.length;
  const totalAssigned = workload.reduce((s, w) => s + (w.assigned_firs || 0) + (w.pending_firs || 0), 0);
  const avgLoad = totalOfficers > 0 ? (totalAssigned / totalOfficers).toFixed(2) : 0;

  if (loading) return (
    <>
      <Sidebar />
      <div className="with-sidebar d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    </>
  );

  return (
    <>
      <Sidebar />
      <div className="with-sidebar">
        <Container fluid className="mgmt-container page-stagger">
          <div className="mgmt-header">
            <h2><i className="fas fa-users-cog me-2" style={{ color: '#0ea5e9' }}></i>Resource Allocation</h2>
            <div className="mgmt-header-actions">
              <button className="mgmt-btn-back" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left me-2"></i>Back
              </button>
            </div>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

          {/* Stats Row */}
          <div className="bento-grid cols-3 stagger-enter" style={{ marginBottom: 'var(--grid-gap)' }}>
            <div className="bento-card" style={{ padding: 'var(--card-pad-sm)', textAlign: 'center' }}>
              <div className="bento-stat-value" style={{ color: '#0ea5e9' }}>{totalOfficers}</div>
              <div className="bento-stat-label">Total Officers</div>
            </div>
            <div className="bento-card" style={{ padding: 'var(--card-pad-sm)', textAlign: 'center' }}>
              <div className="bento-stat-value" style={{ color: '#10b981' }}>{totalAssigned}</div>
              <div className="bento-stat-label">Total Cases Assigned</div>
            </div>
            <div className="bento-card" style={{ padding: 'var(--card-pad-sm)', textAlign: 'center' }}>
              <div className="bento-stat-value" style={{ color: '#f59e0b' }}>{avgLoad}</div>
              <div className="bento-stat-label">Avg Cases/Officer</div>
            </div>
          </div>

          {/* Officer Workload Table */}
          <h6 className="fw-bold mb-2" style={{ fontSize: '0.9rem' }}><i className="fas fa-balance-scale me-2 text-primary"></i>Officer Workload</h6>
          <div className="mgmt-table-wrap" style={{ marginBottom: 'var(--grid-gap)' }}>
            <div className="mgmt-table-scroll">
              <table className="mgmt-table">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Officer</th>
                    <th>Station</th>
                    <th>Cases</th>
                  </tr>
                </thead>
                <tbody>
                  {workload.length === 0 ? (
                    <tr><td colSpan={4} className="mgmt-empty">No officers found</td></tr>
                  ) : workload.map((officer, idx) => {
                    const totalCases = (officer.assigned_firs || 0) + (officer.pending_firs || 0);
                    return (
                      <tr key={officer.id}>
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{officer.name}</strong>
                          <br /><small className="text-muted">ID: {officer.police_id}</small>
                        </td>
                        <td>{officer.station_name || '-'}</td>
                        <td>
                          <Badge bg={totalCases > 5 ? 'danger' : totalCases > 2 ? 'warning' : 'success'}>{totalCases}</Badge>
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
      <Footer />
    </>
  );
};

export default ResourceAllocation;
