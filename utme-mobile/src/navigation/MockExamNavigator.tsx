// mobile/src/navigation/MockExamNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MockExamHomeScreen } from '../screens/mockExam/MockExamHomeScreen';
import { MockExamSessionScreen } from '../screens/mockExam/MockExamSessionScreen';

const Stack = createStackNavigator();

export const MockExamNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MockExamHome" component={MockExamHomeScreen} />
      <Stack.Screen name="MockExamSession" component={MockExamSessionScreen} />
    </Stack.Navigator>
  );
};