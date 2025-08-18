// navigationRef.ts
import { createNavigationContainerRef } from '@react-navigation/native';
import { OnboardingStackParamList } from '../navigation/types';

export const onboardingNavigationRef =
  createNavigationContainerRef<OnboardingStackParamList>();
