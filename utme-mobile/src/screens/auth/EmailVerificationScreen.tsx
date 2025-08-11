// mobile/src/screens/auth/EmailVerificationScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';


type EmailVerificationScreenProps = StackScreenProps<AuthStackParamList, 'EmailVerification'>;


export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { email } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const { verifyEmail, isLoading, error, clearError } = useAuthStore();
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (newCode.every(digit => digit !== '') && text) {
      handleVerification(newCode.join(''));
    }
  };

  const handleVerification = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    clearError();

    try {
      await verifyEmail(email, codeToVerify);
      Alert.alert(
        'Success!',
        'Email verified successfully',
        [{ text: 'Continue', onPress: () => navigation.replace('Onboarding') }]
      );
    } catch (error) {
      // Error handled by store
      setCode(['', '', '', '', '', '']); // Clear code on error
    }
  };

  const handleResendCode = async () => {
    try {
      // Add resend verification API call here
      setCountdown(60);
      setCanResend(false);
      Alert.alert('Success', 'Verification code sent successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Text style={{ fontSize: 32, marginBottom: 16 }}>📧</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
            Verify Your Email
          </Text>
          <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24 }}>
            We've sent a 6-digit verification code to{'\n'}
            <Text style={{ fontWeight: '600', color: '#3B82F6' }}>{email}</Text>
          </Text>
        </View>

        {/* Code Input */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          marginBottom: 32,
          paddingHorizontal: 16
        }}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={{
                width: 48,
                height: 56,
                borderWidth: 2,
                borderColor: digit ? '#3B82F6' : '#E5E7EB',
                borderRadius: 12,
                textAlign: 'center',
                fontSize: 20,
                fontWeight: 'bold',
                color: '#1F2937',
                backgroundColor: digit ? '#EFF6FF' : 'white'
              }}
              value={digit}
              onChangeText={(text) => handleCodeChange(text.slice(-1), index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {error && (
          <Text style={{ 
            color: '#EF4444', 
            fontSize: 14, 
            marginBottom: 16, 
            textAlign: 'center' 
          }}>
            {error}
          </Text>
        )}

        {/* Verify Button */}
        <Button
          title="Verify Email"
          onPress={() => handleVerification()}
          loading={isLoading}
          disabled={code.some(digit => digit === '')}
          style={{ marginBottom: 24 }}
        />

        {/* Resend Code */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#6B7280', fontSize: 14, marginBottom: 8 }}>
            Didn't receive the code?
          </Text>
          <TouchableOpacity 
            onPress={handleResendCode}
            disabled={!canResend}
          >
            <Text style={{ 
              color: canResend ? '#3B82F6' : '#9CA3AF', 
              fontSize: 14, 
              fontWeight: '600' 
            }}>
              {canResend ? 'Resend Code' : `Resend in ${countdown}s`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Back to Login */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')}
          style={{ alignItems: 'center', marginTop: 32 }}
        >
          <Text style={{ color: '#6B7280', fontSize: 14 }}>
            ← Back to Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
