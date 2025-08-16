import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { SubjectSelectionScreen } from '../screens/onboarding/SubjectSelectionScreen';
import { CourseSelectionScreen } from '../screens/onboarding/CourseSelectionScreen';
import { GoalSettingScreen } from '../screens/onboarding/GoalSettingScreen';
import { DiagnosticAssessmentScreen } from '../screens/onboarding/DiagnosticAssessmentScreen';
import { AssessmentResultsScreen } from '../screens/onboarding/AssessmentResultsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from './types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';

const Stack = createStackNavigator<RootStackParamList>();

export const OnboardingNavigator = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const restoreProgress = async () => {
      if (user?.onboardingDone) {
        console.log('Onboarding done, skipping progress restoration');
        await AsyncStorage.removeItem('onboardingProgress'); // Clear any stale progress
        return;
      }
      const progress = await AsyncStorage.getItem('onboardingProgress');
      if (!progress) {
        console.log('No onboarding progress found');
        return;
      }

      try {
        const parsed = JSON.parse(progress);
        if (!parsed || typeof parsed !== 'object') {
          console.log('Invalid onboarding progress, clearing');
          await AsyncStorage.removeItem('onboardingProgress');
          return;
        }

        const { selectedSubjects, aspiringCourse, goalScore, learningStyle } = parsed;
        console.log('Restoring progress:', parsed);

  if (selectedSubjects?.length >= 4 && aspiringCourse && goalScore && learningStyle) {
  navigation.navigate('DiagnosticAssessment', {
    selectedSubjects,
    aspiringCourse,
    goalScore,
    learningStyle
  });
} else if (selectedSubjects?.length >= 4 && aspiringCourse) {
  navigation.navigate('GoalSetting', {
    selectedSubjects,
    aspiringCourse,
    suggestedScore: 300
  });
} else if (selectedSubjects?.length >= 4) {
  navigation.navigate('CourseSelection', {
    selectedSubjects
  });
}

      } catch (error) {
        console.error('Error parsing onboarding progress:', error);
        await AsyncStorage.removeItem('onboardingProgress');
      }
    };

    restoreProgress();
  }, [navigation, user?.onboardingDone]);

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