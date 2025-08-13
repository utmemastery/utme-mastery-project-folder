import { create } from 'zustand';
import * as Sentry from '@sentry/react-native';
import { AuthService, User, RegisterData } from '../services/authService';
import api from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await AuthService.login({ email, password });
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      Sentry.captureException(error);
      set({ error: error.message || 'Login failed', isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const user = await AuthService.register(data);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      Sentry.captureException(error);
      set({ error: error.message || 'Registration failed', isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: any) {
      Sentry.captureException(error);
      set({ error: error.message || 'Logout failed', isLoading: false });
      throw error;
    }
  },

  verifyEmail: async (email: string, code: string) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.verifyEmail(email, code);
      if (get().user) {
        set({
          user: { ...get().user!, emailVerified: true },
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      Sentry.captureException(error);
      set({ error: error.message || 'Verification failed', isLoading: false });
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.forgotPassword(email);
      set({ isLoading: false });
    } catch (error: any) {
      Sentry.captureException(error);
      set({ error: error.message || 'Failed to send password reset instructions', isLoading: false });
      throw error;
    }
  },

  resetPassword: async (token: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.resetPassword(token, password);
      set({ isLoading: false });
    } catch (error: any) {
      Sentry.captureException(error);
      set({ error: error.message || 'Password reset failed', isLoading: false });
      throw error;
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/user/profile', data);
      set({ user: response.data.user, isLoading: false });
    } catch (error: any) {
      Sentry.captureException(error);
      set({ error: error.message || 'Profile update failed', isLoading: false });
      throw error;
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const isAuth = await AuthService.isAuthenticated();
      const user = await AuthService.getCurrentUser();
      set({ isAuthenticated: isAuth, user, isLoading: false });
    } catch (error: any) {
      Sentry.captureException(error);
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));