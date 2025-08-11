// mobile/src/screens/LoadingScreen.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LoadingScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#F9FAFB'
      }}>
        <View style={{
          width: 120,
          height: 120,
          backgroundColor: '#3B82F6',
          borderRadius: 60,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 32
        }}>
          <Text style={{ fontSize: 48, color: 'white' }}>🎯</Text>
        </View>
        
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: '#1F2937',
          marginBottom: 8
        }}>
          UTME Mastery
        </Text>
        
        <Text style={{ 
          fontSize: 16, 
          color: '#6B7280',
          marginBottom: 32
        }}>
          Loading your learning journey...
        </Text>
        
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    </SafeAreaView>
  );
};