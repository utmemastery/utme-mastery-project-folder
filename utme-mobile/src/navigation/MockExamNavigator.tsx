// mobile/src/navigation/MockExamNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { MockExamHomeScreen } from '../screens/mockExam/MockExamHomeScreen';
import { MockExamSessionScreen } from '../screens/mockExam/MockExamSessionScreen';
import { MockExamHistoryScreen } from '../screens/mockExam/MockExamHistoryScreen';
import { MockExamResultsScreen } from '../screens/mockExam/MockExamResultsScreen';
import type { MockExamStackParamList } from '../navigation/types';

const Stack = createStackNavigator<MockExamStackParamList>();

export const MockExamNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MockExamHome" component={MockExamHomeScreen} />
      <Stack.Screen name="MockExamSession" component={MockExamSessionScreen} />
      <Stack.Screen name="MockExamResult" component={MockExamResultsScreen} />
      <Stack.Screen name="MockExamHistory" component={MockExamHistoryScreen} />
    </Stack.Navigator>
  );
};
