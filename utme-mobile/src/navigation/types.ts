export type EmailVerificationParams = {
  email: string;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  EmailVerification: EmailVerificationParams;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  EmailVerification: { email: string };  // Required param
  Onboarding: undefined;
  MainTabs: undefined;
};
