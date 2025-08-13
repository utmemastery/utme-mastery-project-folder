// mobile/src/stores/profileStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  selectedSubjects: string[];
  goalScore: number;
  preferredStudyTime?: string;
  studyReminders: boolean;
  examYear: string;
  profileImage?: string;
  state?: string;
  school?: string;
}

interface ProfileStats {
  totalQuestions: number;
  correctAnswers: number;
  studyStreak: number;
  totalStudyTime: number;
  averageScore: number;
  strongestSubject: string;
  weakestSubject: string;
  lastActiveDate: string;
}

interface ProfileStore {
  profile: ProfileData | null;
  stats: ProfileStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  updateProfileImage: (imageUri: string) => Promise<void>;
  fetchProfileStats: () => Promise<void>;
  updateSubjects: (subjects: string[]) => Promise<void>;
  updateGoalScore: (score: number) => Promise<void>;
  updateStudyPreferences: (preferences: { 
    preferredStudyTime?: string;
    studyReminders: boolean;
  }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  exportData: () => Promise<any>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  stats: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get('/profile');
      const profileData = response.data.profile;
      
      set({ 
        profile: profileData,
        isLoading: false 
      });

      // Cache profile data locally
      await AsyncStorage.setItem('cached_profile', JSON.stringify(profileData));
      
    } catch (error: any) {
      // Try to load cached data if API fails
      try {
        const cachedProfile = await AsyncStorage.getItem('cached_profile');
        if (cachedProfile) {
          set({ 
            profile: JSON.parse(cachedProfile),
            error: 'Using offline data. Please check your connection.',
            isLoading: false
          });
          return;
        }
      } catch (cacheError) {
        // Ignore cache errors
      }

      set({ 
        error: error.response?.data?.message || 'Failed to fetch profile',
        isLoading: false 
      });
    }
  },

  updateProfile: async (data: Partial<ProfileData>) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.put('/profile', data);
      const updatedProfile = response.data.profile;
      
      set({ 
        profile: updatedProfile,
        isLoading: false 
      });

      // Update cached data
      await AsyncStorage.setItem('cached_profile', JSON.stringify(updatedProfile));
      
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to update profile',
        isLoading: false 
      });
      throw error;
    }
  },

  updateProfileImage: async (imageUri: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);
      
      const response = await api.post('/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const currentProfile = get().profile;
      if (currentProfile) {
        const updatedProfile = {
          ...currentProfile,
          profileImage: response.data.imageUrl
        };
        
        set({ 
          profile: updatedProfile,
          isLoading: false 
        });

        await AsyncStorage.setItem('cached_profile', JSON.stringify(updatedProfile));
      }
      
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to update profile image',
        isLoading: false 
      });
      throw error;
    }
  },

  fetchProfileStats: async () => {
    try {
      const response = await api.get('/profile/stats');
      set({ stats: response.data.stats });
      
    } catch (error: any) {
      console.error('Failed to fetch profile stats:', error);
      // Don't set error for stats as it's not critical
    }
  },

  updateSubjects: async (subjects: string[]) => {
    try {
      set({ isLoading: true, error: null });
      
      await api.put('/profile/subjects', { selectedSubjects: subjects });
      
      const currentProfile = get().profile;
      if (currentProfile) {
        const updatedProfile = {
          ...currentProfile,
          selectedSubjects: subjects
        };
        
        set({ 
          profile: updatedProfile,
          isLoading: false 
        });

        await AsyncStorage.setItem('cached_profile', JSON.stringify(updatedProfile));
      }
      
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to update subjects',
        isLoading: false 
      });
      throw error;
    }
  },

  updateGoalScore: async (score: number) => {
    try {
      set({ isLoading: true, error: null });
      
      await api.put('/profile/goal', { goalScore: score });
      
      const currentProfile = get().profile;
      if (currentProfile) {
        const updatedProfile = {
          ...currentProfile,
          goalScore: score
        };
        
        set({ 
          profile: updatedProfile,
          isLoading: false 
        });

        await AsyncStorage.setItem('cached_profile', JSON.stringify(updatedProfile));
      }
      
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to update goal score',
        isLoading: false 
      });
      throw error;
    }
  },

  updateStudyPreferences: async (preferences: { 
    preferredStudyTime?: string;
    studyReminders: boolean;
  }) => {
    try {
      set({ isLoading: true, error: null });
      
      await api.put('/profile/preferences', preferences);
      
      const currentProfile = get().profile;
      if (currentProfile) {
        const updatedProfile = {
          ...currentProfile,
          ...preferences
        };
        
        set({ 
          profile: updatedProfile,
          isLoading: false 
        });

        await AsyncStorage.setItem('cached_profile', JSON.stringify(updatedProfile));
      }
      
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to update preferences',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteAccount: async () => {
    try {
      set({ isLoading: true, error: null });
      
      await api.delete('/profile');
      
      // Clear all stored data
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'cached_profile',
        'user_data'
      ]);
      
      set({ 
        profile: null,
        stats: null,
        isLoading: false 
      });
      
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete account',
        isLoading: false 
      });
      throw error;
    }
  },

  exportData: async () => {
    try {
      const response = await api.get('/profile/export');
      return response.data;
      
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export data');
    }
  },

  clearError: () => set({ error: null })
}));