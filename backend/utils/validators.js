/**
 * Input Validation Utilities
 * Centralized validation logic for backend routes
 * For production-ready authentication and data validation
 */

/**
 * Validate username format
 * Requirements: 3-50 characters, alphanumeric with dash and underscore
 */
const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { valid: false, message: 'Username is required' };
  }
  if (username.length < 3 || username.length > 50) {
    return { valid: false, message: 'Username must be 3-50 characters' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, dash, and underscore' };
  }
  return { valid: true };
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email address' };
  }
  return { valid: true };
};

/**
 * Validate password strength
 * Requirements: Minimum 6 characters
 * Production: Consider adding more complexity requirements
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true };
};

/**
 * Validate phone number (optional field)
 */
const validatePhone = (phone) => {
  if (!phone) {
    return { valid: true }; // Optional field
  }
  if (typeof phone !== 'string') {
    return { valid: false, message: 'Phone must be a string' };
  }
  if (!/^\d{10,}$/.test(phone.replace(/[-\s()]/g, ''))) {
    return { valid: false, message: 'Phone number must be at least 10 digits' };
  }
  return { valid: true };
};

/**
 * Validate string is not empty
 */
const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true };
};

/**
 * Validate ID is number
 */
const validateId = (id) => {
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    return { valid: false, message: 'Invalid ID' };
  }
  return { valid: true };
};

/**
 * Validate role is valid
 */
const validateRole = (role) => {
  const validRoles = ['Admin', 'Police', 'User'];
  if (!validRoles.includes(role)) {
    return { valid: false, message: 'Invalid role selected' };
  }
  return { valid: true };
};

module.exports = {
  validateUsername,
  validateEmail,
  validatePassword,
  validatePhone,
  validateRequired,
  validateId,
  validateRole
};
