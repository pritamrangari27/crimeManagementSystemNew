import axios from 'axios';

// Dynamically determine API URL based on environment
let API_BASE_URL = process.env.REACT_APP_API_URL;

// If not set or invalid, determine based on hostname
if (!API_BASE_URL || API_BASE_URL === 'undefined') {
  if (typeof window !== 'undefined') {
    // Prefer localhost for development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      API_BASE_URL = 'http://localhost:5000/api';
    } else if (window.location.hostname.includes('vercel')) {
      // Use production API only for Vercel deployments
      API_BASE_URL = 'https://crime-management-api.onrender.com/api';
    } else {
      // Default to localhost for development
      API_BASE_URL = 'http://localhost:5000/api';
    }
  } else {
    API_BASE_URL = 'http://localhost:5000/api';
  }
}

console.log('[API Config] Using API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 60000, // 60s timeout - Render free tier cold starts can take 30-50s
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add token to request headers if it exists
    const token = localStorage.getItem('authToken');
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
      localStorage.removeItem('authToken');
      
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
  register: (data) =>
    api.post('/auth/register', data),
  userRegister: (username, password, email, phone = '') =>
    api.post('/auth/register', { username, password, email, phone, role: 'User' }),
  policeRegister: (username, password, email, phone, station_id) =>
    api.post('/auth/register', { username, password, email, phone, role: 'Police', station_id }),
  logout: () => api.post('/auth/logout'),
  currentUser: () => api.get('/auth/current-user'),
  changePassword: (oldPassword, newPassword) => {
    return api.post('/auth/change-password', { oldPassword, newPassword });
  },
  updateProfile: (data) => {
    return api.put('/auth/update-profile', data);
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
  getMyAssigned: () => api.get('/firs/my-assigned'),
  getById: (id) => api.get(`/firs/${id}`),
  getByUser: (userId) => api.get(`/firs/user/${userId}`),
  getByStatus: (status) => api.get(`/firs/status/${status}`),
  create: (data) => api.post('/firs', data),
  classify: (text) => api.post('/firs/classify', { text }),
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
  getCrimeLocations: () => api.get('/dashboard/crime-locations'),
  getCrimesByMonth: () => api.get('/dashboard/crimes-by-month'),
  getFIRsByMonth: () => api.get('/dashboard/firs-by-month'),
  getActivity: (limit = 10, filter = '') => api.get(`/dashboard/activity?limit=${limit}${filter ? `&filter=${filter}` : ''}`)
};

// Chatbot API
export const chatbotAPI = {
  send: (message) => api.post('/chatbot/message', { message }),
  quickReplies: () => api.get('/chatbot/quick-replies'),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Advanced Features API
export const advancedAPI = {
  // Workflow
  getWorkflowStages: () => api.get('/advanced/workflow/stages'),
  getWorkflowTimeline: (firId) => api.get(`/advanced/workflow/fir/${firId}`),
  advanceWorkflow: (firId) => api.put(`/advanced/workflow/fir/${firId}/advance`),
  setWorkflowStage: (firId, stage) => api.put(`/advanced/workflow/fir/${firId}/set`, { stage }),

  // Auto FIR number
  generateFIRNumber: (state, city) => api.get(`/advanced/generate-fir-number?state=${state || 'MH'}&city=${city || 'MUM'}`),

  // Resource allocation
  getWorkload: () => api.get('/advanced/allocation/workload'),
  autoAssign: (firId) => api.post(`/advanced/allocation/auto-assign/${firId}`),

  // Crime patterns
  getPatterns: () => api.get('/advanced/patterns'),

  // Similarity
  checkSimilarity: (description, crimeType) => api.post('/advanced/similarity/check', { description, crime_type: crimeType }),

  // Criminal network
  getNetworkGraph: () => api.get('/advanced/network/graph'),
  addNetworkLink: (data) => api.post('/advanced/network/link', data),
  deleteNetworkLink: (id) => api.delete(`/advanced/network/link/${id}`),

  // Export
  exportCSV: (type) => api.get(`/advanced/export/csv?type=${type || 'firs'}`, { responseType: 'blob' }),
  exportJSON: (type) => api.get(`/advanced/export/json?type=${type || 'firs'}`),
};

export default api;
