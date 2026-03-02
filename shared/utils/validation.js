/**
 * Shared Validation Utilities
 * Works on both web and mobile
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return {
      valid: false,
      message: 'Password must be at least 6 characters long',
    };
  }
  
  return {
    valid: true,
    message: 'Password is valid',
  };
};

/**
 * Validate name
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid
 */
export const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

/**
 * Validate employee ID
 * @param {string} employeeId - Employee ID to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmployeeId = (employeeId) => {
  return employeeId && employeeId.trim().length >= 3;
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validateImageFile = (file) => {
  if (!file) {
    return {
      valid: false,
      message: 'No file selected',
    };
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      message: 'Only JPEG and PNG images are allowed',
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      message: 'Image size must be less than 5MB',
    };
  }

  return {
    valid: true,
    message: 'Image is valid',
  };
};

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} date - Date string to validate
 * @returns {boolean} - True if valid
 */
export const isValidDate = (date) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

export default {
  isValidEmail,
  validatePassword,
  isValidName,
  isValidEmployeeId,
  validateImageFile,
  isValidDate,
};
