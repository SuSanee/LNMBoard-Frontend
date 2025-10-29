import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get token from localStorage
const getToken = () => localStorage.getItem('superAdminToken');

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api/super-admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Super Admin API functions
export const superAdminAPI = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('superAdminToken', response.data.token);
      localStorage.setItem('superAdmin', JSON.stringify(response.data.admin));
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdmin');
  },

  // Get current super admin from localStorage
  getCurrentAdmin: () => {
    const adminStr = localStorage.getItem('superAdmin');
    return adminStr ? JSON.parse(adminStr) : null;
  },

  // Check if logged in
  isAuthenticated: () => {
    return !!getToken();
  },

  // Get pending admin requests
  getAdminRequests: async () => {
    const response = await api.get('/admin-requests');
    return response.data;
  },

  // Approve admin
  approveAdmin: async (id) => {
    const response = await api.post(`/approve/${id}`);
    return response.data;
  },

  // Reject admin
  rejectAdmin: async (id) => {
    const response = await api.post(`/reject/${id}`);
    return response.data;
  },

  // Get all admins
  getAllAdmins: async () => {
    const response = await api.get('/admins');
    return response.data;
  },

  // Delete admin
  deleteAdmin: async (id) => {
    const response = await api.delete(`/admin/${id}`);
    return response.data;
  },

  // Create admin
  createAdmin: async (name, email, password) => {
    const response = await api.post('/create-admin', { name, email, password });
    return response.data;
  },

  // Register admin (public - no auth required)
  registerAdmin: async (name, email, password) => {
    const response = await axios.post(`${API_URL}/api/super-admin/register`, { name, email, password });
    return response.data;
  },
};


