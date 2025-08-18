import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { styles } from '../../styles/login';
import { globalStyles } from '../../styles/global';
import { COLORS, SIZES } from '../../constants';

interface LoginFormProps {
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  emailError: string;
  passwordError: string;
  showPassword: boolean;
  toggleShowPassword: () => void;
  handleLogin: () => void;
  isLoading: boolean;
  error: string | null;
  navigation: StackScreenProps<AuthStackParamList, 'Login'>['navigation'];
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  emailError,
  passwordError,
  showPassword,
  toggleShowPassword,
  handleLogin,
  isLoading,
  error,
  navigation,
}) => (
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
    <Input
      label="Password"
      placeholder="Enter your password"
      value={password}
      onChangeText={setPassword}
      secureTextEntry={!showPassword}
      error={passwordError}
      inputStyle={globalStyles.inputText}
      labelStyle={globalStyles.label}
      rightIcon={
        <TouchableOpacity 
          onPress={toggleShowPassword}
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          accessibilityRole="button"
        >
          <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
        </TouchableOpacity>
      }
      accessibilityLabel="Password input"
      accessibilityRole="text"
    />
    {error && (
      <View style={globalStyles.errorContainer}>
        <Text style={globalStyles.errorText}>{error}</Text>
      </View>
    )}
    <Button
      title={isLoading ? 'Signing In...' : 'Sign In ✨'}
      onPress={handleLogin}
      disabled={isLoading}
      variant="primary"
      size="large"
      accessibilityLabel="Sign In"
      accessibilityRole="button"
      accessibilityState={{ disabled: isLoading }}
      style={{ marginBottom: 16, marginTop: 20, alignItems: 'center', borderRadius: SIZES.smallBorderRadius }}
    />
    <TouchableOpacity 
      onPress={() => navigation.navigate('ForgotPassword')}
      style={styles.forgotPasswordContainer}
      accessibilityLabel="Forgot password"
      accessibilityRole="button"
    >
      <Text style={styles.forgotPassword}>Forgot your password? 🔑</Text>
    </TouchableOpacity>
  </View>
);