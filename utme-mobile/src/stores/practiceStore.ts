import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '../services/api';

// Types
interface Subject {
  id: number;
  name: string;
  description: string | null;
  mastery: number;
  accuracy: number;
  trend: number;
  topicCount: number;
  masteredTopics: number;
}

interface Topic {
  id: number;
  name: string;
  description: string | null;
  questionCount: number;
  mastery: number;
  accuracy: number;
  questionsPracticed: number;
  avgTime: number;
  isUnlocked: boolean;
}

interface Section {
  id: number;
  name: string;
  description: string | null;
  topicCount: number;
  masteredTopics: number;
  avgMastery: number;
  topics?: Topic[];
}

interface Question {
  id: number;
  text: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  options: Array<{ id: number; text: string; isCorrect: boolean }>;
  hints?: string[];
  topic: {
    id: number;
    name: string;
  };
  passage?: { content: string };
  image?: { url: string };
  explanation?: string;
}


interface PracticeSession {
  id: string;
  subjectId: number;
  sectionId?: number;
  topicId?: number;
  sessionType: 'PRACTICE' | 'REVIEW' | 'DIAGNOSTIC' | 'TIMED' | 'ADAPTIVE';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  questionCount: number;
  timeLimit?: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startTime: Date;
  endTime?: Date;
  correctCount?: number;
  answeredCount?: number;
  questions?: Question[];
}

interface QuestionAttempt {
  id: string;
  questionId: number;
  selectedOption: number;
  isCorrect: boolean;
  timeTaken: number;
  confidenceLevel: number;
  attemptedAt: Date;
}

interface PerformanceSnapshot {
  overall: {
    mastery: number;
    questionsAnswered: number;
    accuracy: number;
  };
  bySubject: Array<{
    subjectName: string;
    predictedScore: number;
    confidence: number;
    trend: number;
    takenAt: Date;
  }>;
}

interface Recommendation {
  type: 'SPACED_REPETITION' | 'WEAK_AREA' | 'STUDY_PLAN';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  action: string;
  metadata: Record<string, any>;
}

interface SessionSummary {
  sessionId: string;
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  avgTime: number;
  completedAt: Date;
  strengths: string[];
  weaknesses: string[];
  insights: string[];
  nextActions: Array<{
    type: string;
    title: string;
    description: string;
    action: string;
  }>;
}

interface Achievement {
  id: number;
  type: 'BADGE' | 'MILESTONE' | 'SCORE';
  title: string;
  description: string;
  points: number;
  earnedAt: Date;
}

interface Badge {
  id: number;
  type: string;
  earnedAt: Date;
}

interface Streak {
  count: number;
  lastActive: Date | null;
}

interface WeakArea {
  topicId: number;
  topicName: string;
  subjectId: number;
  subjectName: string;
  mastery: number;
  accuracy: number;
  questionsPracticed: number;
  avgTime: number;
}

interface ReviewQueue {
  dueCount: number;
  questions: Question[];
}

interface PracticeDashboard {
  overallMastery: {
    mastery: number;
    questionsAnswered: number;
    accuracy: number;
  };
  streak: Streak;
  recentSessions: PracticeSession[];
  subjectProgress: Subject[];
  reviewQueue: ReviewQueue;
  recommendations: Recommendation[];
}

interface PracticeState {
  // Dashboard Data
  dashboard: PracticeDashboard | null;
  performanceSnapshot: PerformanceSnapshot | null;
  
  // Subjects & Topics
  subjects: Subject[];
  currentSubject: Subject | null;
  sections: Section[];
  topics: Topic[];
  currentTopic: Topic | null;
  questions: Question[];
  
  // Practice Session
  currentSession: PracticeSession | null;
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  sessionQuestions: Question[];
  questionAttempts: QuestionAttempt[];
  sessionProgress: {
    answered: number;
    flagged: number[];
    timeElapsed: number;
  };
  
  // Session Results
  sessionSummary: SessionSummary | null;
  mistakes: Array<{
    questionId: number;
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    explanation: string;
    topicName: string;
  }>;
  
  // Analytics & Progress
  userProgress: {
    overallMastery: number;
    subjectProgress: Subject[];
    streak: Streak;
    achievementCount: number;
    level: number;
  } | null;
  performanceAnalytics: any | null;
  performanceTrends: any | null;
  weakAreas: WeakArea[];
  
  // Gamification
  achievements: Achievement[];
  badges: Badge[];
  currentStreak: number;
  totalPoints: number;
  weeklyRank: number;
  
  // Review & Spaced Repetition
  reviewQueue: ReviewQueue | null;
  
  // Predictions & Insights
  predictedScore: {
    score: number;
    confidence: string;
    subjectName?: string;
  } | null;
  jambInsights: any | null;
  learningPatterns: any | null;
  
  // UI State
  loading: {
    dashboard: boolean;
    subjects: boolean;
    session: boolean;
    question: boolean;
    summary: boolean;
  };
  error: string | null;
  
  // Session Configuration
  sessionConfig: {
    subjectId?: number;
    sectionId?: number;
    topicId?: number;
    topicIds?: number[];
    sessionType: 'PRACTICE' | 'REVIEW' | 'DIAGNOSTIC' | 'TIMED' | 'ADAPTIVE';
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    questionCount: number;
    timeLimit?: number;
  };

    // Additional Analytics & Insights
  userPercentile: any | null;
  leaderboard: any[] | null;
  userScore: number;
  difficultyCalibration: any | null;
  adaptiveQuestions: Question[];
  
  // Sharing & Social
  sharedProgress: any[];
  
  // Study Plan Integration  
  studyPlanIntegration: any | null;
  studyPlanProgress: any | null;
  
  // Session History
  practiceHistory: any | null;
  pagination: any | null;
  
  
  
  // Enhanced Session Management
  savedSessionState: any | null;
  preloadedQuestions: Question[];
  bulkQuestions: Question[];
  questionTimes: { [questionId: number]: number };
  lastFailedAction: { actionName: string; args: any[] } | null;
  
  // Performance Tracking
  sessionInsights: any | null;
  strongTopics: any[];
  weakTopics: any[];
}

interface PracticeActions {
  // Dashboard Actions
  loadDashboard: () => Promise<void>;
  loadPerformanceSnapshot: () => Promise<void>;
  
  // Subject & Topic Actions
  loadSubjects: () => Promise<void>;
  loadSubjectDetails: (subjectId: number) => Promise<void>;
  loadSubjectSections: (subjectId: number) => Promise<void>;
  loadSectionTopics: (sectionId: number) => Promise<void>;
  loadTopicDetails: (topicId: number) => Promise<void>;
  setCurrentSubject: (subject: Subject | null) => void;
  setCurrentTopic: (topic: Topic | null) => void;
  
  // Practice Session Actions
  createPracticeSession: (sessionData: any) => Promise<any>;
  loadPracticeSession: (sessionId: string) => Promise<void>;
  updatePracticeSession: (sessionId: string, updateData: any) => Promise<void>;
  completePracticeSession: (sessionId: string) => Promise<void>;
  cancelPracticeSession: (sessionId: string) => Promise<void>;
  
  // Question Actions
  loadSessionQuestions: (sessionId: string) => Promise<void>;
  loadCurrentQuestion: (sessionId: string, questionIndex: number) => Promise<void>;
  submitQuestionAttempt: (sessionId: string, questionId: number, attemptData: {
    selectedOption: number;
    timeTaken: number;
    confidenceLevel: number;
  }) => Promise<void>;
  navigateToQuestion: (index: number) => void;
  flagQuestion: (questionIndex: number) => void;
  unflagQuestion: (questionIndex: number) => void;
  
  // Smart Practice Modes
  createSmartReviewSession: (limit?: number) => Promise<void>;
  createAdaptiveDrillSession: (options: {
    subjectId?: number;
    topicId?: number;
    targetDifficulty?: number;
  }) => Promise<void>;
  createTimedSprintSession: (options: {
    questionCount: number;
    timeLimit: number;
  }) => Promise<void>;
  createDiagnosticSession: (params: { subjectId: number; questionCount: number }) => Promise<void>;

  
  // Progress & Analytics Actions
  loadUserProgress: () => Promise<void>;
  loadSubjectProgress: (subjectId: number) => Promise<void>;
  loadTopicProgress: (topicId: number) => Promise<void>;
  loadPerformanceAnalytics: (timeframe?: string) => Promise<void>;
  loadPerformanceTrends: (options: { subjectId: number | null; days: number }) => Promise<void>;
  loadWeakAreas: (options?: { threshold?: number; limit?: number }) => Promise<void>;
  
  // Session History Actions
  loadPracticeHistory: (options: {
    page: number;
    limit: number;
    subjectId?: number;
  }) => Promise<void>;
  loadSessionSummary: (sessionId: string) => Promise<void>;
  loadSessionMistakes: (sessionId: string) => Promise<void>;
  reviewMistakes: (sessionId: string) => Promise<void>;
  
  // Gamification Actions
  loadAchievements: () => Promise<void>;
  loadBadges: () => Promise<void>;
  loadCurrentStreak: () => Promise<void>;
  updateStreak: () => Promise<void>;
  loadGamificationSummary: () => Promise<void>;
  
  // Review & Spaced Repetition Actions
  loadReviewQueue: () => Promise<void>;
  scheduleReview: (data: {
    questionId: number;
    difficulty: number;
    performance: number;
  }) => Promise<void>;
  
  // AI-Driven Features
  calibrateDifficulty: (data: {
    subjectId: number;
    recentPerformance: any;
  }) => Promise<void>;
  loadAdaptiveNextQuestions: (options: {
    sessionId?: string;
    count: number;
  }) => Promise<void>;
  updateConfidenceScore: (data: {
    questionId: number;
    confidenceLevel: number;
  }) => Promise<void>;
  
  // Predictions & Insights
  loadPredictedScore: (options: { subjectId?: number }) => Promise<void>;
  loadJAMBInsights: () => Promise<void>;
  loadLearningPatterns: () => Promise<void>;
  
  // Utility Actions
  setSessionConfig: (config: Partial<PracticeState['sessionConfig']>) => void;
  resetCurrentSession: () => void;
  clearError: () => void;
  updateSessionProgress: (progress: Partial<PracticeState['sessionProgress']>) => void;

    // Percentile & Leaderboard Actions
  loadUserPercentile: (options?: { subjectId?: number; metric?: string }) => Promise<void>;
  loadLeaderboard: (period?: string, limit?: number) => Promise<void>;
  loadUserRank: (period?: string) => Promise<void>;
  
  // Sharing Actions
  shareProgress: (data: {
    achievementId: number;
    message: string;
    privacy?: string;
  }) => Promise<void>;
  
  // Study Plan Integration Actions
  integratePracticeWithStudyPlan: (data: {
    studyPlanId: number;
    practiceGoals: any;
  }) => Promise<void>;
  loadStudyPlanProgress: (studyPlanId?: number) => Promise<void>;
  
  // Enhanced Review Actions
  updateReviewSchedule: (reviewId: number, data: {
    performance: number;
    confidenceLevel: number;
  }) => Promise<void>;
  
  // Session Management Utilities
  startSessionTimer: () => void;
  pauseSessionTimer: () => void;
  resumeSessionTimer: () => void;
  shuffleSessionQuestions: () => void;
  saveSessionState: () => void;
  restoreSessionState: () => void;
  
  // Bulk Operations
  loadBulkQuestions: (questionIds: number[]) => Promise<void>;
  preloadNextQuestions: (count?: number) => Promise<void>;
  
  // Enhanced Analytics
  trackQuestionTime: (questionId: number, startTime: number) => void;
  getSessionInsights: () => any;
  calculateCurrentStreak: () => number;
  getStrongTopics: () => {
    topicId: number;
    topicName: string;
    accuracy: number;
    questionsAnswered: number;
  }[];
  getWeakTopics: () => {
    topicId: number;
    topicName: string;
    accuracy: number;
    questionsAnswered: number;
  }[];
  
  // Error Handling
  retryFailedAction: (actionName: string, ...args: any[]) => Promise<void>;

}

type PracticeStore = PracticeState & PracticeActions;

const initialState: PracticeState = {
  // Dashboard Data
  dashboard: null,
  performanceSnapshot: null,
  
  // Subjects & Topics
  subjects: [],
  currentSubject: null,
  sections: [],
  topics: [],
  currentTopic: null,
  questions: [],

  
  // Practice Session
  currentSession: null,
  currentQuestion: null,
  currentQuestionIndex: 0,
  sessionQuestions: [],
  questionAttempts: [],
  sessionProgress: {
    answered: 0,
    flagged: [],
    timeElapsed: 0,
  },
  
  // Session Results
  sessionSummary: null,
  mistakes: [],
  
  // Analytics & Progress
  userProgress: null,
  performanceAnalytics: null,
  performanceTrends: null,
  weakAreas: [],
  
  // Gamification
  achievements: [],
  badges: [],
  currentStreak: 0,
  totalPoints: 0,
  weeklyRank: 0,
  
  // Review & Spaced Repetition
  reviewQueue: null,
  
  // Predictions & Insights
  predictedScore: null,
  jambInsights: null,
  learningPatterns: null,
  
  // UI State
  loading: {
    dashboard: false,
    subjects: false,
    session: false,
    question: false,
    summary: false,
  },
  error: null,
  
  // Session Configuration
  sessionConfig: {
    sessionType: 'PRACTICE',
    questionCount: 15,
  },

    // Additional Analytics & Insights
  userPercentile: null,
  leaderboard: null,
  userScore: 0,
  difficultyCalibration: null,
  adaptiveQuestions: [],
  
  // Sharing & Social
  sharedProgress: [],
  
  // Study Plan Integration
  studyPlanIntegration: null,
  studyPlanProgress: null,
  
  // Session History
  practiceHistory: null,
  pagination: null,

  
  // Enhanced Session Management
  savedSessionState: null,
  preloadedQuestions: [],
  bulkQuestions: [],
  questionTimes: {},
  lastFailedAction: null,
  
  // Performance Tracking
  sessionInsights: null,
  strongTopics: [],
  weakTopics: [],
};

export const usePracticeStore = create<PracticeStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Dashboard Actions
      loadDashboard: async () => {
        set((state) => ({ loading: { ...state.loading, dashboard: true }, error: null }));
        try {
          const response = await api.get('/practice/dashboard');
          set((state) => ({
            dashboard: response.data.data,
            loading: { ...state.loading, dashboard: false }
          }));
        } catch (error: any) {
          set((state) => ({
            error: error.response?.data?.message || 'Failed to load dashboard',
            loading: { ...state.loading, dashboard: false }
          }));
        }
      },

      loadPerformanceSnapshot: async () => {
        try {
          const response = await api.get('/practice/performance-snapshot');
          set({ performanceSnapshot: response.data.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to load performance snapshot' });
        }
      },

      // Subject & Topic Actions
      loadSubjects: async () => {
        set((state) => ({ loading: { ...state.loading, subjects: true }, error: null }));
        try {
          const response = await api.get('/practice/subjects');
          set((state) => ({
            subjects: response.data.data,
            loading: { ...state.loading, subjects: false }
          }));
        } catch (error: any) {
          set((state) => ({
            error: error.response?.data?.message || 'Failed to load subjects',
            loading: { ...state.loading, subjects: false }
          }));
        }
      },

      loadSubjectDetails: async (subjectId: number) => {
        try {
          const response = await api.get(`/practice/subjects/${subjectId}`);
          const subject = response.data.data;
          set({ 
            currentSubject: subject,
            sections: subject.sections || []
          });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to load subject details' });
        }
      },

      loadSubjectSections: async (subjectId: number) => {
        try {
          const response = await api.get(`/practice/subjects/${subjectId}/sections`);
          set({ sections: response.data.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to load sections' });
        }
      },

      loadSectionTopics: async (sectionId: number) => {
        try {
          const response = await api.get(`/practice/sections/${sectionId}/topics`);
          set({ topics: response.data.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to load topics' });
        }
      },

      loadTopicDetails: async (topicId: number) => {
        try {
          const response = await api.get(`/practice/topics/${topicId}`);
          set({ currentTopic: response.data.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to load topic details' });
        }
      },

      setCurrentSubject: (subject: Subject | null) => {
        set({ currentSubject: subject });
      },

      setCurrentTopic: (topic: Topic | null) => {
        set({ currentTopic: topic });
      },

      // Practice Session Actions
createPracticeSession: async (sessionData: any) => {
  set((state) => ({ loading: { ...state.loading, session: true }, error: null }));
  try {
    const response = await api.post('/practice/sessions', sessionData);
    const session = response.data.data;

    // Immediately fetch first batch of full questions
    const preloadRes = await api.get(
      `/practice/sessions/${session.id}/preload`,
      { params: { currentIndex: 0, count: 5 } }
    );

    const questions = preloadRes.data.data;

    set((state) => ({
      currentSession: session,
      sessionQuestions: questions || [],
      currentQuestionIndex: 0,
      currentQuestion: questions?.[0] || null,
      sessionProgress: { answered: 0, flagged: [], timeElapsed: 0 },
      loading: { ...state.loading, session: false },
    }));

    return session;
  } catch (error: any) {
    set((state) => ({
      error: error.response?.data?.message || 'Failed to create practice session',
      loading: { ...state.loading, session: false },
    }));
    throw error;
  }
},


      loadPracticeSession: async (sessionId: string) => {
        set((state) => ({ loading: { ...state.loading, session: true }, error: null }));
        try {
          const response = await api.get(`/practice/sessions/${sessionId}`);
          set((state) => ({
            currentSession: response.data.data,
            loading: { ...state.loading, session: false }
          }));
        } catch (error: any) {
          set((state) => ({
            error: error.response?.data?.message || 'Failed to load practice session',
            loading: { ...state.loading, session: false }
          }));
        }
      },

      updatePracticeSession: async (sessionId: string, updateData: any) => {
        try {
          const response = await api.put(`/practice/sessions/${sessionId}`, updateData);
          set({ currentSession: response.data.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update practice session' });
        }
      },

      completePracticeSession: async (sessionId: string) => {
        set((state) => ({ loading: { ...state.loading, summary: true }, error: null }));
        try {
          const response = await api.post(`/practice/sessions/${sessionId}/complete`);
          set((state) => ({
            sessionSummary: response.data.data,
            loading: { ...state.loading, summary: false }
          }));
        } catch (error: any) {
          set((state) => ({
            error: error.response?.data?.message || 'Failed to complete practice session',
            loading: { ...state.loading, summary: false }
          }));
        }
      },

      cancelPracticeSession: async (sessionId: string) => {
        try {
          await api.delete(`/practice/sessions/${sessionId}`);
          set({ 
            currentSession: null,
            sessionQuestions: [],
            currentQuestion: null,
            currentQuestionIndex: 0
          });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to cancel practice session' });
        }
      },

      // Question Actions
      loadSessionQuestions: async (sessionId: string) => {
        try {
          const response = await api.get(`/practice/sessions/${sessionId}/questions`);
          set({ sessionQuestions: response.data.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to load session questions' });
        }
      },

      loadCurrentQuestion: async (sessionId: string, questionIndex: number) => {
        set((state) => ({ loading: { ...state.loading, question: true }, error: null }));
        try {
          const response = await api.get(`/practice/sessions/${sessionId}/questions/${questionIndex}`);
          set((state) => ({
            currentQuestion: response.data.data,
            currentQuestionIndex: questionIndex,
            loading: { ...state.loading, question: false }
          }));
        } catch (error: any) {
          set((state) => ({
            error: error.response?.data?.message || 'Failed to load current question',
            loading: { ...state.loading, question: false }
          }));
        }
      },

      submitQuestionAttempt: async (sessionId: string, questionId: number, attemptData: {
        selectedOption: number;
        timeTaken: number;
        confidenceLevel: number;
      }) => {
        try {
          const response = await api.post(
            `/practice/sessions/${sessionId}/questions/${questionId}/attempt`,
            attemptData
          );
          
          const attempt = response.data.data;
          set((state) => ({
            questionAttempts: [...state.questionAttempts, attempt],
            sessionProgress: {
              ...state.sessionProgress,
              answered: state.sessionProgress.answered + 1
            }
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to submit question attempt' });
        }
      },

      navigateToQuestion: (index: number) => {
        const { sessionQuestions } = get();
        if (index >= 0 && index < sessionQuestions.length) {
          set({ 
            currentQuestionIndex: index,
            currentQuestion: sessionQuestions[index] || null
          });
        }
      },

      flagQuestion: (questionIndex: number) => {
        set((state) => ({
          sessionProgress: {
            ...state.sessionProgress,
            flagged: [...state.sessionProgress.flagged, questionIndex]
          }
        }));
      },

      unflagQuestion: (questionIndex: number) => {
        set((state) => ({
          sessionProgress: {
            ...state.sessionProgress,
            flagged: state.sessionProgress.flagged.filter(index => index !== questionIndex)
          }
        }));
      },

      // Smart Practice Modes
      createSmartReviewSession: async (limit = 15) => {
        try {
          const response = await api.post('/practice/sessions/smart-review', { limit });
          const session = response.data.data;
          set({
            currentSession: session,
            sessionQuestions: session.questions || [],
            currentQuestionIndex: 0
          });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create smart review session' });
        }
      },

      createAdaptiveDrillSession: async (options) => {
        try {
          const response = await api.post('/practice/sessions/adaptive-drill', options);
          const session = response.data.data;
          set({
            currentSession: session,
            sessionQuestions: session.questions || [],
            currentQuestionIndex: 0
          });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create adaptive drill session' });
        }
      },

      createTimedSprintSession: async (options) => {
        try {
          const response = await api.post('/practice/sessions/timed-sprint', options);
          const session = response.data.data;
          set({
            currentSession: session,
            sessionQuestions: session.questions || [],
            currentQuestionIndex: 0
          });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create timed sprint session' });
        }
      },

createDiagnosticSession: async (params: { subjectId: number; questionCount: number }) => {
  try {
    const response = await api.post('/practice/sessions/diagnostic', {
      subjectId: params.subjectId,
      questionCount: params.questionCount
    });
    const session = response.data.data;
    set({
      currentSession: session,
      sessionQuestions: session.questions || [],
      currentQuestionIndex: 0
    });
  } catch (error: any) {
    set({ error: error.response?.data?.message || 'Failed to create diagnostic session' });
  }
},


      // Progress & Analytics Actions
      loadUserProgress: async () => {
        try {
          const response = await api.get('/practice/progress');
          set({ userProgress: response.data.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to load user progress' });
        }
      },

  loadSubjectProgress: async (subjectId: number) => {
  try {
    const response = await api.get(`/practice/progress/subjects/${subjectId}`);
    
    set((state) => {
      if (!state.userProgress) return {}; // no update if userProgress is null

      return {
        userProgress: {
          ...state.userProgress, // keep existing overallMastery, streak, achievementCount, level
          subjectProgress: state.userProgress.subjectProgress.map(subject => 
            subject.id === subjectId ? { ...subject, ...response.data.data } : subject
          ),
        },
      };
    });
  } catch (error: any) {
    set({ error: error.response?.data?.message || 'Failed to load subject progress' });
  }
},

      loadTopicProgress: async (topicId: number) => {
        try {
          const response = await api.get(`/practice/progress/topics/${topicId}`);
          // Update current topic with progress data
          set((state) => ({
            currentTopic: state.currentTopic?.id === topicId 
              ? { ...state.currentTopic, ...response.data.data }
              : state.currentTopic
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to load topic progress' });
        }
      },

      loadPerformanceAnalytics: async (timeframe = '30d') => {
        try {
          const response = await api.get(`/practice/analytics/performance?timeframe=${timeframe}`);
          set({ performanceAnalytics: response.data.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to load performance analytics' });
        }
      },

      loadPerformanceTrends: async (options) => {
        try {
          const response = await api.get('/practice/analytics/trends', { params: options });
          set({ performanceTrends: response.data.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to load performance trends' });
        }
      },

      loadWeakAreas: async (options) => {
        try {
          const response = await api.get('/practice/analytics/weak-areas', { params: options });
          set({ weakAreas: response.data.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to load weak areas' });
        }
      },

      // Session History Actions
    loadPracticeHistory: async (options: {
      page: number;
      limit: number;
      subjectId?: number;
    }) => {
      try {
        const response = await api.get('/practice/history', { params: options });
        set({ 
          practiceHistory: response.data.data,
          // Add pagination info to state if needed
          pagination: response.data.pagination
        });
      } catch (error: any) {
        set({ error: error.response?.data?.message || 'Failed to load practice history' });
      }
    },

      loadSessionSummary: async (sessionId: string) => {
        set((state) => ({ loading: { ...state.loading, summary: true }, error: null }));
        try {
          const response = await api.get(`/practice/history/${sessionId}/summary`);
          set((state) => ({
            sessionSummary: response.data.data,
            loading: { ...state.loading, summary: false }
          }));
        } catch (error: any) {
          set((state) => ({
            error: error.response?.data?.message || 'Failed to load session summary',
            loading: { ...state.loading, summary: false }
          }));
        }
      },

      loadSessionMistakes: async (sessionId: string) => {
        try {
          const response = await api.get(`/practice/history/${sessionId}/mistakes`);
          set({ mistakes: response.data.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to load session mistakes' });
        }
      },

      reviewMistakes: async (sessionId: string) => {
        try {
          const response = await api.post(`/practice/sessions/${sessionId}/review`);
          const session = response.data.data;
          set({
            currentSession: session,
            sessionQuestions: session.questions || [],
            currentQuestionIndex: 0
          });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create review session' });
        }
      },

      // Gamification Actions
      loadAchievements: async () => {
        try {
          const response = await api.get('/practice/achievements');
          set({ achievements: response.data.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to load achievements' });
        }
      },

      loadBadges: async () => {
        try {
          const response = await api.get('/practice/badges');
          set({ badges: response.data.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to load badges' });
        }
      },

      loadCurrentStreak: async () => {
        try {
          const response = await api.get('/practice/streak/current');
          set({ currentStreak: response.data.data.count });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to load current streak' });
        }
      },

      updateStreak: async () => {
        try {
          const response = await api.post('/practice/streak/update');
          set({ currentStreak: response.data.data.count });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update streak' });
        }
      },

      loadGamificationSummary: async () => {
        try {
          const response = await api.get('/practice/gamification/summary');
          const summary = response.data.data;
          set({
            currentStreak: summary.currentStreak,
            totalPoints: summary.totalPoints,
            weeklyRank: summary.weeklyRank
          });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to load gamification summary' });
        }
      },

      // Review & Spaced Repetition Actions
      loadReviewQueue: async () => {
        try {
          const response = await api.get('/practice/review-queue');
          set({ reviewQueue: response.data.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to load review queue' });
        }
      },

      scheduleReview: async (data) => {
        try {
          await api.post('/practice/review-queue/schedule', data);
          // Optionally refresh review queue
          get().loadReviewQueue();
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to schedule review' });
        }
      },

      // AI-Driven Features
calibrateDifficulty: async (data: {
  subjectId: number;
  recentPerformance: any;
}) => {
  try {
    const response = await api.post('/practice/difficulty/calibrate', data);
    // Update difficulty calibration data
    set({ 
      difficultyCalibration: response.data.data,
      sessionConfig: {
        ...get().sessionConfig,
        difficulty: response.data.data.recommendedDifficulty
      }
    });
  } catch (error: any) {
    set({ error: error.response?.data?.message || 'Failed to calibrate difficulty' });
  }
},

// Complete the loadAdaptiveNextQuestions action
loadAdaptiveNextQuestions: async (options: {
  sessionId?: string;
  count: number;
}) => {
  try {
    const response = await api.get('/practice/next-questions', { params: options });
    set({ 
      adaptiveQuestions: response.data.data,
      // Optionally update session questions if sessionId provided
      ...(options.sessionId && {
        sessionQuestions: [...get().sessionQuestions, ...response.data.data]
      })
    });
  } catch (error: any) {
    set({ error: error.response?.data?.message || 'Failed to load adaptive questions' });
  }
},

// Complete the updateConfidenceScore action  
updateConfidenceScore: async (data: {
  questionId: number;
  confidenceLevel: number;
}) => {
  try {
    const response = await api.post('/practice/confidence/update', data);
    // Update the current question's confidence if it matches
    set((state) => ({
      currentQuestion: state.currentQuestion?.id === data.questionId
        ? { ...state.currentQuestion, confidenceLevel: data.confidenceLevel }
        : state.currentQuestion
    }));
  } catch (error: any) {
    set({ error: error.response?.data?.message || 'Failed to update confidence score' });
  }
},

// Percentile Rankings
loadUserPercentile: async (options?: { subjectId?: number; metric?: string }) => {
  try {
    const response = await api.get('/practice/analytics/percentile', { params: options });
    set({ 
      userPercentile: response.data.data,
      performanceAnalytics: {
        ...get().performanceAnalytics,
        percentile: response.data.data
      }
    });
  } catch (error: any) {
    set({ error: error.response?.data?.message || 'Failed to load user percentile' });
  }
},

// Leaderboard Management
loadLeaderboard: async (period: string = 'weekly', limit: number = 100) => {
  try {
    const response = await api.get('/practice/leaderboard', { 
      params: { period, limit } 
    });
    set({ leaderboard: response.data.data });
  } catch (error: any) {
    set({ error: error.response?.data?.message || 'Failed to load leaderboard' });
  }
},

loadUserRank: async (period: string = 'weekly') => {
  try {
    const response = await api.get('/practice/leaderboard/rank', { 
      params: { period } 
    });
    set({ 
      weeklyRank: response.data.data.rank,
      userScore: response.data.data.score 
    });
  } catch (error: any) {
    set({ error: error.response?.data?.message || 'Failed to load user rank' });
  }
},

// Sharing Progress
shareProgress: async (data: {
  achievementId: number;
  message: string;
  privacy?: string;
}) => {
  try {
    const response = await api.post('/practice/share-progress', data);
    set({ 
      sharedProgress: [...(get().sharedProgress || []), response.data.data] 
    });
  } catch (error: any) {
    set({ error: error.response?.data?.message || 'Failed to share progress' });
  }
},

// Study Plan Integration  
integratePracticeWithStudyPlan: async (data: {
  studyPlanId: number;
  practiceGoals: any;
}) => {
  try {
    const response = await api.post('/practice/integrate-study-plan', data);
    set({ studyPlanIntegration: response.data.data });
  } catch (error: any) {
    set({ error: error.response?.data?.message || 'Failed to integrate with study plan' });
  }
},

loadStudyPlanProgress: async (studyPlanId?: number) => {
  try {
    const params = studyPlanId ? { studyPlanId } : {};
    const response = await api.get('/practice/study-plan-progress', { params });
    set({ studyPlanProgress: response.data.data });
  } catch (error: any) {
    set({ error: error.response?.data?.message || 'Failed to load study plan progress' });
  }
},

// Review Schedule Management
updateReviewSchedule: async (reviewId: number, data: {
  performance: number;
  confidenceLevel: number;
}) => {
  try {
    const response = await api.put(`/practice/review-queue/${reviewId}`, data);
    // Update review queue
    await get().loadReviewQueue();
  } catch (error: any) {
    set({ error: error.response?.data?.message || 'Failed to update review schedule' });
  }
},

// Time tracking utilities
startSessionTimer: () => {
  const startTime = Date.now();
  set((state) => ({
    sessionProgress: {
      ...state.sessionProgress,
      startTime,
      timeElapsed: 0
    }
  }));
  
  // Start interval to update elapsed time
  const interval = setInterval(() => {
    const currentState = get();
    if (!currentState.currentSession) {
      clearInterval(interval);
      return;
    }
    
    set((state) => ({
      sessionProgress: {
        ...state.sessionProgress,
        timeElapsed: Date.now() - startTime
      }
    }));
  }, 1000);
},

pauseSessionTimer: () => {
  set((state) => ({
    sessionProgress: {
      ...state.sessionProgress,
      isPaused: true
    }
  }));
},

resumeSessionTimer: () => {
  set((state) => ({
    sessionProgress: {
      ...state.sessionProgress,
      isPaused: false
    }
  }));
},

// Question management utilities
shuffleSessionQuestions: () => {
  set((state) => ({
    sessionQuestions: [...state.sessionQuestions].sort(() => Math.random() - 0.5)
  }));
},

// Bulk operations for performance
loadBulkQuestions: async (questionIds: number[]) => {
  try {
    const response = await api.post('/practice/questions/bulk', { questionIds });
    set({ bulkQuestions: response.data.data });
  } catch (error: any) {
    set({ error: error.response?.data?.message || 'Failed to load bulk questions' });
  }
},

// Session state management
saveSessionState: () => {
  const state = get();
  const sessionData = {
    currentSession: state.currentSession,
    currentQuestionIndex: state.currentQuestionIndex,
    sessionProgress: state.sessionProgress,
    questionAttempts: state.questionAttempts
  };
  // Save to memory (not localStorage as per restrictions)
  set({ savedSessionState: sessionData });
},

restoreSessionState: () => {
  const state = get();
  if (state.savedSessionState) {
    set({
      currentSession: state.savedSessionState.currentSession,
      currentQuestionIndex: state.savedSessionState.currentQuestionIndex,
      sessionProgress: state.savedSessionState.sessionProgress,
      questionAttempts: state.savedSessionState.questionAttempts,
      savedSessionState: null
    });
  }
},

// Performance optimization
preloadNextQuestions: async (count: number = 5) => {
  const state = get();
  if (!state.currentSession) return;
  
  try {
    const response = await api.get(`/practice/sessions/${state.currentSession.id}/preload`, {
      params: { 
        currentIndex: state.currentQuestionIndex,
        count 
      }
    });
    set({ preloadedQuestions: response.data.data });
  } catch (error: any) {
    console.error('Failed to preload questions:', error);
  }
},

// Enhanced error handling
retryFailedAction: async (actionName: string, ...args: any[]) => {
  const state = get();
  const action = (state as any)[actionName];
  
  if (typeof action === 'function') {
    try {
      await action(...args);
      set({ error: null });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || `Failed to retry ${actionName}`,
        lastFailedAction: { actionName, args }
      });
    }
  }
},

// ==========================================
// ENHANCED ANALYTICS METHODS
// ==========================================

// Real-time performance tracking
trackQuestionTime: (questionId: number, startTime: number) => {
  const endTime = Date.now();
  const timeTaken = endTime - startTime;
  
  set((state) => ({
    questionTimes: {
      ...state.questionTimes,
      [questionId]: timeTaken
    }
  }));
},

// Session performance insights
getSessionInsights: () => {
  const state = get();
  if (!state.questionAttempts.length) return null;
  
  const correctCount = state.questionAttempts.filter(a => a.isCorrect).length;
  const accuracy = correctCount / state.questionAttempts.length;
  const avgTime = state.questionAttempts.reduce((sum, a) => sum + a.timeTaken, 0) / state.questionAttempts.length;
  
  return {
    accuracy,
    avgTime: avgTime / 1000, // Convert to seconds
    questionsAnswered: state.questionAttempts.length,
    streak: state.calculateCurrentStreak(),
    strongTopics: state.getStrongTopics(),
    weakTopics: state.getWeakTopics()
  };
},

calculateCurrentStreak: () => {
  const state = get();
  let streak = 0;
  
  // Calculate streak from recent attempts
  for (let i = state.questionAttempts.length - 1; i >= 0; i--) {
    if (state.questionAttempts[i].isCorrect) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
},

getStrongTopics: () => {
  const state = get();
  const questionsById = new Map<number, Question>(
    state.questions.map((q) => [q.id, q])
  );

  const topicPerformance = new Map<number, { correct: number; total: number; topicName: string }>();

  state.questionAttempts.forEach((attempt) => {
    const question = questionsById.get(attempt.questionId);
    if (!question || !question.topic) return;

    const { id: topicId, name: topicName } = question.topic;

    if (!topicPerformance.has(topicId)) {
      topicPerformance.set(topicId, { correct: 0, total: 0, topicName });
    }

    const performance = topicPerformance.get(topicId)!;
    performance.total++;
    if (attempt.isCorrect) performance.correct++;
  });

  return Array.from(topicPerformance.entries())
    .map(([topicId, data]) => ({
      topicId,
      topicName: data.topicName,
      accuracy: data.correct / data.total,
      questionsAnswered: data.total,
    }))
    .filter((topic) => topic.accuracy >= 0.8 && topic.questionsAnswered >= 3)
    .sort((a, b) => b.accuracy - a.accuracy);
},

getWeakTopics: () => {
  const state = get();
  const questionsById = new Map<number, Question>(
    state.questions.map((q) => [q.id, q])
  );

  const topicPerformance = new Map<number, { correct: number; total: number; topicName: string }>();

  state.questionAttempts.forEach((attempt) => {
    const question = questionsById.get(attempt.questionId);
    if (!question || !question.topic) return;

    const { id: topicId, name: topicName } = question.topic;

    if (!topicPerformance.has(topicId)) {
      topicPerformance.set(topicId, { correct: 0, total: 0, topicName });
    }

    const performance = topicPerformance.get(topicId)!;
    performance.total++;
    if (attempt.isCorrect) performance.correct++;
  });

  return Array.from(topicPerformance.entries())
    .map(([topicId, data]) => ({
      topicId,
      topicName: data.topicName,
      accuracy: data.correct / data.total,
      questionsAnswered: data.total,
    }))
    .filter((topic) => topic.accuracy < 0.6 && topic.questionsAnswered >= 3)
    .sort((a, b) => a.accuracy - b.accuracy);
}
    })
  )   
);