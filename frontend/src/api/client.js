import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add token to request headers if it exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('[Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('[Response Error]', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      code: error.code
    });

    // Handle 401 Unauthorized - session expired or not authenticated
    if (error.response?.status === 401) {
      console.warn('[Auth Error] Session expired or invalid. Clearing auth data and redirecting to login.');
      // Clear all auth data from localStorage
      localStorage.removeItem('authUser');
      localStorage.removeItem('userRole');
      localStorage.removeItem('token');
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password, role) =>
    api.post('/auth/login', { username, password, role }),
  register: (username, password, email, phone, role, station_id = null) =>
    api.post('/auth/register', { username, password, email, phone, role, station_id }),
  userRegister: (username, password, email, phone = '') =>
    api.post('/auth/register', { username, password, email, phone, role: 'User' }),
  policeRegister: (username, password, email, phone, station_id) =>
    api.post('/auth/register', { username, password, email, phone, role: 'Police', station_id }),
  logout: () => api.post('/auth/logout'),
  currentUser: () => api.get('/auth/current-user'),
  changePassword: (oldPassword, newPassword) =>
    api.post('/auth/change-password', { oldPassword, newPassword })
};

// Criminals API
export const criminalsAPI = {
  getAll: () => api.get('/criminals/all'),
  getById: (id) => api.get(`/criminals/${id}`),
  add: (data) => api.post('/criminals/add', data),
  update: (id, data) => api.put(`/criminals/${id}`, data),
  delete: (id) => api.delete(`/criminals/${id}`),
  search: (query) => api.get(`/criminals/search/query?query=${query}`)
};

// FIRs API
export const firsAPI = {
  getAll: () => api.get('/firs/all'),
  getById: (id) => api.get(`/firs/${id}`),
  getByUser: (userId) => api.get(`/firs/user/${userId}`),
  getByStatus: (status) => api.get(`/firs/status/${status}`),
  create: (data) => api.post('/firs/create', data),
  approve: (id, assigned_officer_id) =>
    api.put(`/firs/${id}/approve`, { assigned_officer_id }),
  reject: (id, rejection_reason) =>
    api.put(`/firs/${id}/reject`, { rejection_reason })
};

// Police API
export const policeAPI = {
  getAll: () => api.get('/police/all'),
  getById: (id) => api.get(`/police/${id}`),
  getByStation: (stationId) => api.get(`/police/station/${stationId}`),
  add: (data) => api.post('/police/add', data),
  update: (id, data) => api.put(`/police/${id}`, data),
  delete: (id) => api.delete(`/police/${id}`)
};

// Stations API
export const stationsAPI = {
  getAll: () => api.get('/stations/all'),
  getById: (id) => api.get(`/stations/${id}`),
  getDetails: (id) => api.get(`/stations/${id}/details`),
  add: (data) => api.post('/stations/add', data),
  update: (id, data) => api.put(`/stations/${id}`, data),
  delete: (id) => api.delete(`/stations/${id}`)
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getCrimesByType: () => api.get('/dashboard/crimes-by-type'),
  getFIRStatus: () => api.get('/dashboard/fir-status'),
  getCrimesByLocation: () => api.get('/dashboard/crimes-by-location'),
  getActivity: (limit = 10) => api.get(`/dashboard/activity?limit=${limit}`)
};

export default api;
