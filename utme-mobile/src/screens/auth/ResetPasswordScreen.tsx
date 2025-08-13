import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';

type ResetPasswordScreenProps = StackScreenProps<AuthStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const { token } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  const validateForm = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    if (!passwordRegex.test(password)) {
      setPasswordError('Password must contain uppercase, lowercase, and number');
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    clearError();
    try {
      await resetPassword(token, password);
      Alert.alert('Success', 'Password reset successfully', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 }}>
          Reset Password
        </Text>
        <Input
          label="New Password"
          placeholder="Enter new password"
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
        <Input
          label="Confirm Password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
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
          title="Reset Password"
          onPress={handleResetPassword}
          loading={isLoading}
          style={{ marginBottom: 16 }}
        />
        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')}
          style={{ alignItems: 'center', marginTop: 16 }}
        >
          <Text style={{ color: '#6B7280', fontSize: 14 }}>
            ← Back to Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};