import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { AuthService } from '../../services/authService';
import { COLORS, SIZES } from '../../constants';

interface ResendCodeSectionProps {
  email: string;
}

export const ResendCodeSection: React.FC<ResendCodeSectionProps> = ({ email }) => {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResendCode = async () => {
    setIsResendLoading(true);
    try {
      await AuthService.resendVerificationCode(email);
      setCountdown(60);
      setCanResend(false);
      Alert.alert('Success', 'Verification code sent successfully', [], { cancelable: false });
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setIsResendLoading(false);
    }
  };

  return (
    <View style={styles.resendContainer}>
      <Text style={styles.resendText}>Didn't receive the code? 🤔</Text>
      <TouchableOpacity
        onPress={handleResendCode}
        disabled={!canResend || isResendLoading}
        style={[
          styles.resendButton,
          { 
            backgroundColor: canResend && !isResendLoading ? COLORS.formBackground : COLORS.disabled,
            borderColor: canResend && !isResendLoading ? COLORS.primary : COLORS.textTertiary,
          },
        ]}
        accessibilityLabel={canResend ? 'Resend verification code' : `Resend in ${countdown} seconds`}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canResend || isResendLoading }}
      >
        <Text
          style={[
            styles.resendButtonText,
            { color: canResend && !isResendLoading ? COLORS.primary : COLORS.textTertiary },
          ]}
        >
          {isResendLoading ? 'Sending... ⏳' : canResend ? 'Resend Code 🔄' : `Resend in ${countdown}s ⏰`}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.mediumText,
    marginBottom: 12,
    textAlign: 'center',
  },
  resendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  resendButtonText: {
    fontSize: SIZES.linkText,
    fontWeight: '600',
  },
});