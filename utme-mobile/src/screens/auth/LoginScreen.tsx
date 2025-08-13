import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';

type LoginScreenProps = StackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?.emailVerified) {
      if (user.onboardingDone) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Onboarding');
      }
    }
  }, [isAuthenticated, user, navigation]);

  const validateForm = () => {
    let isValid = true;
    
    // Email validation
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

    // Password validation
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
    } catch (error: any) {
      if (error.response?.data?.error === 'Please verify your email before logging in') {
        Alert.alert(
          'Email Verification Required',
          'Please verify your email before logging in. Check your inbox for the verification code.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Verify Now', 
              onPress: () => navigation.navigate('EmailVerification', { email }) 
            }
          ]
        );
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, padding: 24 }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 40 }}>
              <View style={{
                width: 80,
                height: 80,
                backgroundColor: '#3B82F6',
                borderRadius: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16
              }}>
                <Text style={{ fontSize: 32, color: 'white' }}>🧠</Text>
              </View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
                Welcome Back!
              </Text>
              <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
                Continue your journey to UTME excellence
              </Text>
            </View>

            {/* Form */}
            <View style={{ flex: 1 }}>
              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                error={emailError}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                error={passwordError}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Text style={{ color: '#3B82F6' }}>{showPassword ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                }
              />

              {error && (
                <Text style={{ color: '#EF4444', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
                  {error}
                </Text>
              )}

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                style={{ marginBottom: 16 }}
              />

              <TouchableOpacity 
                onPress={() => navigation.navigate('ForgotPassword')}
                style={{ alignItems: 'center', marginBottom: 32 }}
              >
                <Text style={{ color: '#3B82F6', fontSize: 14 }}>
                  Forgot your password?
                </Text>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={{ 
                alignItems: 'center', 
                marginTop: 'auto',
                paddingBottom: 32
              }}>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={{ color: '#6B7280', fontSize: 14 }}>
                    Don't have an account?{' '}
                    <Text style={{ color: '#3B82F6', fontWeight: '600' }}>Sign Up</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};