// OnboardingNavigator.tsx
import { CommonActions } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { onboardingNavigationRef } from './navigationRef';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/authStore';
import { OnboardingStackParamList } from './types';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { SubjectSelectionScreen } from '../screens/onboarding/SubjectSelectionScreen';
import { CourseSelectionScreen } from '../screens/onboarding/CourseSelectionScreen';
import { GoalSettingScreen } from '../screens/onboarding/GoalSettingScreen';
import { DiagnosticAssessmentScreen } from '../screens/onboarding/DiagnosticAssessmentScreen';
import { AssessmentResultsScreen } from '../screens/onboarding/AssessmentResultsScreen';

const Stack = createStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = () => {
  const { user } = useAuthStore();
  const route = useRoute();
  const hasRestored = useRef(false);

  useEffect(() => {
    if (hasRestored.current || user?.onboardingDone) return;

    const restoreProgress = async () => {
      hasRestored.current = true;

      const progressStr = await AsyncStorage.getItem('onboardingProgress');
      if (!progressStr) return;

      try {
        const progress = JSON.parse(progressStr);
        const { selectedSubjects, aspiringCourse, goalScore, learningStyle, done } =
          progress;

        if (done) return;

        let targetScreen: keyof OnboardingStackParamList = 'Welcome';
        let params: any = {};

        if (
          selectedSubjects?.length >= 4 &&
          aspiringCourse &&
          goalScore &&
          learningStyle
        ) {
          targetScreen = 'DiagnosticAssessment';
          params = { selectedSubjects, aspiringCourse, goalScore, learningStyle };
        } else if (selectedSubjects?.length >= 4 && aspiringCourse) {
          targetScreen = 'GoalSetting';
          params = { selectedSubjects, aspiringCourse, suggestedScore: 300 };
        } else if (selectedSubjects?.length >= 4) {
          targetScreen = 'CourseSelection';
          params = { selectedSubjects };
        }

        // Only reset if the current screen is different
        if (
          onboardingNavigationRef.isReady() &&
          route.name !== targetScreen
        ) {
          onboardingNavigationRef.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: targetScreen, params }],
            })
          );
        }
      } catch (error) {
        console.error('Error parsing onboarding progress:', error);
        await AsyncStorage.removeItem('onboardingProgress');
      }
    };

    restoreProgress();
  }, [user?.onboardingDone, route.name]);

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, cardStyle: { backgroundColor: 'white' } }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SubjectSelection" component={SubjectSelectionScreen} />
      <Stack.Screen name="CourseSelection" component={CourseSelectionScreen} />
      <Stack.Screen name="GoalSetting" component={GoalSettingScreen} />
      <Stack.Screen
        name="DiagnosticAssessment"
        component={DiagnosticAssessmentScreen}
      />
      <Stack.Screen
        name="AssessmentResults"
        component={AssessmentResultsScreen}
      />
    </Stack.Navigator>
  );
};