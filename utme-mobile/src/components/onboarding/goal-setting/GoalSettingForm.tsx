import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input } from '../../../components/ui/Input';
import { globalStyles } from '../../../styles/global';
import { onboardingStyles } from '../../../styles/onboarding';
import { COLORS, SIZES } from '../../../constants';

interface GoalSettingFormProps {
  aspiringCourse: string;
  goalScore: string;
  setGoalScore: (value: string) => void;
}

export const GoalSettingForm: React.FC<GoalSettingFormProps> = ({ aspiringCourse, goalScore, setGoalScore }) => (
  <View style={onboardingStyles.sectionContainer}>
    <Text style={[globalStyles.text, styles.label]}>Aspiring Course</Text>
    <Text style={[globalStyles.sectionHeader, styles.courseText]}>{aspiringCourse}</Text>
    <Text style={[globalStyles.text, styles.label, { marginTop: 16 }]}>Your UTME Goal Score</Text>
    <Input
      placeholder="Enter score between 200-400"
      value={goalScore}
      onChangeText={setGoalScore}
      keyboardType="numeric"
      style={globalStyles.input}
      inputStyle={globalStyles.inputText}
      labelStyle={globalStyles.label}
      accessibilityLabel="UTME goal score input"
      accessibilityRole="text"
    />
    <View style={styles.tipContainer}>
      <Text style={styles.tipText}>
        💡 Tip: Set a score 20-30 points above the typical cutoff to increase your chances
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  courseText: {
    fontSize: SIZES.largeText,
    fontWeight: '600',
  },
  tipContainer: {
    padding: SIZES.cardPadding,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    marginTop: 8,
  },
  tipText: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
  },
});