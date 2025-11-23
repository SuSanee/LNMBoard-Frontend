import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Get token from localStorage (supports both admin and super-admin)
const getToken = () => {
  return localStorage.getItem("adminToken") || localStorage.getItem("superAdminToken");
};

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api/events`,
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

// Event API functions
export const eventAPI = {
  // Get all events (public)
  getAllEvents: async () => {
    const response = await api.get("/");
    return response.data;
  },

  // Get logged-in admin's events
  getMyEvents: async () => {
    const response = await api.get("/my-events");
    return response.data;
  },

  // Create new event
  createEvent: async (eventData) => {
    const response = await api.post("/", eventData);
    return response.data;
  },

  // Update event
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/${id}`, eventData);
    return response.data;
  },

  // Delete event
  deleteEvent: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },

  // Add comment to event (public, no auth)
  addComment: async (id, text) => {
    const response = await axios.post(`${API_URL}/api/events/${id}/comment`, {
      text,
    });
    return response.data;
  },
};
