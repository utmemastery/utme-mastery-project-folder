import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';
import { Alert } from 'react-native';

interface LoginError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export const useLoginForm = (navigation: StackScreenProps<AuthStackParamList, 'Login'>['navigation']) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();

  const validateForm = () => {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    return isValid;
  };

const handleLogin = async () => {
  if (!validateForm()) return;
  clearError();
  try {
    await login(email, password);
  } catch (error: unknown) {
    const typedError = error as LoginError; // 👈 safely narrow
    if (typedError.response?.data?.error === 'Please verify your email before logging in') {
      Alert.alert(
        'Email Verification Required',
        'Please verify your email before logging in. Check your inbox for the verification code.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Verify Now', onPress: () => navigation.navigate('EmailVerification', { email }) },
        ]
      );
    }
  }
};

  return {
    email,
    setEmail,
    password,
    setPassword,
    emailError,
    passwordError,
    showPassword,
    toggleShowPassword: () => setShowPassword(!showPassword),
    handleLogin,
    isLoading,
    error,
  };
};