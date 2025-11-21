import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Get token from localStorage
const getToken = () => localStorage.getItem("superAdminToken");

// Upload API functions
export const uploadAPI = {
  // Upload image to Cloudinary
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const token = getToken();

    if (!token) {
      throw new Error("Not authenticated. Please log in again.");
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/upload/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
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

  // Delete image from Cloudinary
  deleteImage: async (publicId) => {
    const token = getToken();
    const response = await axios.delete(`${API_URL}/api/upload/image`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: { publicId },
    });

    return response.data;
  },
};
