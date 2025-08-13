export type EmailVerificationParams = {
  email: string;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  EmailVerification: EmailVerificationParams;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
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