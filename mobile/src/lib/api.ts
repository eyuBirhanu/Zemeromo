import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const LOCAL_IP = '192.168.42.244';
const PORT = '5000';

const BASE_URL = `http://${LOCAL_IP}:${PORT}/api`;

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// 1. Request Interceptor: Attach Token
api.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.log('Error loading token', error);
    }
    return config;
});

// 2. Response Interceptor: Handle Errors (Auto Logout)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('user');
            // Logic to redirect to login will be handled by AuthContext later
            console.log("Session expired. Please login again.");
        }
        return Promise.reject(error);
    }
);

export default api;