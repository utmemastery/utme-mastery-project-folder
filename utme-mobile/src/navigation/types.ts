export type EmailVerificationParams = {
  email: string;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  EmailVerification: EmailVerificationParams;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  Onboarding: undefined;
  MainTabs: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  SubjectSelection: undefined;
  CourseSelection: { selectedSubjects: string[] };
  GoalSetting: {
    selectedSubjects: string[];
    aspiringCourse: string;
    suggestedScore: number;
  };
  DiagnosticAssessment: {
    selectedSubjects: string[];
    aspiringCourse: string;
    goalScore: number;
    learningStyle: string;
  };
  AssessmentResults: {
    subjectProficiency: Array<{ subject: string; proficiency: number }>;
    goalScore: number;
    aspiringCourse: string;
    selectedSubjects: string[];
    learningStyle: string;
  };
};

export type RootStackParamList = {
  Auth: undefined;           // Points to AuthStack
  MainTabs: undefined;       // Points to MainTabs stack
  Onboarding: undefined;     // Points to Onboarding stack
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
  SubjectDetail: { subject: string };
  WeakTopics: undefined;
  TopicPractice: { topicId: number };
  StudyPlan: undefined;
};


export type MainTabParamList = {
  Dashboard: undefined;
  Practice: undefined;
  Flashcards: undefined;
  MockExam: undefined;
  Profile: undefined;
};

export type PracticeStackParamList = {
  PracticeHome: undefined;
  PracticeSession: { topicId?: number; sessionId?: string };
  SubjectSelection: { subjectId: string };
  PostPracticeAnalysis: { sessionId: string };
  ReviewMistakes: { sessionId: string };
};

export type MockExamStackParamList = {
  MockExamHome: undefined;
  MockExamSession: undefined;
  MockExamResult: { examId: number };
  MockExamHistory: undefined;
};
