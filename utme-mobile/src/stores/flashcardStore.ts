// mobile/src/stores/flashcardStore.ts
import { create } from 'zustand';
import api from '../services/api';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  subject: string;
  topic: string;
  difficulty: string;
  tags: string[];
}

interface FlashcardState {
  flashcards: Flashcard[];
  currentCardIndex: number;
  reviewStats: any;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchFlashcardsForReview: () => Promise<void>;
  submitFlashcardAttempt: (attemptData: {
    flashcardId: number;
    response: 'again' | 'hard' | 'good' | 'easy';
    timeSpent: number;
  }) => Promise<void>;
  nextCard: () => void;
  resetReview: () => void;
  clearError: () => void;
}

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  flashcards: [],
  currentCardIndex: 0,
  reviewStats: null,
  isLoading: false,
  error: null,

  fetchFlashcardsForReview: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get('/flashcards/review');
      set({ 
        flashcards: response.data.flashcards,
        currentCardIndex: 0,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch flashcards', 
        isLoading: false 
      });
    }
  },

  submitFlashcardAttempt: async (attemptData) => {
    try {
      await api.post('/flashcards/attempt', attemptData);
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to submit attempt' });
    }
  },

  nextCard: () => {
    set(state => ({ 
      currentCardIndex: state.currentCardIndex + 1 
    }));
  },

  resetReview: () => {
    set({ currentCardIndex: 0 });
  },

  clearError: () => set({ error: null })
}));