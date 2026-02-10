import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { firsAPI } from '../api/client';
import '../styles/dashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('authUser'));
  const role = localStorage.getItem('userRole');
  const [myFIRs, setMyFIRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !user.id) {
          setError('User not found. Please log in again.');
          setLoading(false);
          return;
        }

        console.log('Fetching data for user:', user.id);
        
        const firsRes = await firsAPI.getByUser(user.id);

        console.log('FIRs Response:', firsRes.data);

        if (firsRes.data.status === 'success') {
          setMyFIRs(firsRes.data.data || []);
          setError(null);
        } else {
          setError('Failed to load FIRs. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load FIRs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  if (loading) return (
    <div className="d-flex">
      <Sidebar />
      <div className="with-sidebar w-100">
        <div className="text-center py-5">Loading dashboard...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="d-flex">
      <Sidebar />
      <div className="with-sidebar w-100">
        <div className="text-center py-5 text-danger">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    </div>
  );

  const pendingFIRs = myFIRs.filter(f => f.status === 'Pending').length;
  const approvedFIRs = myFIRs.filter(f => f.status === 'Approved').length;

  return (
    <>
      <Sidebar />
      
      <div className="with-sidebar">
        <Container fluid className="dashboard-container py-5 px-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">User Dashboard</h2>
          <p className="text-muted">Welcome back! Manage your FIRs and track their status.</p>
        </Col>
        <Col md={3} className="text-end">
          <Button 
            style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: '600' }}
            size="sm"
            onClick={() => navigate('/fir/form')}
            className="fw-bold"
          >
            <i className="fas fa-file-medical me-2"></i>File New FIR
          </Button>
        </Col>
      </Row>

      <Row>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6 className="text-muted text-uppercase fw-bold">My FIRs</h6>
              <h3 className="fw-bold">{myFIRs.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6 className="text-muted text-uppercase fw-bold">Pending</h6>
              <h3 className="fw-bold text-warning">{pendingFIRs}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6 className="text-muted text-uppercase fw-bold">Approved</h6>
              <h3 className="fw-bold text-success">{approvedFIRs}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white fw-bold">
          Recent FIRs
        </Card.Header>
        <Card.Body>
          {myFIRs.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>FIR Number</th>
                    <th>Crime Type</th>
                    <th>Status</th>
                    <th>Filed On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myFIRs.slice(0, 5).map((fir) => (
                    <tr key={fir.id}>
                      <td>FIR-{String(fir.id).padStart(4, '0')}</td>
                      <td>{fir.crime_type}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            fir.status === 'Approved'
                              ? 'success'
                              : fir.status === 'Rejected'
                              ? 'danger'
                              : 'warning'
                          }`}
                        >
                          {fir.status}
                        </span>
                      </td>
                      <td>{new Date(fir.created_at).toLocaleDateString()}</td>
                      <td>
                        <Button href={`/fir/${fir.id}`} variant="info" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted">You haven't filed any FIRs yet.</p>
          )}
        </Card.Body>
      </Card>


        </Container>
      </div>
      <Footer />
    </>
  );
};

export default UserDashboard;