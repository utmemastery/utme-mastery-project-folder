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
  studyReminders?: boolean;
  examYear?: string;
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

  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  updateProfileImage: (imageUri: string) => Promise<void>;
  fetchProfileStats: () => Promise<void>;
  updateSubjects: (subjects: string[]) => Promise<void>;
  updateGoalScore: (score: number) => Promise<void>;
  updateStudyPreferences: (preferences: { 
    preferredStudyTime?: string;
    studyReminders?: boolean;
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
      
      const response = await api.get('/user/profile');
      const profileData = {
        ...response.data.profile,
        phone: response.data.profile.phoneNumber,
        profileImage: response.data.profile.avatarUrl,
        dateOfBirth: response.data.profile.dateOfBirth ? new Date(response.data.profile.dateOfBirth).toISOString() : undefined,
        preferredStudyTime: response.data.profile.preferredStudyTime ? new Date(response.data.profile.preferredStudyTime).toISOString() : undefined
      };
      
      set({ 
        profile: profileData,
        isLoading: false 
      });

      await AsyncStorage.setItem('cached_profile', JSON.stringify(profileData));
      
    } catch (error: any) {
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
        error: error.response?.data?.error || 'Failed to fetch profile',
        isLoading: false 
      });
    }
  },

  updateProfile: async (data: Partial<ProfileData>) => {
    try {
      set({ isLoading: true, error: null });
      
      const updateData = {
        ...data,
        phoneNumber: data.phone,
        avatarUrl: data.profileImage
      };
      
      const response = await api.put('/user/profile', updateData);
      const updatedProfile = {
        ...response.data.profile,
        phone: response.data.profile.phoneNumber,
        profileImage: response.data.profile.avatarUrl,
        dateOfBirth: response.data.profile.dateOfBirth ? new Date(response.data.profile.dateOfBirth).toISOString() : undefined,
        preferredStudyTime: response.data.profile.preferredStudyTime ? new Date(response.data.profile.preferredStudyTime).toISOString() : undefined
      };
      
      set({ 
        profile: updatedProfile,
        isLoading: false 
      });

      await AsyncStorage.setItem('cached_profile', JSON.stringify(updatedProfile));
      
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to update profile',
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
      
      const response = await api.post('/user/profile/image', formData, {
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
        error: error.response?.data?.error || 'Failed to update profile image',
        isLoading: false 
      });
      throw error;
    }
  },

  fetchProfileStats: async () => {
    try {
      const response = await api.get('/user/analytics');
      set({ stats: response.data.stats });
      
    } catch (error: any) {
      console.error('Failed to fetch profile stats:', error);
      // Don't set error for stats as it's not critical
    }
  },

  updateSubjects: async (subjects: string[]) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.put('/user/profile', { selectedSubjects: subjects });
      
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
        error: error.response?.data?.error || 'Failed to update subjects',
        isLoading: false 
      });
      throw error;
    }
  },

  updateGoalScore: async (score: number) => {
    try {
      set({ isLoading: true, error: null });
      
      await api.put('/user/goal', { goalScore: score });
      
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
        error: error.response?.data?.error || 'Failed to update goal score',
        isLoading: false 
      });
      throw error;
    }
  },

  updateStudyPreferences: async (preferences: { 
    preferredStudyTime?: string;
    studyReminders?: boolean;
  }) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.put('/user/profile', preferences);
      
      const currentProfile = get().profile;
      if (currentProfile) {
        const updatedProfile = {
          ...currentProfile,
          ...preferences,
          preferredStudyTime: preferences.preferredStudyTime ? new Date(preferences.preferredStudyTime).toISOString() : currentProfile.preferredStudyTime
        };
        
        set({ 
          profile: updatedProfile,
          isLoading: false 
        });

        await AsyncStorage.setItem('cached_profile', JSON.stringify(updatedProfile));
      }
      
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to update preferences',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteAccount: async () => {
    try {
      set({ isLoading: true, error: null });
      
      await api.delete('/user/profile');
      
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
        error: error.response?.data?.error || 'Failed to delete account',
        isLoading: false 
      });
      throw error;
    }
  },

  exportData: async () => {
    try {
      const response = await api.get('/user/profile/export');
      return response.data;
      
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to export data');
    }
  },

  clearError: () => set({ error: null })
}));