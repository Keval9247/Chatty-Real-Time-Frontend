import axios from "axios";
const token = localStorage.getItem('token');

// Check if VITE_API_BASE_URL is defined, and use it for production, otherwise fallback to a default backend URL
export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
        ? `${import.meta.env.VITE_API_BASE_URL}/api`  // Use the provided API base URL
        : "https://api-chatty.onrender.com/api",    // Fallback to the default backend URL
    headers: {
        Authorization: `Bearer ${token}`,
    },
    timeout: 15000,
    validateStatus: (status) => status >= 200 && status < 300,
    withCredentials: true,
});
