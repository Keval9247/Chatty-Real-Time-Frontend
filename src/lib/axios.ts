import axios from "axios";
const token = localStorage.getItem('token');

export const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}` + "/api",
    headers: {
        Authorization: `Bearer ${token}`,
    },
    timeout: 5000,
    validateStatus: (status) => status >= 200 && status < 300,
    withCredentials: true,
})