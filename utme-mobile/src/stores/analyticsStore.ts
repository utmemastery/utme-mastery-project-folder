// mobile/src/stores/analyticsStore.ts
import { create } from 'zustand';
import api from '../services/api';

interface UserAnalytics {
  overall: {
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    currentStreak: number;
  };
  subjectPerformance: Array<{
    subject: string;
    total_questions: number;
    correct_answers: number;
    avg_time_spent: number;
  }>;
  dailyTrends: Array<{
    date: string;
    questionsAnswered: number;
    correctAnswers: number;
    timeSpent: number;
  }>;
}

interface DailyStats {
  streak: number;
  time_spent: number;
}

interface WeakTopic {
  id: number;
  name: string;
  subject: string;
  progress: number;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
}

interface AnalyticsState {
  analytics: UserAnalytics | null;
  dailyStats: DailyStats[] | null;
  weakTopics: WeakTopic[] | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchUserAnalytics: () => Promise<void>;
  fetchWeakTopics: () => Promise<void>;
  clearError: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  analytics: null,
  dailyStats: null,
  weakTopics: null,
  isLoading: false,
  error: null,

  fetchUserAnalytics: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get('/user/analytics');
      set({ 
        analytics: response.data,
        dailyStats: response.data.dailyTrends,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch analytics', 
        isLoading: false 
      });
    }
  },

  fetchWeakTopics: async () => {
    try {
      const response = await api.get('/user/weak-topics');
      set({ weakTopics: response.data.weakTopics });
    } catch (error: any) {
      console.error('Failed to fetch weak topics:', error);
    }
  },

  clearError: () => set({ error: null })
}));