import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Get auth data from localStorage
    const authUser = localStorage.getItem('authUser');
    const userRole = localStorage.getItem('userRole');
    
    if (!authUser || !userRole) {
      setIsAuthenticated(false);
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);

    // Role-based access control
    const pathname = location.pathname;
    let isAllowed = false;

    switch (userRole) {
      case 'Admin':
        // Admin can access: /admin/*, /profile, /change-password
        isAllowed = pathname.startsWith('/admin/') || 
                   pathname === '/profile' || 
                   pathname === '/change-password';
        break;

      case 'Police':
        // Police can access: /police/*, /profile, /change-password
        isAllowed = pathname.startsWith('/police/') || 
                   pathname === '/police/profile' ||
                   pathname === '/change-password';
        break;

      case 'User':
        // User can access: /user/*, /fir/*, /profile, /change-password
        isAllowed = pathname.startsWith('/user/') || 
                   pathname.startsWith('/fir/') || 
                   pathname === '/profile' || 
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
    return <Navigate to="/login" />;
  }

  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
