// AppNavigator.tsx
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { onboardingNavigationRef } from "./navigationRef";
import { useAuthStore } from "../stores/authStore";
import { MainTabNavigator } from "./MainTabNavigator";
import { OnboardingNavigator } from "./OnboardingNavigator";
import { AuthNavigator } from "./AuthNavigator";
import { LoadingScreen } from "../screens/LoadingScreen";

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const { user, isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const [hasInitAttempted, setHasInitAttempted] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeAuth();
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        setHasInitAttempted(true);
      }
    };
    initializeApp();
  }, []);

  if (!hasInitAttempted || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer ref={onboardingNavigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user ? (
          <Stack.Screen
            name={user.onboardingDone ? "MainTabs" : "Onboarding"}
            component={user.onboardingDone ? MainTabNavigator : OnboardingNavigator}
          />
        ) : (
          <Stack.Screen name="Loading" component={LoadingScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
