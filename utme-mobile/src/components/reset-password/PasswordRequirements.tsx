import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/global';
import { COLORS, SIZES } from '../../constants';

export const PasswordRequirements: React.FC = () => (
  <View style={styles.requirementsContainer}>
    <Text style={[globalStyles.text, styles.title]}>Password Requirements:</Text>
    <Text style={globalStyles.subText}>
      • At least 8 characters{'\n'}
      • One uppercase letter{'\n'}
      • One lowercase letter{'\n'}
      • One number
    </Text>
  </View>
);

const styles = StyleSheet.create({
  requirementsContainer: {
    backgroundColor: COLORS.formBackground,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.cardPadding,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.formBorder,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
  },
});