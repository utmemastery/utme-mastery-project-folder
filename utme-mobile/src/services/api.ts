// mobile/src/services/api.ts (Enhanced with interceptors)
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const API_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // Development
  : 'https://your-production-api.com/api';  // Production

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Token expired, clear storage and redirect to login
      try {
        await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
        
        // Navigate to login screen
        // This would typically be handled by your navigation system
        Alert.alert(
          'Session Expired',
          'Please log in again to continue.',
          [{ text: 'OK' }]
        );
      } catch (clearError) {
        console.error('Error clearing auth data:', clearError);
      }
    }

    // Handle network errors
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