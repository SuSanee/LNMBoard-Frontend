import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Get token from localStorage (supports both admin and super-admin)
const getToken = () => {
  return localStorage.getItem("adminToken") || localStorage.getItem("superAdminToken");
};

// Gemini API functions
export const geminiAPI = {
  // Generate description for event or notice
  generateDescription: async (type, title, additionalInfo = {}, existingDescription = "") => {
    const token = getToken();

    if (!token) {
      throw new Error("Not authenticated. Please log in again.");
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/gemini/generate-description`,
        {
          type,
          title,
          additionalInfo,
          existingDescription,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Session expired. Please log in again.");
      }
      throw error;
    }
  },
};

