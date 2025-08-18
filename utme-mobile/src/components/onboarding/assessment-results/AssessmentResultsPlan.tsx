import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../../../styles/global';
import { onboardingStyles } from '../../../styles/onboarding';
import { COLORS, SIZES } from '../../../constants';

export const AssessmentResultsPlan: React.FC = () => (
  <View style={[onboardingStyles.sectionContainer, styles.planContainer]}>
    <View style={styles.iconContainer}>
      <Text style={styles.icon}>🚀</Text>
    </View>
    <Text style={[globalStyles.text, styles.title]}>Your Personalized Plan</Text>
    <Text style={globalStyles.subText}>
      We've created a custom study plan focusing on your weak areas while maintaining your strengths. Your AI tutor will adapt the difficulty as you improve!
    </Text>
  </View>
);

const styles = StyleSheet.create({
  planContainer: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  iconContainer: {
    marginBottom: 12,
  },
  icon: {
    fontSize: SIZES.largeText,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
  },
});