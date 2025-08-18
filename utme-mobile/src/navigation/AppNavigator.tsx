// AppNavigator.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onboardingNavigationRef } from './navigationRef';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/authStore';
import { MainTabNavigator } from './MainTabNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { AuthNavigator } from './AuthNavigator';
import { LoadingScreen } from '../screens/LoadingScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const { user, isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      await initializeAuth();
      setIsInitializing(false);
    };

    initializeApp();
  }, []);

  useEffect(() => {
    console.log('AppNavigator state:', {
      isAuthenticated,
      isLoading,
      isInitializing,
      onboardingDone: user?.onboardingDone,
      user: user ? { ...user, diagnosticResults: user.diagnosticResults?.length } : null,
    });
  }, [isAuthenticated, isLoading, isInitializing, user]);

  if (isInitializing || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      ref={onboardingNavigationRef}
      onStateChange={(state) => {
        console.log('Navigation state changed:', JSON.stringify(state, null, 2));
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen
            name={user?.onboardingDone ? 'MainTabs' : 'Onboarding'}
            component={user?.onboardingDone ? MainTabNavigator : OnboardingNavigator}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};