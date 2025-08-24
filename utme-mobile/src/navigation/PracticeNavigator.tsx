import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { PracticeHomeScreen } from '../screens/practice/PracticeHomeScreen';
import { PracticeSessionScreen } from '../screens/practice/PracticeSessionScreen';
import { PostPracticeAnalysisScreen } from '../screens/practice/PostPracticeAnalysisScreen';
import { SubjectSelectionScreen } from '../screens/practice/SubjectSelectionScreen';
import { ReviewMistakesScreen } from '../screens/practice/ReviewMistakesScreen';
import { PracticeStackParamList } from './types';

const Stack = createStackNavigator<PracticeStackParamList>();

export const PracticeNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PracticeHome" component={PracticeHomeScreen} />
      <Stack.Screen name="PracticeSession" component={PracticeSessionScreen} />
      <Stack.Screen name="SubjectSelection" component={SubjectSelectionScreen} />
      <Stack.Screen name="PostPracticeAnalysis" component={PostPracticeAnalysisScreen} />
      <Stack.Screen name="ReviewMistakes" component={ReviewMistakesScreen} />
    </Stack.Navigator>
  );
};
