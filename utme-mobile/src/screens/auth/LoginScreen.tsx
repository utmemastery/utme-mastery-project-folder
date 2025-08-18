import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { useAuthStore } from '../../stores/authStore';
import { AuthStackParamList } from '../../navigation/types';
import { Header } from '../../components/login/Header';
import { LoginForm } from '../../components/login/LoginForm';
import { BackgroundDecorations } from '../../components/login/BackgroundDecorations';
import { FooterLinks } from '../../components/login/FooterLinks';
import { useLoginForm } from '../../hooks/useLoginForm';
import { useScreenAnimation } from '../../hooks/useScreenAnimation';
import { styles } from '../../styles/login';

type LoginScreenProps = StackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const form = useLoginForm(navigation);
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
      <BackgroundDecorations />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoiding}
        >
          <ScrollView contentContainerStyle={styles.scrollView}>
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <Header title="Welcome Back" subtitle="Continue your journey to UTME excellence" />
              <LoginForm {...form} navigation={navigation} />
              <FooterLinks navigation={navigation} />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};