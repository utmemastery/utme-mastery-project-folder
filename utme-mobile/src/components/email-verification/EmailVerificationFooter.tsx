import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { COLORS, SIZES } from '../../constants';

interface EmailVerificationFooterProps {
  navigation: StackScreenProps<AuthStackParamList, 'EmailVerification'>['navigation'];
}

export const EmailVerificationFooter: React.FC<EmailVerificationFooterProps> = ({ navigation }) => (
  <View style={styles.footerContainer}>
    <TouchableOpacity
      onPress={() => navigation.navigate('Login')}
      style={styles.backButton}
      accessibilityLabel="Back to Sign In"
      accessibilityRole="button"
    >
      <Text style={styles.backText}>← Back to Sign In</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  footerContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 32,
  },
  backButton: {
    backgroundColor: COLORS.formBackground,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.formBorder,
  },
  backText: {
    color: COLORS.primary,
    fontSize: SIZES.linkText,
    fontWeight: '500',
  },
});