import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    return api.post('/api/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getCurrentUser: () => api.get('/api/auth/me'),
  getAllUsers: () => api.get('/api/auth/users'),
};

// Face Registration API
export const faceAPI = {
  registerFace: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/face/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  registerMultipleFaces: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return api.post('/api/face/register-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Attendance API
export const attendanceAPI = {
  markAttendance: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/attendance/mark', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  markMultipleAttendance: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/attendance/mark-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getTodayAttendance: () => api.get('/api/attendance/today'),
  getAttendanceByDate: (date) => api.get(`/api/attendance/date/${date}`),
  getMyAttendance: (startDate, endDate) => {
    let url = '/api/attendance/my-attendance';
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    return api.get(url);
  },
  getMyStats: (days = 30) => api.get(`/api/attendance/stats?days=${days}`),
  getDailyReport: (date) => api.get(`/api/attendance/report/daily/${date}`),
};

export default api;
