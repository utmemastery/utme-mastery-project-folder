import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { globalStyles } from '../../styles/global';
import { COLORS, SIZES } from '../../constants';

interface ResetPasswordFormProps {
  navigation: StackScreenProps<AuthStackParamList, 'ResetPassword'>['navigation'];
  token: string;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ navigation, token }) => {
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
      Alert.alert(
        'Success! 🎉',
        'Password reset successfully',
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
        label="New Password"
        placeholder="Enter your new password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        error={passwordError}
        style={globalStyles.input}
        inputStyle={globalStyles.inputText}
        labelStyle={globalStyles.label}
        rightIcon={
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
          >
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        }
        accessibilityLabel="New password input"
        accessibilityRole="text"
      />
      <Input
        label="Confirm Password"
        placeholder="Re-enter your new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showPassword}
        error={passwordError}
        style={globalStyles.input}
        inputStyle={globalStyles.inputText}
        labelStyle={globalStyles.label}
        rightIcon={
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
          >
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        }
        accessibilityLabel="Confirm password input"
        accessibilityRole="text"
      />
      {error && (
        <View style={globalStyles.errorContainer}>
          <Text style={globalStyles.errorText}>{error}</Text>
        </View>
      )}
      <Button
        title={isLoading ? 'Resetting...' : 'Reset Password ✨'}
        onPress={handleResetPassword}
        disabled={isLoading}
        variant="primary"
        size="large"
        accessibilityLabel="Reset Password"
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
  eyeIcon: {
    color: COLORS.secondary,
    fontWeight: '600',
    fontSize: SIZES.linkText,
  },
});