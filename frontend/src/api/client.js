import axios from 'axios';

// Dynamically determine API URL based on environment
let API_BASE_URL = process.env.REACT_APP_API_URL;

// If not set, use production URL if on Vercel, else localhost
if (!API_BASE_URL) {
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel')) {
    API_BASE_URL = 'https://crime-management-api.onrender.com/api';
  } else {
    API_BASE_URL = 'http://localhost:5000/api';
  }
}

console.log('[API Config] Using API URL:', API_BASE_URL);

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
      // Don't redirect for change-password (wrong current password is a valid 401)
      const url = error.config?.url || '';
      if (url.includes('change-password')) {
        return Promise.reject(error);
      }

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
  changePassword: (oldPassword, newPassword) => {
    const user = JSON.parse(localStorage.getItem('authUser'));
    return api.post('/auth/change-password', { oldPassword, newPassword, user_id: user?.id });
  },
  updateProfile: (data) => {
    const user = JSON.parse(localStorage.getItem('authUser'));
    return api.put('/auth/update-profile', { ...data, user_id: user?.id });
  }
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
  create: (data) => api.post('/firs', data),
  getByStation: (stationId) => api.get(`/firs/station/${stationId}`),
  search: (query) => api.get(`/firs/all`),
  update: (id, data) => api.put(`/firs/${id}`, data),
  approve: (id, assigned_officer_id) =>
    api.put(`/firs/${id}/approve`, { assigned_officer_id }),
  reject: (id, rejection_reason) =>
    api.put(`/firs/${id}/reject`, { rejection_reason }),
  delete: (id) => api.delete(`/firs/${id}`)
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
