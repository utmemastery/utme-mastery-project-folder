import React, { useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { ResetPasswordHeader } from '../../components/reset-password/ResetPasswordHeader';
import { ResetPasswordForm } from '../../components/reset-password/ResetPasswordForm';
import { PasswordRequirements } from '../../components/reset-password/PasswordRequirements';
import { ResetPasswordFooter } from '../../components/reset-password/ResetPasswordFooter';
import { useScreenAnimation } from '../../hooks/useScreenAnimation';
import { COLORS, LAYOUT } from '../../constants';

type ResetPasswordScreenProps = StackScreenProps<AuthStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const { token } = route.params;
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
              <ResetPasswordHeader />
              <ResetPasswordForm navigation={navigation} token={token} />
              <PasswordRequirements />
              <ResetPasswordFooter navigation={navigation} />
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
    left: -0.2 * LAYOUT.orbTopSize,
    width: LAYOUT.orbTopSize,
    height: LAYOUT.orbTopSize,
    borderRadius: LAYOUT.orbTopSize / 2,
    backgroundColor: COLORS.orbBlue,
    transform: [{ rotate: '30deg' }],
  },
  orbBottom: {
    position: 'absolute',
    bottom: LAYOUT.orbBottomOffset,
    right: -0.25 * LAYOUT.orbBottomSize,
    width: LAYOUT.orbBottomSize,
    height: LAYOUT.orbBottomSize,
    borderRadius: LAYOUT.orbBottomSize / 2,
    backgroundColor: COLORS.orbGold,
    transform: [{ rotate: '-25deg' }],
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
    padding: 24,
    justifyContent: 'center' 
  },
});