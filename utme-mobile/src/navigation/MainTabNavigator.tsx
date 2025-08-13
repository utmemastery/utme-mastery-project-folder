// mobile/src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { PracticeNavigator } from './PracticeNavigator';
import { StudyPlanScreen } from '../screens/study/StudyPlanScreen';
import { FlashcardNavigator } from './FlashcardNavigator';
import { MockExamNavigator } from './MockExamNavigator';

const Tab = createBottomTabNavigator();

const TabIcon: React.FC<{ 
  name: string; 
  focused: boolean; 
  icon: string;
  label: string;
}> = ({ focused, icon, label }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 8 }}>
    <Text style={{ 
      fontSize: 20, 
      marginBottom: 4,
      opacity: focused ? 1 : 0.6 
    }}>
      {icon}
    </Text>
    <Text style={{ 
      fontSize: 12, 
      color: focused ? '#3B82F6' : '#9CA3AF',
      fontWeight: focused ? '600' : 'normal'
    }}>
      {label}
    </Text>
  </View>
);

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 85,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3
        },
        tabBarShowLabel: false
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🏠" label="Home" name="Dashboard" />
          )
        }}
      />
      <Tab.Screen 
        name="Practice" 
        component={PracticeNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🎮" label="Practice" name="Practice" />
          )
        }}
      />
      <Tab.Screen 
        name="StudyPlan" 
        component={StudyPlanScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="📅" label="Study Plan" name="StudyPlan" />
          )
        }}
      />
      <Tab.Screen 
        name="Flashcards" 
        component={FlashcardNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🗂️" label="Flashcards" name="Flashcards" />
          )
        }}
      />
      <Tab.Screen 
        name="MockExam" 
        component={MockExamNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="📋" label="Mock Exam" name="MockExam" />
          )
        }}
      />
    </Tab.Navigator>
  );
};