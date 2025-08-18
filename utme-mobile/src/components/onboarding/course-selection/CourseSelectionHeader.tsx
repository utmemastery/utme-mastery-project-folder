import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { usePulseAnimation } from '../../../hooks/usePulseAnimation';
import { globalStyles } from '../../../styles/global';
import { COLORS, SIZES, LAYOUT } from '../../../constants';

export const CourseSelectionHeader: React.FC = () => {
  const { pulseAnim } = usePulseAnimation();

  return (
    <View style={styles.headerContainer}>
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>🎓</Text>
        </View>
      </Animated.View>
      <Text style={globalStyles.sectionHeader}>Choose Your Aspiring Course</Text>
      <Text style={globalStyles.text}>
        Select a course to tailor your study plan
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
});