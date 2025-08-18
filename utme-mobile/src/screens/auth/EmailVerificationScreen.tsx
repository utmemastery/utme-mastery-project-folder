import React, { useEffect } from 'react';
import { View, ScrollView, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { EmailVerificationHeader } from '../../components/email-verification/EmailVerificationHeader';
import { EmailVerificationForm } from '../../components/email-verification/EmailVerificationForm';
import { ResendCodeSection } from '../../components/email-verification/ResendCodeSection';
import { EmailVerificationFooter } from '../../components/email-verification/EmailVerificationFooter';
import { useScreenAnimation } from '../../hooks/useScreenAnimation';
import { COLORS, LAYOUT } from '../../constants';

type EmailVerificationScreenProps = StackScreenProps<AuthStackParamList, 'EmailVerification'>;

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ navigation, route }) => {
  const { email } = route.params;
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
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <EmailVerificationHeader email={email} />
            <EmailVerificationForm email={email} navigation={navigation} />
            <ResendCodeSection email={email} />
            <EmailVerificationFooter navigation={navigation} />
          </Animated.View>
        </ScrollView>
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
    right: -0.25 * LAYOUT.orbTopSize,
    width: LAYOUT.orbTopSize,
    height: LAYOUT.orbTopSize,
    borderRadius: LAYOUT.orbTopSize / 2,
    backgroundColor: COLORS.orbBlue,
    transform: [{ rotate: '20deg' }],
  },
  orbBottom: {
    position: 'absolute',
    bottom: LAYOUT.orbBottomOffset,
    left: -0.2 * LAYOUT.orbBottomSize,
    width: LAYOUT.orbBottomSize,
    height: LAYOUT.orbBottomSize,
    borderRadius: LAYOUT.orbBottomSize / 2,
    backgroundColor: COLORS.orbGold,
    transform: [{ rotate: '-40deg' }],
  },
  safeArea: { 
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