import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// INTERCEPTOR: Automatically adds the Token to every request
api.interceptors.request.use(
    (config) => {
        // 1. Get token from Cookie
        const token = Cookies.get("token");

        // 2. If token exists, add it to Headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;