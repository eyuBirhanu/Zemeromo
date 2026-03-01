import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// 1. Define Environments
const DEV_URL = 'http://10.47.142.177:5000/api'; // Laptop IP
const PROD_URL = 'https://zemeromo-api.onrender.com/api'; // Your Real Backend

// __DEV__ is a special variable that is TRUE when you run 'npx expo start'
// and FALSE when you build the APK.
const BASE_URL = __DEV__ ? DEV_URL : PROD_URL;

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // Increased to 15s for slower mobile networks
});

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

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Optional: Add logic here to redirect to login if 401
        return Promise.reject(error);
    }
);

export default api;