// mobile/src/navigation/FlashcardNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { FlashcardHomeScreen } from '../screens/flashcards/FlashcardHomeScreen';
import { FlashcardReviewScreen } from '../screens/flashcards/FlashcardReviewScreen';

const Stack = createStackNavigator();

export const FlashcardNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FlashcardHome" component={FlashcardHomeScreen} />
      <Stack.Screen name="FlashcardReview" component={FlashcardReviewScreen} />
    </Stack.Navigator>
  );
};