import { create } from 'zustand';
import { AppState } from 'react-native';
import api from '../services/api';

// ------------------ Types ------------------
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
  lastQuestionIndex?: number; // ✅ track resume index
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
    optionIds: number[];
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

// ------------------ Store ------------------
interface MockExamState {
  currentExam: MockExam | null;
  incompleteExam: MockExam | null;
  currentQuestionIndex: number;
  answers: Record<number, ExamAnswer>;
  questionStartTime: number | null;
  timeRemaining: number;
  mockExams: MockExam[];
  recentScores: RecentScore[];
  examResult: MockExamResult | null;
  examHistory: MockExamHistory | null;
  isLoading: boolean;
  error: string | null;
  timerInterval: number | null;
  autoSaveInterval: number | null;

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
  jumpToQuestion: (index: number) => void;
  getQuestionStatus: (questionId: number) => 'answered' | 'unanswered' | 'skipped';
  getProgressSummary: () => { total: number; answered: number; skipped: number; unanswered: number };
  getCompletion: () => number;
  getActiveQuestion: () => MockExamQuestion | null;
  endExam: () => Promise<void>;
  fetchExamResult: (examId: number) => Promise<void>;
  fetchExamHistory: (page: number, limit: number) => Promise<void>;
  clearError: () => void;
}

// ------------------ Implementation ------------------
export const useMockExamStore = create<MockExamState>((set, get) => ({
  currentExam: null,
  incompleteExam: null,
  currentQuestionIndex: 0,
  answers: {},
  questionStartTime: null,
  timeRemaining: 0,
  mockExams: [],
  recentScores: [],
  examResult: null,
  examHistory: null,
  isLoading: false,
  error: null,
  timerInterval: null,
  autoSaveInterval: null,

  fetchMockExams: async () => {
    set({ isLoading: true, error: null });
    try {
      const [examsResponse, scoresResponse, incompleteResponse] = await Promise.all([
        api.get<{ mockExams: MockExam[] }>('/mock-exams'),
        api.get<{ scores: RecentScore[] }>('/mock-exams/recent-scores'),
        api.get<{ exam: MockExam | null }>('/mock-exams/resume/0'),
      ]);

      set({
        mockExams: examsResponse.data.mockExams,
        recentScores: scoresResponse.data.scores,
        incompleteExam: incompleteResponse.data.exam || null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch mock exams',
        isLoading: false,
      });
    }
  },

  startMockExam: async (config) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ exam: MockExam }>('/mock-exams/start', config);
      const exam = response.data.exam;

      // cleanup timers
      const state = get();
      if (state.timerInterval !== null) {
        clearInterval(state.timerInterval);
      }
      if (state.autoSaveInterval !== null) {
        clearInterval(state.autoSaveInterval);
      }

      // countdown
      const newTimerInterval = setInterval(() => {
        set((state) => {
          const newTime = state.timeRemaining - 1;
          if (newTime <= 0) {
            if (state.timerInterval !== null) {
              clearInterval(state.timerInterval);
            }
            get().endExam();
            return { timeRemaining: 0, timerInterval: null };
          }
          return { timeRemaining: newTime };
        });
      }, 1000) as unknown as number;

      // auto-save answers
      const newAutoSaveInterval = setInterval(() => {
        const state = get();
        if (state.currentExam) {
          api.post('/mock-exams/autosave', {
            examId: state.currentExam.id,
            answers: state.answers,
          });
        }
      }, 30000) as unknown as number;

      set({
        currentExam: exam,
        incompleteExam: null,
        currentQuestionIndex: 0,
        answers: {},
        timeRemaining: config.timeLimit * 60,
        timerInterval: newTimerInterval,
        autoSaveInterval: newAutoSaveInterval,
        questionStartTime: Date.now(),
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to start mock exam',
        isLoading: false,
      });
    }
  },

  resumeMockExam: async (examId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ exam: MockExam & { answers?: Record<number, ExamAnswer>; timeRemaining: number } }>(
        `/mock-exams/resume/${examId}`
      );
      const exam = response.data.exam;

      const state = get();
      if (state.timerInterval !== null) {
        clearInterval(state.timerInterval);
      }

      const newTimerInterval = setInterval(() => {
        set((state) => {
          const newTime = state.timeRemaining - 1;
          if (newTime <= 0) {
            if (state.timerInterval !== null) {
              clearInterval(state.timerInterval);
            }
            get().endExam();
            return { timeRemaining: 0, timerInterval: null };
          }
          return { timeRemaining: newTime };
        });
      }, 1000) as unknown as number;

      set({
        currentExam: exam,
        incompleteExam: null,
        currentQuestionIndex: exam.lastQuestionIndex ?? 0, // ✅ restore index
        answers: exam.answers || {},
        timeRemaining: exam.timeRemaining,
        timerInterval: newTimerInterval,
        questionStartTime: Date.now(),
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to resume mock exam',
        isLoading: false,
      });
    }
  },

  // --- Answering & Navigation ---
  submitAnswer: (questionId, selectedOptionId) => {
    const state = get();
    const start = state.questionStartTime || Date.now();
    set({
      answers: {
        ...state.answers,
        [questionId]: {
          questionId,
          selectedOptionId,
          timeSpent: Math.round((Date.now() - start) / 1000),
        },
      },
      questionStartTime: Date.now(),
    });
  },

  nextQuestion: () => {
    set((state) => {
      const now = Date.now();
      const currentQ = state.currentExam?.questions[state.currentQuestionIndex];

      if (currentQ) {
        const prev = state.answers[currentQ.id]?.timeSpent || 0;
        state.answers[currentQ.id] = {
          ...(state.answers[currentQ.id] || { questionId: currentQ.id, selectedOptionId: -1 }),
          timeSpent: prev + Math.round((now - (state.questionStartTime || now)) / 1000),
        };
      }

      const nextIndex = Math.min(state.currentQuestionIndex + 1, (state.currentExam?.questions.length || 1) - 1);

      return {
        currentQuestionIndex: nextIndex,
        questionStartTime: now,
        answers: { ...state.answers },
      };
    });
  },

  previousQuestion: () => {
    set((state) => {
      const now = Date.now();
      const currentQ = state.currentExam?.questions[state.currentQuestionIndex];

      if (currentQ) {
        const prev = state.answers[currentQ.id]?.timeSpent || 0;
        state.answers[currentQ.id] = {
          ...(state.answers[currentQ.id] || { questionId: currentQ.id, selectedOptionId: -1 }),
          timeSpent: prev + Math.round((now - (state.questionStartTime || now)) / 1000),
        };
      }

      const prevIndex = Math.max(state.currentQuestionIndex - 1, 0);

      return {
        currentQuestionIndex: prevIndex,
        questionStartTime: now,
        answers: { ...state.answers },
      };
    });
  },

  jumpToQuestion: (index: number) => {
    set((state) => {
      const now = Date.now();
      const currentQ = state.currentExam?.questions[state.currentQuestionIndex];

      if (currentQ) {
        const prev = state.answers[currentQ.id]?.timeSpent || 0;
        state.answers[currentQ.id] = {
          ...(state.answers[currentQ.id] || { questionId: currentQ.id, selectedOptionId: -1 }),
          timeSpent: prev + Math.round((now - (state.questionStartTime || now)) / 1000),
        };
      }

      const newIndex = Math.max(0, Math.min(index, (state.currentExam?.questions.length || 1) - 1));

      return {
        currentQuestionIndex: newIndex,
        questionStartTime: now,
        answers: { ...state.answers },
      };
    });
  },

  // --- Helpers ---
  getQuestionStatus: (questionId) => {
    const state = get();
    const answer = state.answers[questionId];
    if (!answer) return 'unanswered';
    if (answer.selectedOptionId === -1) return 'skipped';
    return 'answered';
  },

  getProgressSummary: () => {
    const state = get();
    const totalQuestions = state.currentExam?.questions.length || 0;
    let answered = 0;
    let skipped = 0;

    for (const q of state.currentExam?.questions || []) {
      const ans = state.answers[q.id];
      if (ans) {
        if (ans.selectedOptionId === -1) skipped++;
        else answered++;
      }
    }

    const unanswered = totalQuestions - (answered + skipped);
    return { total: totalQuestions, answered, skipped, unanswered };
  },

  getCompletion: () => {
    const { total, answered } = get().getProgressSummary();
    return total === 0 ? 0 : Math.round((answered / total) * 100);
  },

  getActiveQuestion: () => {
    const state = get();
    return state.currentExam?.questions[state.currentQuestionIndex] || null;
  },

  // --- Exam End ---
  endExam: async () => {
    const state = get();
    if (!state.currentExam) return;
    if (state.isLoading) return; // ✅ guard against double submit

    try {
      set({ isLoading: true });
      await api.post('/mock-exams/submit', {
        examId: state.currentExam.id,
        answers: Object.values(state.answers).map((answer) => ({
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          responseTime: answer.timeSpent,
        })),
        timeSpent: state.currentExam.timeLimit * 60 - state.timeRemaining,
      });

      if (state.timerInterval !== null) {
        clearInterval(state.timerInterval);
      }
      if (state.autoSaveInterval !== null) {
        clearInterval(state.autoSaveInterval);
      }

      set({
        currentExam: null,
        currentQuestionIndex: 0,
        answers: {},
        timeRemaining: 0,
        timerInterval: null,
        autoSaveInterval: null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to submit exam', isLoading: false });
    }
  },

  // --- Results & History ---
  fetchExamResult: async (examId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ results: MockExamResult }>(`/mock-exams/results/${examId}`);
      set({ examResult: response.data.results, isLoading: false, error: null });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch exam results', isLoading: false });
    }
  },

  fetchExamHistory: async (page: number, limit: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ history: MockExamHistory['exams']; pagination: { total: number } }>(
        `/mock-exams/history?page=${page}&limit=${limit}`
      );
      set({
        examHistory: {
          exams: response.data.history,
          total: response.data.pagination.total,
          page,
          limit,
        },
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch exam history', isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

// Cleanup on app background/exit
AppState.addEventListener('change', (state) => {
  if (state === 'background' || state === 'inactive') {
    const { timerInterval, autoSaveInterval } = useMockExamStore.getState();
    if (timerInterval !== null) {
      clearInterval(timerInterval);
    }
    if (autoSaveInterval !== null) {
      clearInterval(autoSaveInterval);
    }
  }
});