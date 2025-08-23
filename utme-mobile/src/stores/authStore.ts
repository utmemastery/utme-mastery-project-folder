import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as Sentry from "@sentry/react-native";
import { AuthService, User, RegisterData } from "../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { useProfileStore } from "./profileStore";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;

  setOnboardingDone: (done: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = await AuthService.login({ email, password });
          set({ user, isAuthenticated: true, isLoading: false });
          await useProfileStore.getState().fetchProfile();
        } catch (error: any) {
          Sentry.captureException(error);
          set({ error: error.message || "Login failed", isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const user = await AuthService.register(data);
          set({ user, isAuthenticated: true, isLoading: false });
          await useProfileStore.getState().fetchProfile();
        } catch (error: any) {
          Sentry.captureException(error);
          set({ error: error.message || "Registration failed", isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await AuthService.logout();
          set({ user: null, isAuthenticated: false, isLoading: false });
          useProfileStore.getState().deleteAccount();
        } catch (error: any) {
          Sentry.captureException(error);
          set({ error: error.message || "Logout failed", isLoading: false });
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
            await useProfileStore.getState().fetchProfile();
          } else {
            set({ isLoading: false });
          }
        } catch (error: any) {
          Sentry.captureException(error);
          set({ error: error.message || "Verification failed", isLoading: false });
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
          set({
            error:
              error.message || "Failed to send password reset instructions",
            isLoading: false,
          });
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
          set({
            error: error.message || "Password reset failed",
            isLoading: false,
          });
          throw error;
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put("/user/profile", data);
          const currentUser = get().user;
          const updatedUser = {
            ...currentUser,
            ...response.data.user,
            onboardingDone:
              data.onboardingDone ??
              response.data.user.onboardingDone ??
              currentUser?.onboardingDone ??
              false,
            selectedSubjects:
              data.selectedSubjects ??
              response.data.user.selectedSubjects ??
              currentUser?.selectedSubjects,
            aspiringCourse:
              data.aspiringCourse ??
              response.data.user.aspiringCourse ??
              currentUser?.aspiringCourse,
            goalScore:
              data.goalScore ??
              response.data.user.goalScore ??
              currentUser?.goalScore,
            learningStyle:
              data.learningStyle ??
              response.data.user.learningStyle ??
              currentUser?.learningStyle,
            diagnosticResults:
              data.diagnosticResults ??
              response.data.user.diagnosticResults ??
              currentUser?.diagnosticResults,
          };
          set({ user: updatedUser, isLoading: false });
          console.log("Updated user state:", updatedUser);
          await useProfileStore.getState().fetchProfile();
        } catch (error: any) {
          Sentry.captureException(error);
          set({
            error: error.message || "Profile update failed",
            isLoading: false,
          });
          throw error;
        }
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        try {
          const isAuth = await AuthService.isAuthenticated();
          const user = await AuthService.getCurrentUser();
          if (isAuth && user) {
            set({ isAuthenticated: true, user, isLoading: false });
            await useProfileStore.getState().fetchProfile();
          } else {
            set({ isAuthenticated: false, user: null, isLoading: false });
          }
        } catch (error: any) {
          Sentry.captureException(error);
          set({ isAuthenticated: false, user: null, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),

      setOnboardingDone: async (done: boolean) => {
        const { user } = get();
        if (!user) return;

        // Optimistic local update (persists immediately)
        const prevUser = user;
        set({ user: { ...user, onboardingDone: done } });

        try {
          await get().updateProfile({ onboardingDone: done });
        } catch (error) {
          // Revert if server update fails
          set({ user: prevUser });
          Sentry.captureException(error);
          throw error;
        }
      },
    }),
    {
      name: "auth-storage", // key in AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user, // persists onboardingDone inside user
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
