/**
 * Authentication Service
 * Centralized management of authentication state and localStorage
 * For production deployment on Vercel + Render
 */

const AUTH_KEYS = {
  USER: 'authUser',
  ROLE: 'userRole',
  TOKEN: 'authToken'
};

/**
 * Store user data in localStorage
 */
export const setAuthUser = (user, role, token = null) => {
  localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
  localStorage.setItem(AUTH_KEYS.ROLE, role);
  if (token) {
    localStorage.setItem(AUTH_KEYS.TOKEN, token);
  }
};

/**
 * Retrieve user data from localStorage
 */
export const getAuthUser = () => {
  try {
    const user = localStorage.getItem(AUTH_KEYS.USER);
    const role = localStorage.getItem(AUTH_KEYS.ROLE);
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    
    if (!user || !role) return null;
    
    return {
      user: JSON.parse(user),
      role,
      token
    };
  } catch (error) {
    console.error('Error retrieving auth data:', error);
    clearAuth();
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const auth = getAuthUser();
  return auth !== null;
};

/**
 * Get current user role
 */
export const getUserRole = () => {
  return localStorage.getItem(AUTH_KEYS.ROLE);
};

/**
 * Get current user info
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(AUTH_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Clear all authentication data
 */
export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEYS.USER);
  localStorage.removeItem(AUTH_KEYS.ROLE);
  localStorage.removeItem(AUTH_KEYS.TOKEN);
};

/**
 * Update user profile in auth storage
 */
export const updateAuthUser = (updates) => {
  try {
    const user = getCurrentUser();
    if (!user) return false;
    
    const updatedUser = { ...user, ...updates };
    const role = getUserRole();
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(updatedUser));
    return true;
  } catch (error) {
    console.error('Error updating auth user:', error);
    return false;
  }
};

/**
 * Check if user has specific role
 */
export const hasRole = (role) => {
  return getUserRole() === role;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (roles) => {
  return roles.includes(getUserRole());
};

export default {
  setAuthUser,
  getAuthUser,
  isAuthenticated,
  getUserRole,
  getCurrentUser,
  clearAuth,
  updateAuthUser,
  hasRole,
  hasAnyRole
};
