import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { usePulseAnimation } from '../../../hooks/usePulseAnimation';
import { globalStyles } from '../../../styles/global';
import { COLORS, SIZES, LAYOUT } from '../../../constants';

export const WelcomeHeader: React.FC = () => {
  const { pulseAnim } = usePulseAnimation();

  return (
    <View style={styles.headerContainer}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.logo}>
          <Text style={styles.logoIcon}>🎯</Text>
        </View>
      </Animated.View>
      <Text style={globalStyles.sectionHeader}>Welcome to UTME Mastery</Text>
      <Text style={globalStyles.text}>
        Your AI-powered companion for achieving 99th percentile UTME scores
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
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 35,
    backgroundColor: COLORS.formBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.formBorder,
  },
  logoIcon: {
    fontSize: SIZES.logo,
    color: COLORS.primary,
  },
});