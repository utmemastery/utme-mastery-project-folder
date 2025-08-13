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

const Stack = createStackNavigator<RootStackParamList>();

export const OnboardingNavigator = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const restoreProgress = async () => {
      const progress = await AsyncStorage.getItem('onboardingProgress');
      if (progress) {
        const { selectedSubjects, aspiringCourse, goalScore, learningStyle } = JSON.parse(progress);
        if (selectedSubjects?.length >= 4 && aspiringCourse && goalScore && learningStyle) {
          navigation.navigate('DiagnosticAssessment', { selectedSubjects, aspiringCourse, goalScore, learningStyle });
        } else if (selectedSubjects?.length >= 4 && aspiringCourse) {
          navigation.navigate('GoalSetting', { selectedSubjects, aspiringCourse, suggestedScore: 300 });
        } else if (selectedSubjects?.length >= 4) {
          navigation.navigate('CourseSelection', { selectedSubjects });
        }
      }
    };
    restoreProgress();
  }, [navigation]);

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