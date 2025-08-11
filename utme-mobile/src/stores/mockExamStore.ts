// mobile/src/stores/mockExamStore.ts
import { create } from 'zustand';
import api from '../services/api';

interface MockExamQuestion {
  id: number;
  question: string;
  options: string[];
  subject: string;
  difficulty: string;
  topic: string;
}

interface MockExam {
  id: string;
  type: 'full_utme' | 'subject_specific' | 'quick';
  subjects: string[];
  questions: MockExamQuestion[];
  timeLimit: number; // in minutes
  startTime: Date;
}

interface ExamAnswer {
  questionId: number;
  selectedAnswer: number;
  timeSpent: number;
}

interface MockExamState {
  currentExam: MockExam | null;
  currentQuestionIndex: number;
  answers: Record<number, ExamAnswer>;
  timeRemaining: number;
  mockExams: any[];
  recentScores: any[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMockExams: () => Promise<void>;
  startMockExam: (config: {
    type: string;
    subjects: string[];
    timeLimit: number;
    questionCount: number;
  }) => Promise<void>;
  submitAnswer: (questionId: number, selectedAnswer: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  endExam: () => Promise<void>;
  clearError: () => void;
}

export const useMockExamStore = create<MockExamState>((set, get) => ({
  currentExam: null,
  currentQuestionIndex: 0,
  answers: {},
  timeRemaining: 0,
  mockExams: [],
  recentScores: [],
  isLoading: false,
  error: null,

  fetchMockExams: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const [examsResponse, scoresResponse] = await Promise.all([
        api.get('/mock-exams'),
        api.get('/mock-exams/recent-scores')
      ]);
      
      set({ 
        mockExams: examsResponse.data.mockExams,
        recentScores: scoresResponse.data.scores,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch mock exams', 
        isLoading: false 
      });
    }
  },

  startMockExam: async (config) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/mock-exams/start', config);
      const exam = response.data.exam;
      
      // Start timer
      const timerInterval = setInterval(() => {
        set(state => {
          const newTime = state.timeRemaining - 1;
          if (newTime <= 0) {
            clearInterval(timerInterval);
            // Auto-submit exam when time runs out
            get().endExam();
            return { timeRemaining: 0 };
          }
          return { timeRemaining: newTime };
        });
      }, 1000);

      set({ 
        currentExam: exam,
        currentQuestionIndex: 0,
        answers: {},
        timeRemaining: config.timeLimit * 60, // Convert minutes to seconds
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to start mock exam', 
        isLoading: false 
      });
    }
  },

  submitAnswer: (questionId, selectedAnswer) => {
    const startTime = Date.now();
    set(state => ({
      answers: {
        ...state.answers,
        [questionId]: {
          questionId,
          selectedAnswer,
          timeSpent: Math.round((Date.now() - startTime) / 1000)
        }
      }
    }));
  },

  nextQuestion: () => {
    set(state => ({
      currentQuestionIndex: Math.min(
        state.currentQuestionIndex + 1,
        (state.currentExam?.questions.length || 1) - 1
      )
    }));
  },

  previousQuestion: () => {
    set(state => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0)
    }));
  },

  endExam: async () => {
    const state = get();
    if (!state.currentExam) return;

    try {
      await api.post('/mock-exams/submit', {
        examId: state.currentExam.id,
        answers: Object.values(state.answers),
        timeSpent: (state.currentExam.timeLimit * 60) - state.timeRemaining
      });

      // Reset exam state
      set({
        currentExam: null,
        currentQuestionIndex: 0,
        answers: {},
        timeRemaining: 0
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to submit exam' });
    }
  },

  clearError: () => set({ error: null })
}));