import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Alert, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { globalStyles } from '../../styles/global';
import { COLORS, SIZES } from '../../constants';
import { debounce } from 'lodash';

interface EmailVerificationFormProps {
  email: string;
  navigation: StackScreenProps<AuthStackParamList, 'EmailVerification'>['navigation'];
}

export const EmailVerificationForm: React.FC<EmailVerificationFormProps> = ({ email, navigation }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const { verifyEmail, isLoading, clearError } = useAuthStore();
  const inputRefs = useRef<(TextInput | null)[]>(Array(6).fill(null));

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) return; // Limit to single character
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit !== '') && text) {
      handleVerification(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerification = debounce(async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    clearError();
    setError('');

    try {
      await verifyEmail(email, codeToVerify);
      Alert.alert(
        'Success! 🎉',
        'Email verified successfully',
        [{ text: 'Continue', onPress: () => navigation.replace('Onboarding') }],
        { cancelable: false }
      );
    } catch (error) {
      setCode(['', '', '', '', '', '']);
      setError('Invalid code. Please try again.');
    }
  }, 300);

  return (
    <View style={styles.formContainer}>
<View style={styles.codeContainer}>
  {code.map((digit, index) => (
    <TextInput
      key={index}
      ref={(ref) => {
        inputRefs.current[index] = ref;
      }}
      style={[
        styles.codeInput,
        error && { borderColor: COLORS.error },
        code[index] && { borderColor: COLORS.primary },
      ]}
      value={digit}
      onChangeText={(text) => handleCodeChange(text, index)}
      onKeyPress={(e) => handleKeyPress(e, index)}
      keyboardType="numeric"
      maxLength={1}
      autoCapitalize="none"
      textAlign="center"
      accessibilityLabel={`Verification code digit ${index + 1}`}
      accessibilityRole="text"
    />
  ))}
</View>

      {error && (
        <View style={globalStyles.errorContainer}>
          <Text style={globalStyles.errorText}>{error}</Text>
        </View>
      )}
      <Button
        title={isLoading ? 'Verifying...' : 'Verify Email ✨'}
        onPress={() => handleVerification()}
        disabled={code.some(digit => digit === '') || isLoading}
        variant="primary"
        size="large"
        accessibilityLabel="Verify Email"
        accessibilityRole="button"
        accessibilityState={{ disabled: code.some(digit => digit === '') || isLoading }}
        style={{ marginBottom: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: COLORS.formBackground,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.cardPadding,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.formBorder,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  codeInput: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.textTertiary,
    backgroundColor: COLORS.white,
    fontSize: SIZES.largeText,
    textAlign: 'center',
    color: COLORS.textPrimary,
  },
});