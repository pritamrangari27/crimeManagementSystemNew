import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getUserRole, getCurrentUser } from '../utils/authService';

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Get auth data from centralized service
    const user = getCurrentUser();
    const role = getUserRole();
    
    if (!user || !role) {
      setIsAuthenticated(false);
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);
    setUserRole(role);

    // Role-based access control
    const pathname = location.pathname;
    let isAllowed = false;

    switch (role) {
      case 'Admin':
        // Admin can access: /admin/*, /admin-profile, /profile, /admin-fir, /change-password
        isAllowed = pathname.startsWith('/admin') || 
                   pathname.includes('admin') ||
                   pathname.includes('profile') || 
                   pathname === '/change-password';
        break;

      case 'Police':
        // Police can access: /police/*, /fir/*, any profile, /change-password
        isAllowed = pathname.startsWith('/police') || 
                   pathname.includes('fir') ||
                   pathname.includes('profile') ||
                   pathname === '/change-password';
        break;

      case 'User':
        // User can access: /user/*, /fir/*, any profile, /change-password
        isAllowed = pathname.startsWith('/user') || 
                   pathname.includes('fir') || 
                   pathname.includes('profile') || 
                   pathname === '/change-password';
        break;

      default:
        isAllowed = false;
    }

    setIsAuthorized(isAllowed);
    setLoading(false);
  }, [location.pathname]);

  if (loading) return <div className="text-center py-5">Loading...</div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthorized) {
    // Redirect to the user's own dashboard instead of login
    const dashboardMap = {
      Admin: '/admin/dashboard',
      Police: '/police/dashboard',
      User: '/user/dashboard'
    };
    const redirectTo = dashboardMap[userRole] || '/login';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default PrivateRoute;
