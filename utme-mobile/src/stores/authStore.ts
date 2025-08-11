import { create } from 'zustand';
import { AuthService, User } from '../services/authService';
import api from '../services/api'; // assuming you have this for profile update

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
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
      set({ error: error.response?.data?.error || 'Login failed', isLoading: false });
      throw error;
    }
  },

  register: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const user = await AuthService.register(data);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Registration failed', isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Logout failed', isLoading: false });
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
      set({ error: error.response?.data?.error || 'Verification failed', isLoading: false });
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.forgotPassword(email);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to send password reset instructions', isLoading: false });
      throw error;
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/user/profile', data);
      set({ user: response.data.user, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Profile update failed', isLoading: false });
      throw error;
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const isAuth = await AuthService.isAuthenticated();
      const user = await AuthService.getCurrentUser();
      set({ isAuthenticated: isAuth, user, isLoading: false });
    } catch {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));