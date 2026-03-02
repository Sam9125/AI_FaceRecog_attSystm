/**
 * Shared Constants
 * Used across web and mobile platforms
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  TIMEOUT: 30000, // 30 seconds
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  OFFLINE_ATTENDANCE: 'offline_attendance',
  DEVICE_TOKEN: 'device_token',
};

// Face Detection Configuration
export const FACE_DETECTION_CONFIG = {
  AUTO_CAPTURE_DELAY: 3000, // 3 seconds
  PROGRESS_DURATION: 3, // 3 seconds
  MIN_CONFIDENCE: 0.5, // 50% minimum confidence
  MODEL_URLS: [
    '/models', // Local models first
    'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model',
    'https://justadudewhohacks.github.io/face-api.js/models'
  ],
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

// Error Messages
export const ERROR_MESSAGES = {
  NO_FACE_DETECTED: 'No face detected in the image',
  FACE_MISMATCH: 'Face does not match registered user',
  ALREADY_MARKED: 'Attendance already marked for today',
  NETWORK_ERROR: 'Network error. Please check your connection',
  CAMERA_PERMISSION: 'Camera permission denied',
  MODELS_LOAD_FAILED: 'Failed to load face detection models',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ATTENDANCE_MARKED: 'Attendance marked successfully!',
  FACE_REGISTERED: 'Face registered successfully!',
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
};

export default {
  API_CONFIG,
  STORAGE_KEYS,
  FACE_DETECTION_CONFIG,
  ATTENDANCE_STATUS,
  USER_ROLES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
