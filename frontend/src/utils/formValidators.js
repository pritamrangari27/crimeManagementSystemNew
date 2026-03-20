/**
 * Form Validation Utilities
 * Centralized validation logic to avoid duplication across components
 */

/**
 * Validate password format
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, message?: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true };
};

/**
 * Validate password change form
 * @param {object} formData - { currentOrOld: string, newPassword: string, confirmPassword: string }
 * @returns {object} - { valid: boolean, message?: string }
 */
export const validatePasswordChange = (formData) => {
  const { oldPassword, currentPassword, newPassword, confirmPassword } = formData;
  const current = oldPassword || currentPassword;

  if (!current) {
    return { valid: false, message: 'Current password is required' };
  }

  if (!newPassword) {
    return { valid: false, message: 'New password is required' };
  }

  const passValidation = validatePassword(newPassword);
  if (!passValidation.valid) {
    return passValidation;
  }

  if (newPassword !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match' };
  }

  if (current === newPassword) {
    return { valid: false, message: 'New password must be different from current password' };
  }

  return { valid: true };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {object} - { valid: boolean, message?: string }
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { valid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }

  return { valid: true };
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {object} - { valid: boolean, message?: string }
 */
export const validateUsername = (username) => {
  if (!username || !username.trim()) {
    return { valid: false, message: 'Username is required' };
  }

  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters' };
  }

  return { valid: true };
};

/**
 * Validate profile update form
 * @param {object} formData - { username: string, email: string }
 * @returns {object} - { valid: boolean, message?: string }
 */
export const validateProfileForm = (formData) => {
  const { username, email } = formData;

  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    return usernameValidation;
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return emailValidation;
  }

  return { valid: true };
};

export default {
  validatePassword,
  validatePasswordChange,
  validateEmail,
  validateUsername,
  validateProfileForm
};
