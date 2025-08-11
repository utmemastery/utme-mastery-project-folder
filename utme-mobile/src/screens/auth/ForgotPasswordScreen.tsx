import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const { forgotPassword, isLoading, error, clearError } = useAuthStore();

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

    return isValid;
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) return;

    clearError();

    try {
      await forgotPassword(email);
      Alert.alert(
        'Success',
        'Password reset instructions have been sent to your email',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Login') 
          }
        ]
      );
    } catch (error) {
      // Error is handled by the store
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
                <Text style={{ fontSize: 32, color: 'white' }}>🔒</Text>
              </View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
                Reset Password
              </Text>
              <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24 }}>
                Enter your email to receive password reset instructions
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

              {error && (
                <Text style={{ color: '#EF4444', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
                  {error}
                </Text>
              )}

              <Button
                title="Send Reset Instructions"
                onPress={handleForgotPassword}
                loading={isLoading}
                style={{ marginBottom: 16 }}
              />

              {/* Back to Login Link */}
              <View style={{ alignItems: 'center', marginTop: 'auto', paddingBottom: 32 }}>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={{ color: '#6B7280', fontSize: 14 }}>
                    ← Back to Sign In
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