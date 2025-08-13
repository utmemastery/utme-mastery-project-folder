import { create } from 'zustand';
import api from '../services/api';

export interface MockExamQuestion {
  id: number;
  question: string;
  options: string[];
  optionIds?: number[];
  subject: string;
  difficulty: string;
  topic: string | null;
}

export interface MockExam {
  id: number;
  type: 'FULL_UTME' | 'SUBJECT_SPECIFIC';
  subjects: string[];
  questions: MockExamQuestion[];
  timeLimit: number;
  startTime: Date;
}

export interface ExamAnswer {
  questionId: number;
  selectedOptionId: number;
  timeSpent: number;
}

export interface RecentScore {
  percentage: number;
  examType: 'FULL_UTME' | 'SUBJECT_SPECIFIC';
  subject?: string;
  correctAnswers: number;
  questionCount: number;
  completedAt: string;
}

export interface MockExamResult {
  examId: number;
  examType: 'FULL_UTME' | 'SUBJECT_SPECIFIC';
  subjects: string[];
  questionCount: number;
  correctAnswers: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
  subjectBreakdown: {
    [subject: string]: {
      total: number;
      correct: number;
      percentage: number;
    };
  };
  detailedResults: {
    questionId: number;
    question: string;
    options: string[];
    selectedAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
    subject: string;
    topic: string | null;
    explanation: string | null;
    responseTime: number;
  }[];
}

export interface MockExamHistory {
  exams: {
    id: number;
    examType: 'FULL_UTME' | 'SUBJECT_SPECIFIC';
    subjects: string[];
    questionCount: number;
    correctAnswers: number;
    percentage: number;
    timeSpent: number;
    completedAt: string;
  }[];
  total: number;
  page: number;
  limit: number;
}

interface MockExamState {
  currentExam: MockExam | null;
  incompleteExam: MockExam | null;
  currentQuestionIndex: number;
  answers: Record<number, ExamAnswer>;
  timeRemaining: number;
  mockExams: MockExam[];
  recentScores: RecentScore[];
  examResult: MockExamResult | null;
  examHistory: MockExamHistory | null;
  isLoading: boolean;
  error: string | null;
  timerInterval: NodeJS.Timeout | null;

  fetchMockExams: () => Promise<void>;
  startMockExam: (config: {
    type: 'FULL_UTME' | 'SUBJECT_SPECIFIC';
    subjects: string[];
    timeLimit: number;
    questionCount: number;
  }) => Promise<void>;
  resumeMockExam: (examId: number) => Promise<void>;
  submitAnswer: (questionId: number, selectedOptionId: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  endExam: () => Promise<void>;
  fetchExamResult: (examId: number) => Promise<void>;
  fetchExamHistory: (page: number, limit: number) => Promise<void>;
  clearError: () => void;
}

export const useMockExamStore = create<MockExamState>((set, get) => ({
  currentExam: null,
  incompleteExam: null,
  currentQuestionIndex: 0,
  answers: {},
  timeRemaining: 0,
  mockExams: [],
  recentScores: [],
  examResult: null,
  examHistory: null,
  isLoading: false,
  error: null,
  timerInterval: null,

  fetchMockExams: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const [examsResponse, scoresResponse, incompleteResponse] = await Promise.all([
        api.get('/mock-exams'),
        api.get('/mock-exams/recent-scores'),
        api.get('/mock-exams/resume/0')
      ]);
      
      set({ 
        mockExams: examsResponse.data.mockExams,
        recentScores: scoresResponse.data.scores,
        incompleteExam: incompleteResponse.data.exam || null,
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
      
      if (get().timerInterval) {
        clearInterval(get().timerInterval);
      }

      const newTimerInterval = setInterval(() => {
        set(state => {
          const newTime = state.timeRemaining - 1;
          if (newTime <= 0) {
            clearInterval(newTimerInterval);
            get().endExam();
            return { timeRemaining: 0, timerInterval: null };
          }
          return { timeRemaining: newTime };
        });
      }, 1000);

      set({ 
        currentExam: exam,
        incompleteExam: null,
        currentQuestionIndex: 0,
        answers: {},
        timeRemaining: config.timeLimit * 60,
        timerInterval: newTimerInterval,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to start mock exam', 
        isLoading: false 
      });
    }
  },

  resumeMockExam: async (examId: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get(`/mock-exams/resume/${examId}`);
      const exam = response.data.exam;

      if (get().timerInterval) {
        clearInterval(get().timerInterval);
      }

      const newTimerInterval = setInterval(() => {
        set(state => {
          const newTime = state.timeRemaining - 1;
          if (newTime <= 0) {
            clearInterval(newTimerInterval);
            get().endExam();
            return { timeRemaining: 0, timerInterval: null };
          }
          return { timeRemaining: newTime };
        });
      }, 1000);

      set({
        currentExam: exam,
        incompleteExam: null,
        currentQuestionIndex: 0,
        answers: exam.answers || {},
        timeRemaining: exam.timeRemaining,
        timerInterval: newTimerInterval,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to resume mock exam',
        isLoading: false
      });
    }
  },

  submitAnswer: (questionId, selectedOptionId) => {
    const startTime = Date.now();
    set(state => ({
      answers: {
        ...state.answers,
        [questionId]: {
          questionId,
          selectedOptionId,
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
        answers: Object.values(state.answers).map(answer => ({
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          responseTime: answer.timeSpent
        })),
        timeSpent: (state.currentExam.timeLimit * 60) - state.timeRemaining
      });

      if (state.timerInterval) {
        clearInterval(state.timerInterval);
      }

      set({
        currentExam: null,
        currentQuestionIndex: 0,
        answers: {},
        timeRemaining: 0,
        timerInterval: null
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to submit exam' });
    }
  },

  fetchExamResult: async (examId: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get(`/mock-exams/results/${examId}`);
      set({
        examResult: response.data.results,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch exam results',
        isLoading: false
      });
    }
  },

  fetchExamHistory: async (page: number, limit: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get(`/mock-exams/history?page=${page}&limit=${limit}`);
      set({
        examHistory: {
          exams: response.data.history,
          total: response.data.pagination.total,
          page,
          limit
        },
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch exam history',
        isLoading: false
      });
    }
  },

  clearError: () => set({ error: null })
}));