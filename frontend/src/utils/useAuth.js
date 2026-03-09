/**
 * Custom React Hook for Authentication
 * Centralized auth state management for all components
 * Usage: const { user, role, isAuthenticated } = useAuth();
 */

import { useState, useEffect } from 'react';
import { getAuthUser, getUserRole, getCurrentUser } from './authService';

export const useAuth = () => {
  const [auth, setAuth] = useState({
    user: null,
    role: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    const loadAuth = () => {
      try {
        const user = getCurrentUser();
        const role = getUserRole();
        
        setAuth({
          user,
          role,
          isAuthenticated: !!user && !!role,
          loading: false
        });
      } catch (error) {
        console.error('Error loading auth:', error);
        setAuth({ user: null, role: null, isAuthenticated: false, loading: false });
      }
    };

    loadAuth();
  }, []);

  /**
   * Check if user has specific role
   */
  const hasRole = (roleName) => {
    return auth.role === roleName;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles) => {
    return roles.includes(auth.role);
  };

  /**
   * Check if user is admin
   */
  const isAdmin = () => auth.role === 'Admin';

  /**
   * Check if user is police officer
   */
  const isPolice = () => auth.role === 'Police';

  /**
   * Check if user is regular user
   */
  const isUser = () => auth.role === 'User';

  return {
    user: auth.user,
    role: auth.role,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    hasRole,
    hasAnyRole,
    isAdmin,
    isPolice,
    isUser
  };
};

export default useAuth;
