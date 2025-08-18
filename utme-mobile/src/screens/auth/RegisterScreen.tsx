import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { RegisterHeader } from '../../components/register/RegisterHeader';
import { RegisterForm } from '../../components/register/RegisterForm';
import { RegisterFooter } from '../../components/register/RegisterFooter';
import { useScreenAnimation } from '../../hooks/useScreenAnimation';
import { COLORS, LAYOUT } from '../../constants';

type RegisterScreenProps = StackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?.emailVerified) {
      if (user.onboardingDone) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Onboarding');
      }
    }
  }, [isAuthenticated, user, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoiding}
        >
          <ScrollView contentContainerStyle={styles.scrollView}>
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <RegisterHeader />
              <RegisterForm navigation={navigation} />
              <RegisterFooter navigation={navigation} />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background
  },
  orbTop: {
    position: 'absolute',
    top: LAYOUT.orbTopOffset,
    left: -0.1 * LAYOUT.orbTopSize,
    width: LAYOUT.orbTopSize,
    height: LAYOUT.orbTopSize,
    borderRadius: LAYOUT.orbTopSize / 2,
    backgroundColor: COLORS.orbBlue,
    transform: [{ rotate: '30deg' }],
  },
  orbBottom: {
    position: 'absolute',
    bottom: LAYOUT.orbBottomOffset,
    right: -0.15 * LAYOUT.orbBottomSize,
    width: LAYOUT.orbBottomSize,
    height: LAYOUT.orbBottomSize,
    borderRadius: LAYOUT.orbBottomSize / 2,
    backgroundColor: COLORS.orbGold,
    transform: [{ rotate: '-45deg' }],
  },
  safeArea: { 
    flex: 1 
  },
  keyboardAvoiding: { 
    flex: 1 
  },
  scrollView: { 
    flexGrow: 1 
  },
  content: { 
    flex: 1, 
    padding: 24 
  },
});