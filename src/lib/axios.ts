import axios from "axios";
const token = localStorage.getItem('token');

export const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}` ? "/api" : "https://chatty-4q79.onrender.com/api",
    headers: {
        Authorization: `Bearer ${token}`,
    },
    timeout: 15000,
    validateStatus: (status) => status >= 200 && status < 300,
    withCredentials: true,
})