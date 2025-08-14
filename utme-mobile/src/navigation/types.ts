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

export type RootStackParamList = {
  Auth: undefined;
  EmailVerification: { email: string };
  Welcome: undefined;
  SubjectSelection: undefined;
  CourseSelection: { selectedSubjects: string[] };
  GoalSetting: { selectedSubjects: string[]; aspiringCourse: string; suggestedScore: number };
  DiagnosticAssessment: { selectedSubjects: string[]; aspiringCourse: string; goalScore: number; learningStyle: string };
  AssessmentResults: { subjectProficiency: Array<{ subject: string; proficiency: number }>; goalScore: number; aspiringCourse: string };
  MainTabs: undefined;
};

// types/navigation.ts
export type MockExamStackParamList = {
  MockExamHome: undefined;
  MockExamSession: undefined; // example param
  MockExamResult: { examId: number };
  MockExamHistory: undefined;
};
