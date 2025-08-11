// mobile/src/navigation/OnboardingNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { SubjectSelectionScreen } from '../screens/onboarding/SubjectSelectionScreen';
import { CourseSelectionScreen } from '../screens/onboarding/CourseSelectionScreen';
import { GoalSettingScreen } from '../screens/onboarding/GoalSettingScreen';
import { DiagnosticAssessmentScreen } from '../screens/onboarding/DiagnosticAssessmentScreen';
import { AssessmentResultsScreen } from '../screens/onboarding/AssessmentResultsScreen';

const Stack = createStackNavigator();

export const OnboardingNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: 'white' }
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SubjectSelection" component={SubjectSelectionScreen} />
      <Stack.Screen name="CourseSelection" component={CourseSelectionScreen} />
      <Stack.Screen name="GoalSetting" component={GoalSettingScreen} />
      <Stack.Screen name="DiagnosticAssessment" component={DiagnosticAssessmentScreen} />
      <Stack.Screen name="AssessmentResults" component={AssessmentResultsScreen} />
    </Stack.Navigator>
  );
};