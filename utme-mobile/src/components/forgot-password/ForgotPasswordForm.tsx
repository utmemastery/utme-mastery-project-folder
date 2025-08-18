import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { globalStyles } from '../../styles/global';
import { COLORS, SIZES } from '../../constants';

interface ForgotPasswordFormProps {
  navigation: StackScreenProps<AuthStackParamList, 'ForgotPassword'>['navigation'];
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) return;
    clearError();
    try {
      await forgotPassword(email);
      Alert.alert(
        'Success! 🎉',
        'A password reset link has been sent to your email',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
        { cancelable: false }
      );
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <View style={styles.formContainer}>
      <Input
        label="Email Address"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        error={emailError}
        style={globalStyles.input}
        inputStyle={globalStyles.inputText}
        labelStyle={globalStyles.label}
        accessibilityLabel="Email input"
        accessibilityRole="text"
      />
      {error && (
        <View style={globalStyles.errorContainer}>
          <Text style={globalStyles.errorText}>{error}</Text>
        </View>
      )}
      <Button
        title={isLoading ? 'Sending Link...' : 'Send Reset Link 📨'}
        onPress={handleForgotPassword}
        disabled={isLoading}
        variant="primary"
        size="large"
        accessibilityLabel="Send Reset Link"
        accessibilityRole="button"
        accessibilityState={{ disabled: isLoading }}
        style={{ marginBottom: 16, marginTop: 20, alignItems: 'center', borderRadius: SIZES.smallBorderRadius }}
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
});