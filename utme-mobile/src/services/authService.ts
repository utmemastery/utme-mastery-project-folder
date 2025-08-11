// mobile/src/services/authService.ts
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export class AuthService {
  static async login(data: LoginData): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/login', data);
    const { user, token } = response.data;
    
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return { user, token };
  }

  static async register(data: RegisterData): Promise<User> {
    const response = await api.post('/auth/register', data);
    return response.data.user;
  }

  static async verifyEmail(email: string, code: string): Promise<void> {
    await api.post('/auth/verify-email', { email, code });
  }

  static async resendVerificationCode(email: string): Promise<void> {
    await api.post('/auth/resend-verification', { email });
  }

  static async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  static async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  }

  static async logout(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userString = await AsyncStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch {
      return null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  }
}