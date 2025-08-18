import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../../../styles/global';
import { onboardingStyles } from '../../../styles/onboarding';
import { COLORS, SIZES } from '../../../constants';

interface AssessmentResultsSummaryProps {
  currentProjectedScore: number;
  goalScore: number;
  aspiringCourse: string;
}

export const AssessmentResultsSummary: React.FC<AssessmentResultsSummaryProps> = ({
  currentProjectedScore,
  goalScore,
  aspiringCourse,
}) => (
  <View style={onboardingStyles.sectionContainer}>
    <Text style={[globalStyles.text, styles.label]}>Aspiring Course</Text>
    <Text style={[globalStyles.sectionHeader, styles.courseText]}>{aspiringCourse}</Text>
    <View style={styles.scoreContainer}>
      <View style={styles.scoreBox}>
        <Text style={styles.scoreLabel}>Current Projected Score</Text>
        <Text style={styles.scoreValue}>{currentProjectedScore}</Text>
      </View>
      <View style={styles.scoreBox}>
        <Text style={styles.scoreLabel}>Goal Score</Text>
        <Text style={styles.scoreValue}>{goalScore}</Text>
      </View>
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
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  scoreBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.cardPadding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.formBorder,
    marginHorizontal: 8,
  },
  scoreLabel: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: SIZES.largeText,
    fontWeight: '600',
    color: COLORS.primary,
  },
});