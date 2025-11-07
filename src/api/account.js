import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get token from localStorage
const getToken = () => localStorage.getItem('superAdminToken');

const api = axios.create({
  baseURL: `${API_URL}/api/account`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const accountAPI = {
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    const response = await api.post('/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};

