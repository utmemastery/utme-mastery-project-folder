import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { COLORS, SIZES } from '../../constants';

interface RegisterFooterProps {
  navigation: StackScreenProps<AuthStackParamList, 'Register'>['navigation'];
}

export const RegisterFooter: React.FC<RegisterFooterProps> = ({ navigation }) => (
  <View style={styles.footerContainer}>
    <TouchableOpacity
      onPress={() => navigation.navigate('Login')}
      style={styles.signInButton}
      accessibilityLabel="Sign In"
      accessibilityRole="button"
    >
      <Text style={styles.signInText}>
        Already have an account?{' '}
        <Text style={styles.signInLink}>Sign In 🔐</Text>
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  footerContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  signInButton: {
    backgroundColor: COLORS.formBackground,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.formBorder,
  },
  signInText: {
    color: COLORS.primary,
    fontSize: SIZES.linkText,
    textAlign: 'center',
  },
  signInLink: {
    color: COLORS.secondary,
    fontWeight: '700',
    fontSize: SIZES.signUpLink,
  },
});