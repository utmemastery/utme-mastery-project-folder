import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface Question {
  id: number;
  subject: string;
  topic: string;
  question: string;
  options: string[];
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  cognitiveLevel: 'RECALL' | 'COMPREHENSION' | 'APPLICATION' | 'ANALYSIS' | 'SYNTHESIS' | 'EVALUATION';
  yearAsked?: number;
  tags?: string[];
}

interface QuestionAttempt {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  confidenceLevel?: number;
  timestamp: Date;
}

interface PracticeSession {
  id: string;
  sessionType: 'PRACTICE' | 'TIMED' | 'MOCK_EXAM' | 'REVIEW';
  subject: string;
  topics?: string[];
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  questionCount: number;
  answeredCount?: number;
  correctCount?: number;
  timeLimit?: number;
  questions: Question[];
  attempts: QuestionAttempt[];
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
}

interface Flashcard {
  id: number;
  subject: string;
  topic: string;
  type: 'DEFINITION' | 'CONCEPT' | 'FILL_IN_THE_BLANK' | 'DIAGRAM_LABELING' | 'QUICK_FACT' | 'MNEMONIC' | 'QUESTION_ANSWER';
  front: string;
  back: string;
  imageUrl?: string;
}

interface Passage {
  id: number;
  subject: string;
  text: string;
  type: 'COMPREHENSION' | 'CLOZE';
  questions: Question[];
}

interface PracticeStats {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTimePerQuestion: number;
  strongTopics: string[];
  weakTopics: string[];
  streakCount: number;
  lastPracticeDate: Date;
}

interface PracticeSettings {
  autoMoveNext: boolean;
  showExplanations: boolean;
  timeWarnings: boolean;
  confidenceTracking: boolean;
  practiceReminders: boolean;
  dailyGoal: number;
}

interface PracticeStore {
  currentSession: PracticeSession | null;
  currentQuestionIndex: number;
  recentSessions: PracticeSession[];
  practiceStats: PracticeStats | null;
  settings: PracticeSettings;
  flashcards: Flashcard[];
  passages: Passage[];
  isLoading: boolean;
  error: string | null;
  startPracticeSession: (config: {
    subject: string;
    sessionType: PracticeSession['sessionType'];
    questionCount: number;
    topics?: string[];
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    timeLimit?: number;
  }) => Promise<void>;
  endSession: () => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  getNextQuestion: () => Question | null;
  getCurrentQuestion: () => Question | null;
  skipQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitAnswer: (attempt: Omit<QuestionAttempt, 'timestamp' | 'isCorrect'>) => Promise<void>;
  updateAnswer: (questionId: number, selectedAnswer: number) => void;
  fetchPracticeStats: () => Promise<void>;
  fetchRecentSessions: () => Promise<void>;
  savePracticeSession: (session: PracticeSession) => Promise<void>;
  loadPracticeSession: (sessionId: string) => Promise<void>;
  updateSettings: (newSettings: Partial<PracticeSettings>) => Promise<void>;
  generatePracticeQuestions: (config: {
    subject: string;
    count: number;
    topics?: string[];
    difficulty?: string;
    excludeAnswered?: boolean;
  }) => Promise<Question[]>;
  getWeakTopicsQuestions: (subject: string, count: number) => Promise<Question[]>;
  getMixedQuestions: (subjects: string[], count: number) => Promise<Question[]>;
  fetchPassages: (subject: string) => Promise<void>;
  syncOfflineData: () => Promise<void>;
  calculateSessionAccuracy: (session: PracticeSession) => number;
  getSessionStats: () => { answeredCount: number; correctCount: number };
  getTopicPerformance: (subject: string) => Promise<any>;
  getStudyStreak: () => number;
  clearError: () => void;
  reset: () => void;
}

export const usePracticeStore = create<PracticeStore>((set, get) => ({
  currentSession: null,
  currentQuestionIndex: 0,
  recentSessions: [],
  practiceStats: null,
  settings: {
    autoMoveNext: false,
    showExplanations: true,
    timeWarnings: true,
    confidenceTracking: true,
    practiceReminders: true,
    dailyGoal: 20
  },
  flashcards: [],
  passages: [],
  isLoading: false,
  error: null,

  startPracticeSession: async (config) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/practice/start-session', {
        subject: config.subject,
        topics: config.topics || [],
        difficulty: config.difficulty,
        questionCount: config.questionCount
      });
      const sessionData = response.data;
      const questionsResponse = await api.post('/practice/questions/generate', {
        subject: config.subject,
        topics: config.topics,
        difficulty: config.difficulty,
        count: config.questionCount,
        excludeAnswered: true
      });
      const session: PracticeSession = {
        id: sessionData.id,
        sessionType: config.sessionType,
        subject: config.subject,
        topics: config.topics,
        difficulty: config.difficulty,
        questionCount: config.questionCount,
        timeLimit: config.timeLimit,
        questions: questionsResponse.data.questions,
        attempts: [],
        startTime: new Date(sessionData.startTime),
        isCompleted: false
      };
      set({ currentSession: session, currentQuestionIndex: 0, isLoading: false });
      await AsyncStorage.setItem(`practice_session_${session.id}`, JSON.stringify(session));
    } catch (error: any) {
      set({ error: error.message || 'Failed to start practice session', isLoading: false });
      throw error;
    }
  },

  endSession: async () => {
    const session = get().currentSession;
    if (!session) return;
    try {
      const completedSession: PracticeSession = {
        ...session,
        endTime: new Date(),
        isCompleted: true
      };
      await api.post('/practice/end-session', { sessionId: session.id });
      await get().savePracticeSession(completedSession);
      set({ currentSession: null, currentQuestionIndex: 0 });
    } catch (error: any) {
      set({ error: error.message || 'Failed to end session' });
      throw error;
    }
  },

  pauseSession: async () => {
    const session = get().currentSession;
    if (session) {
      await AsyncStorage.setItem(`practice_session_${session.id}`, JSON.stringify(session));
    }
  },

  resumeSession: async () => {
    const session = get().currentSession;
    if (session) {
      await get().loadPracticeSession(session.id);
    }
  },

  getNextQuestion: () => {
    const { currentSession, currentQuestionIndex } = get();
    if (!currentSession || currentQuestionIndex >= currentSession.questions.length) {
      return null;
    }
    return currentSession.questions[currentQuestionIndex];
  },

  getCurrentQuestion: () => {
    const { currentSession, currentQuestionIndex } = get();
    if (!currentSession) return null;
    return currentSession.questions[currentQuestionIndex];
  },

  skipQuestion: () => {
    set(state => ({
      currentQuestionIndex: Math.min(
        state.currentQuestionIndex + 1,
        (state.currentSession?.questions.length || 0) - 1
      )
    }));
  },

  goToQuestion: (index: number) => {
    set(state => ({
      currentQuestionIndex: Math.max(0, Math.min(index, (state.currentSession?.questions.length || 0) - 1))
    }));
  },

  submitAnswer: async (attempt: Omit<QuestionAttempt, 'timestamp' | 'isCorrect'>) => {
    try {
      const response = await api.post('/practice/submit-answer', {
        sessionId: get().currentSession?.id,
        questionId: attempt.questionId,
        selectedOption: attempt.selectedAnswer,
        timeTaken: attempt.timeSpent,
        confidenceLevel: attempt.confidenceLevel
      });
      const { isCorrect } = response.data;
      const updatedAttempt: QuestionAttempt = {
        ...attempt,
        isCorrect,
        timestamp: new Date()
      };
      set(state => ({
        currentSession: state.currentSession ? {
          ...state.currentSession,
          attempts: [...state.currentSession.attempts, updatedAttempt]
        } : null
      }));
      await AsyncStorage.setItem(`practice_session_${get().currentSession?.id}`, JSON.stringify(get().currentSession));
    } catch (error: any) {
      set({ error: error.message || 'Failed to submit answer' });
      throw error;
    }
  },

  updateAnswer: (questionId: number, selectedAnswer: number) => {
    set(state => ({
      currentSession: state.currentSession ? {
        ...state.currentSession,
        attempts: state.currentSession.attempts.map(attempt =>
          attempt.questionId === questionId ? { ...attempt, selectedAnswer } : attempt
        )
      } : null
    }));
  },

  fetchPracticeStats: async () => {
    try {
      const response = await api.get('/practice/stats');
      set({ practiceStats: response.data });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch stats' });
    }
  },

  fetchRecentSessions: async () => {
    try {
      const response = await api.get('/practice/history', { params: { page: 1, limit: 10 } });
      set({ recentSessions: response.data.sessions });
    } catch (error) {
      const sessions = await Promise.all(
        Array.from({ length: 10 }, async (_, i) => {
          const sessionData = await AsyncStorage.getItem(`practice_session_session_${Date.now() - i * 86400000}`);
          return sessionData ? JSON.parse(sessionData) : null;
        })
      );
      set({ recentSessions: sessions.filter(Boolean) });
    }
  },

  savePracticeSession: async (session: PracticeSession) => {
    try {
      await api.post('/practice/offline-sync', {
        resourceType: 'PracticeSession',
        resourceId: session.id,
        action: session.isCompleted ? 'UPDATE' : 'CREATE',
        data: session
      });
      await AsyncStorage.setItem(`practice_session_${session.id}`, JSON.stringify(session));
    } catch (error) {
      await AsyncStorage.setItem(`practice_session_${session.id}`, JSON.stringify(session));
      console.error('Failed to save session to API:', error);
    }
  },

  loadPracticeSession: async (sessionId: string) => {
    try {
      set({ isLoading: true });
      const response = await api.get(`/practice/sessions/${sessionId}`);
      set({ currentSession: response.data.session, isLoading: false });
    } catch (error) {
      try {
        const sessionData = await AsyncStorage.getItem(`practice_session_${sessionId}`);
        if (sessionData) {
          set({ currentSession: JSON.parse(sessionData), isLoading: false });
        } else {
          throw new Error('Session not found');
        }
      } catch (storageError) {
        set({ error: 'Failed to load practice session', isLoading: false });
      }
    }
  },

  updateSettings: async (newSettings: Partial<PracticeSettings>) => {
    try {
      const updatedSettings = { ...get().settings, ...newSettings };
      set({ settings: updatedSettings });
      await api.put('/practice/settings', updatedSettings);
      await AsyncStorage.setItem('practice_settings', JSON.stringify(updatedSettings));
    } catch (error) {
      await AsyncStorage.setItem('practice_settings', JSON.stringify(get().settings));
      console.error('Failed to update settings:', error);
    }
  },

  generatePracticeQuestions: async (config) => {
    try {
      const response = await api.post('/practice/questions/generate', config);
      return response.data.questions;
    } catch (error) {
      return [];
    }
  },

  getWeakTopicsQuestions: async (subject: string, count: number) => {
    try {
      const response = await api.get(`/practice/questions/weak-topics`, {
        params: { subject, count }
      });
      return response.data.questions;
    } catch (error) {
      return [];
    }
  },

  getMixedQuestions: async (subjects: string[], count: number) => {
    try {
      const response = await api.post('/practice/questions/mixed', {
        subjects,
        count
      });
      return response.data.questions;
    } catch (error) {
      return [];
    }
  },

  fetchPassages: async (subject) => {
    try {
      const response = await api.get('/practice/passages', { params: { subject } });
      set({ passages: response.data.passages });
    } catch (error) {
      set({ error: 'Failed to fetch passages' });
    }
  },

  syncOfflineData: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const sessionKeys = keys.filter(key => key.startsWith('practice_session_'));
      for (const key of sessionKeys) {
        const sessionData = await AsyncStorage.getItem(key);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          await api.post('/practice/offline-sync', {
            resourceType: 'PracticeSession',
            resourceId: session.id,
            action: session.isCompleted ? 'UPDATE' : 'CREATE',
            data: session
          });
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      set({ error: 'Failed to sync offline data' });
    }
  },

  calculateSessionAccuracy: (session: PracticeSession) => {
    if (session.attempts.length === 0) return 0;
    const correct = session.attempts.filter(a => a.isCorrect).length;
    return (correct / session.attempts.length) * 100;
  },

  getTopicPerformance: async (subject: string) => {
    try {
      const response = await api.get(`/practice/analytics/topics/${subject}`);
      return response.data.performance;
    } catch (error) {
      return {};
    }
  },

  getStudyStreak: () => {
    const recentSessions = get().recentSessions;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < recentSessions.length; i++) {
      const sessionDate = new Date(recentSessions[i].startTime);
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },

  getSessionStats: () => {
    const session = get().currentSession;
    if (!session) return { answeredCount: 0, correctCount: 0 };
    const answeredCount = session.attempts.length;
    const correctCount = session.attempts.filter(a => a.isCorrect).length;
    return { answeredCount, correctCount };
  },


  clearError: () => set({ error: null }),

  reset: () => set({
    currentSession: null,
    currentQuestionIndex: 0,
    error: null
  })
}));

export type { Question, QuestionAttempt, PracticeSession, Flashcard, Passage, PracticeStats, PracticeSettings };