import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';

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
import FIRDetails from './pages/FIRDetails';
import PoliceSentFIRs from './pages/PoliceSentFIRs';
import UserProfile from './pages/UserProfile';
import AdminProfile from './pages/AdminProfile';
import PoliceProfile from './pages/PoliceProfile';
import CrimeAnalysis from './pages/CrimeAnalysis';
import ChangePassword from './pages/ChangePassword';
import StationDetails from './pages/StationDetails';
import CriminalDetails from './pages/CriminalDetails';
import PoliceDetails from './pages/PoliceDetails';

// Components
import Navigation from './components/Navigation';
import PrivateRoute from './api/PrivateRoute';
import { useLocation } from 'react-router-dom';

// Layout wrapper to conditionally show navbar
function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isProtectedRoute = !isAuthPage;

  return (
    <>
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
            path="/admin/crime-analysis"
            element={
              <PrivateRoute>
                <CrimeAnalysis />
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
          <Route
            path="/fir/:id"
            element={
              <PrivateRoute>
                <FIRDetails />
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
      </>
    );
  }

function App() {
  return (
    <Router>
      <div className="App">
        <AppLayout />
      </div>
    </Router>
  );
}

export default App;
