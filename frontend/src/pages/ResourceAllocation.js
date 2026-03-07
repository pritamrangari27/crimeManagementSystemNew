import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { advancedAPI, firsAPI } from '../api/client';
import '../styles/dashboard.css';

const ResourceAllocation = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const user = JSON.parse(localStorage.getItem('authUser'));
  const userPoliceId = user?.badge_number;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [workload, setWorkload] = useState([]);
  const [personalFIRs, setPersonalFIRs] = useState([]);

  useEffect(() => {
    if (role !== 'Admin' && role !== 'Police') { navigate('/login'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (role === 'Admin') {
        // Admin: Show all officers workload
        const wRes = await advancedAPI.getWorkload();
        setWorkload(wRes.data?.data || []);
      } else if (role === 'Police' && userPoliceId) {
        // Police: Show only their personal cases and workload stats
        const firsRes = await firsAPI.getMyAssigned();
        const firs = firsRes.data?.data || [];
        
        // Build a personal workload object
        const personalWorkload = {
          name: user?.username,
          police_id: userPoliceId,
          station_name: user?.station_id,
          assigned_firs: firs.filter(f => f.status !== 'Rejected').length,
          pending_firs: firs.filter(f => f.status === 'Sent').length
        };
        setWorkload([personalWorkload]);
      }
    } catch (err) {
      setError('Failed to load allocation data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalOfficers = workload.length;
  const totalAssigned = workload.reduce((s, w) => s + (w.assigned_firs || 0) + (w.pending_firs || 0), 0);
  const avgLoad = totalOfficers > 0 ? (totalAssigned / totalOfficers).toFixed(2) : 0;

  // For police: show personal stats instead
  const displayStats = role === 'Admin' ? {
    label1: 'Total Officers',
    value1: totalOfficers,
    label2: 'Total Cases Assigned',
    value2: totalAssigned,
    label3: 'Avg Cases/Officer',
    value3: avgLoad
  } : {
    label1: 'My Cases Assigned',
    value1: workload.length > 0 ? (workload[0].assigned_firs || 0) + (workload[0].pending_firs || 0) : 0,
    label2: 'Pending',
    value2: workload.length > 0 ? workload[0].pending_firs || 0 : 0,
    label3: 'Completed',
    value3: workload.length > 0 ? workload[0].assigned_firs || 0 : 0
  };

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
            <h2><i className="fas fa-users-cog me-2" style={{ color: '#0ea5e9' }}></i>
              {role === 'Admin' ? 'Resource Allocation' : 'My Workload'}
            </h2>
            <div className="mgmt-header-actions">
              <button className="mgmt-btn-back" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left me-2"></i>Back
              </button>
            </div>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

          {role === 'Police' && (
            <Alert variant="info" style={{ marginBottom: 'var(--grid-gap)', borderRadius: '10px', borderLeft: '4px solid #0ea5e9' }}>
              <i className="fas fa-info-circle me-2"></i>
              Showing your personal case workload. View <strong>Case Workflow</strong> for detailed case progress.
            </Alert>
          )}

          {/* Stats Row */}
          <div className="bento-grid cols-3 stagger-enter" style={{ marginBottom: 'var(--grid-gap)' }}>
            <div className="bento-card" style={{ padding: 'var(--card-pad-sm)', textAlign: 'center' }}>
              <div className="bento-stat-value" style={{ color: '#0ea5e9' }}>{displayStats.value1}</div>
              <div className="bento-stat-label">{displayStats.label1}</div>
            </div>
            <div className="bento-card" style={{ padding: 'var(--card-pad-sm)', textAlign: 'center' }}>
              <div className="bento-stat-value" style={{ color: '#10b981' }}>{displayStats.value2}</div>
              <div className="bento-stat-label">{displayStats.label2}</div>
            </div>
            <div className="bento-card" style={{ padding: 'var(--card-pad-sm)', textAlign: 'center' }}>
              <div className="bento-stat-value" style={{ color: '#f59e0b' }}>{displayStats.value3}</div>
              <div className="bento-stat-label">{displayStats.label3}</div>
            </div>
          </div>

          {/* Officer Workload Table */}
          <h6 className="fw-bold mb-2" style={{ fontSize: '0.9rem' }}><i className="fas fa-balance-scale me-2 text-primary"></i>
            {role === 'Admin' ? 'Officer Workload' : 'My Case Details'}
          </h6>
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
                    <tr><td colSpan={4} className="mgmt-empty">{role === 'Admin' ? 'No officers found' : 'No cases assigned yet'}</td></tr>
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
