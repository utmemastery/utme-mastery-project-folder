// mobile/App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import * as Sentry from '@sentry/react-native';
import { NODE_ENV, SENTRY_DSN } from '@env' // Ensure you have this in your .env file

Sentry.init({
  dsn: SENTRY_DSN || "", // Get from Sentry dashboard
  environment: NODE_ENV || 'development',
});

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}