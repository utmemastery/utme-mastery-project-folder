// mobile/src/services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { API_URL } from '@env';

// Create Axios instance
const api = axios.create({
  baseURL: API_URL, // from .env
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor → Add Bearer token from SecureStore
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor → Handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear sensitive data
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('userData');

        // Notify user
        Alert.alert(
          'Session Expired',
          'Please log in again to continue.',
          [{ text: 'OK' }]
        );

        // Optionally: trigger navigation to Login screen
        // You'll need to integrate with your app's navigation system
      } catch (clearError) {
        console.error('Error clearing auth data:', clearError);
      }
    }

    // Handle network errors (no response from server)
    if (!error.response) {
      Alert.alert(
        'Network Error',
        'Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    }

    return Promise.reject(error);
  }
);

export default api;
