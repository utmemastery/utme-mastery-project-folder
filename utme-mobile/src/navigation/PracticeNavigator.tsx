// mobile/src/navigation/PracticeNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { PracticeHomeScreen } from '../screens/practice/PracticeHomeScreen';
import { PracticeSessionScreen } from '../screens/practice/PracticeSessionScreen';
import { PracticeResultsScreen } from '../screens/practice/PracticeResultsScreen';

const Stack = createStackNavigator();

export const PracticeNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PracticeHome" component={PracticeHomeScreen} />
      <Stack.Screen name="PracticeSession" component={PracticeSessionScreen} />
      <Stack.Screen name="PracticeResults" component={PracticeResultsScreen} />
    </Stack.Navigator>
  );
};