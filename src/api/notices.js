import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Get token from localStorage (supports both admin and super-admin)
const getToken = () => {
  return localStorage.getItem("adminToken") || localStorage.getItem("superAdminToken");
};

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api/notices`,
  headers: {
    "Content-Type": "application/json",
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

// Notice API functions
export const noticeAPI = {
  // Get all notices (public)
  getAllNotices: async () => {
    const response = await api.get("/");
    return response.data;
  },

  // Get logged-in admin's notices
  getMyNotices: async () => {
    const response = await api.get("/my-notices");
    return response.data;
  },

  // Create new notice
  createNotice: async (noticeData) => {
    const response = await api.post("/", noticeData);
    return response.data;
  },

  // Update notice
  updateNotice: async (id, noticeData) => {
    const response = await api.put(`/${id}`, noticeData);
    return response.data;
  },

  // Delete notice
  deleteNotice: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },
};
