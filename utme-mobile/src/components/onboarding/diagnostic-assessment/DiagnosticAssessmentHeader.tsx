import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { usePulseAnimation } from '../../../hooks/usePulseAnimation';
import { globalStyles } from '../../../styles/global';
import { COLORS, SIZES, LAYOUT } from '../../../constants';

interface DiagnosticAssessmentHeaderProps {
  currentSubject: string;
}

export const DiagnosticAssessmentHeader: React.FC<DiagnosticAssessmentHeaderProps> = ({ currentSubject }) => {
  const { pulseAnim } = usePulseAnimation();

  return (
    <View style={styles.headerContainer}>
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>📝</Text>
        </View>
      </Animated.View>
      <Text style={globalStyles.sectionHeader}>Diagnostic Assessment</Text>
      <Text style={[globalStyles.text, styles.subjectText]}>
        {currentSubject.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginTop: LAYOUT.headerMarginTop,
    marginBottom: 48,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: COLORS.formBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.formBorder,
  },
  iconText: {
    fontSize: SIZES.logo,
    color: COLORS.primary,
  },
  subjectText: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});