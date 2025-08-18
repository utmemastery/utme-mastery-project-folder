import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { globalStyles } from '../../styles/global';
import { COLORS, SIZES } from '../../constants';

interface RegisterFormProps {
  navigation: StackScreenProps<AuthStackParamList, 'Register'>['navigation'];
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error, clearError } = useAuthStore();

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid Nigerian phone number';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    clearError();

    try {
      await register({
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      navigation.navigate('EmailVerification', { email: formData.email });
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <View style={styles.formContainer}>
      <Input
        label="First Name"
        placeholder="Enter your first name"
        value={formData.firstName}
        onChangeText={(text) => updateFormData('firstName', text)}
        error={errors.firstName}
        style={globalStyles.input}
        inputStyle={globalStyles.inputText}
        labelStyle={globalStyles.label}
        accessibilityLabel="First name input"
        accessibilityRole="text"
      />
      <Input
        label="Last Name"
        placeholder="Enter your last name"
        value={formData.lastName}
        onChangeText={(text) => updateFormData('lastName', text)}
        error={errors.lastName}
        style={globalStyles.input}
        inputStyle={globalStyles.inputText}
        labelStyle={globalStyles.label}
        accessibilityLabel="Last name input"
        accessibilityRole="text"
      />
      <Input
        label="Email Address"
        placeholder="Enter your email"
        value={formData.email}
        onChangeText={(text) => updateFormData('email', text)}
        keyboardType="email-address"
        error={errors.email}
        style={globalStyles.input}
        inputStyle={globalStyles.inputText}
        labelStyle={globalStyles.label}
        accessibilityLabel="Email input"
        accessibilityRole="text"
      />
      <Input
        label="Phone Number"
        placeholder="Enter your phone number"
        value={formData.phoneNumber}
        onChangeText={(text) => updateFormData('phoneNumber', text)}
        keyboardType="phone-pad"
        error={errors.phoneNumber}
        style={globalStyles.input}
        inputStyle={globalStyles.inputText}
        labelStyle={globalStyles.label}
        accessibilityLabel="Phone number input"
        accessibilityRole="text"
      />
      <Input
        label="Password"
        placeholder="Enter your password"
        value={formData.password}
        onChangeText={(text) => updateFormData('password', text)}
        secureTextEntry={!showPassword}
        error={errors.password}
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
        accessibilityLabel="Password input"
        accessibilityRole="text"
      />
      <Input
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={formData.confirmPassword}
        onChangeText={(text) => updateFormData('confirmPassword', text)}
        secureTextEntry={!showPassword}
        error={errors.confirmPassword}
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
        title={isLoading ? 'Creating Account...' : 'Create Account ✨'}
        onPress={handleRegister}
        disabled={isLoading}
        variant="primary"
        size="large"
        accessibilityLabel="Create Account"
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