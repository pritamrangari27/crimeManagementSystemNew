import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import './styles/mobile.css';

// Context
import { ChangePasswordProvider } from './context/ChangePasswordContext';

// Pages
import LoginModern from './pages/LoginModern';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import PoliceDashboard from './pages/PoliceDashboard';
import CriminalsManagement from './pages/CriminalsManagement';
import PoliceManagement from './pages/PoliceManagement';
import StationsManagement from './pages/StationsManagement';
import FIRManagement from './pages/FIRManagement';
import UserFIRForm from './pages/UserFIRForm';
import UserFIRList from './pages/UserFIRList';
import PoliceSentFIRs from './pages/PoliceSentFIRs';
import UserProfile from './pages/UserProfile';
import AdminProfile from './pages/AdminProfile';
import PoliceProfile from './pages/PoliceProfile';
import StationDetails from './pages/StationDetails';
import CriminalDetails from './pages/CriminalDetails';
import PoliceDetails from './pages/PoliceDetails';
import CrimeAnalysis from './pages/CrimeAnalysis';
import CrimeHotspotMap from './pages/CrimeHotspotMap';
import CaseWorkflow from './pages/CaseWorkflow';
import CrimePatterns from './pages/CrimePatterns';
import ExportReports from './pages/ExportReports';
import ChangePassword from './pages/ChangePassword';

// Components
import PrivateRoute from './api/PrivateRoute';
import Chatbot from './components/Chatbot';
import { useLocation } from 'react-router-dom';

// Layout wrapper to conditionally show navbar
function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {!isAuthPage && (
        <div className="system-banner" style={{
          width: '100%',
          background: 'linear-gradient(90deg, #ff9800 0%, #f44336 100%)',
          color: '#fff',
          textAlign: 'center',
          padding: '8px 0',
          fontWeight: 600,
          fontSize: '14px',
          letterSpacing: '0.5px',
          zIndex: 10000,
          position: 'fixed',
          top: 0,
          left: 0,
          borderBottom: '2px solid rgba(0,0,0,0.1)',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ marginRight: 8 }}>&#9888;</span>
          A system building is in progress
          <span style={{ marginLeft: 8 }}>&#9888;</span>
        </div>
      )}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginModern />} />
        <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/stations"
            element={
              <PrivateRoute>
                <StationsManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/station/:id"
            element={
              <PrivateRoute>
                <StationDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/criminals"
            element={
              <PrivateRoute>
                <CriminalsManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/criminal/:id"
            element={
              <PrivateRoute>
                <CriminalDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/police"
            element={
              <PrivateRoute>
                <PoliceManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/police/:id"
            element={
              <PrivateRoute>
                <PoliceDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/firs"
            element={
              <PrivateRoute>
                <FIRManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <PrivateRoute>
                <CrimeAnalysis />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/hotspot-map"
            element={
              <PrivateRoute>
                <CrimeHotspotMap />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/workflow"
            element={
              <PrivateRoute>
                <CaseWorkflow />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/patterns"
            element={
              <PrivateRoute>
                <CrimePatterns />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/export"
            element={
              <PrivateRoute>
                <ExportReports />
              </PrivateRoute>
            }
          />
          {/* User Routes */}
          <Route
            path="/user/dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/fir/form"
            element={
              <PrivateRoute>
                <UserFIRForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/fir/list"
            element={
              <PrivateRoute>
                <UserFIRList />
              </PrivateRoute>
            }
          />

          {/* Police Routes */}
          <Route
            path="/police/dashboard"
            element={
              <PrivateRoute>
                <PoliceDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/police/firs/sent"
            element={
              <PrivateRoute>
                <PoliceSentFIRs />
              </PrivateRoute>
            }
          />
          <Route
            path="/police/firs/approved"
            element={
              <PrivateRoute>
                <PoliceSentFIRs />
              </PrivateRoute>
            }
          />
          <Route
            path="/police/firs/rejected"
            element={
              <PrivateRoute>
                <PoliceSentFIRs />
              </PrivateRoute>
            }
          />
          <Route
            path="/police/criminals"
            element={
              <PrivateRoute>
                <CriminalsManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/police/workflow"
            element={
              <PrivateRoute>
                <CaseWorkflow />
              </PrivateRoute>
            }
          />
          {/* Profile Routes */}
          <Route
            path="/admin/profile"
            element={
              <PrivateRoute>
                <AdminProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/police/profile"
            element={
              <PrivateRoute>
                <PoliceProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <PrivateRoute>
                <ChangePassword />
              </PrivateRoute>
            }
          />

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        {!isAuthPage && <Chatbot />}
      </>
    );
  }

function App() {
  return (
    <Router>
      <ChangePasswordProvider>
        <div className="App">
          <AppLayout />
        </div>
      </ChangePasswordProvider>
    </Router>
  );
}

export default App;
