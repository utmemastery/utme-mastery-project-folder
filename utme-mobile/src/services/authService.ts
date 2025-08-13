import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  phoneNumber: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber: string;
  selectedSubjects: string[];
  aspiringCourse?: string;
  goalScore?: number;
  learningStyle?: string;
  onboardingDone: boolean;
  emailVerified: boolean;
  role: string;
}

function handleApiError(error: any): string {
  if (error.response?.status === 429) {
    return 'Too many attempts. Please try again later.';
  }
  return error.response?.data?.error || error.message || 'An unexpected error occurred';
}

// Client-side validation helpers
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^\+234[0-9]{10}$/;
  return phoneRegex.test(phoneNumber);
};

const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

const isValidName = (name: string | undefined): boolean => {
  return !name || name.length >= 2;
};

const isValidCode = (code: string): boolean => {
  const codeRegex = /^\d{6}$/;
  return codeRegex.test(code);
};

export class AuthService {
  static async login(data: LoginData): Promise<{ user: User; token: string }> {
    const { email, password } = data;
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    if (!password) {
      throw new Error('Password is required');
    }

    try {
      const response = await api.post('/auth/login', data);
      const { user, token } = response.data;
      
      await SecureStore.setItemAsync('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  static async register(data: RegisterData): Promise<User> {
    const { email, phoneNumber, password, firstName, lastName } = data;
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    if (!isValidPhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format (use +234XXXXXXXXXX)');
    }
    if (!isValidPassword(password)) {
      throw new Error('Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, and one number');
    }
    if (!isValidName(firstName) || !isValidName(lastName)) {
      throw new Error('First name and last name must be at least 2 characters if provided');
    }

    try {
      const response = await api.post('/auth/register', data);
      return response.data.user;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  static async verifyEmail(email: string, code: string): Promise<void> {
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    if (!isValidCode(code)) {
      throw new Error('Verification code must be a 6-digit number');
    }

    try {
      await api.post('/auth/verify-email', { email, code });
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  static async resendVerificationCode(email: string): Promise<void> {
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    try {
      await api.post('/auth/resend-verification', { email });
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  static async forgotPassword(email: string): Promise<void> {
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  static async resetPassword(token: string, password: string): Promise<void> {
    if (!token) {
      throw new Error('Reset token is required');
    }
    if (!isValidPassword(password)) {
      throw new Error('Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, and one number');
    }

    try {
      await api.post('/auth/reset-password', { token, password });
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  static async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await AsyncStorage.removeItem('user');
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userString = await AsyncStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) return false;
      await api.get('/auth/validate-token', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch (error: any) {
      return false;
    }
  }
}