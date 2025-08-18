import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useRotateAnimation } from '../../hooks/useRotateAnimation';
import { globalStyles } from '../../styles/global';
import { COLORS, SIZES, LAYOUT } from '../../constants';

export const ForgotPasswordHeader: React.FC = () => {
  const { spin } = useRotateAnimation();

  return (
    <View style={styles.headerContainer}>
      <Animated.View style={[styles.lockContainer, { transform: [{ rotate: spin }] }]}>
        <View style={styles.lock}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
      </Animated.View>
      <Text style={globalStyles.sectionHeader}>Forgot Password?</Text>
      <Text style={globalStyles.text}>Enter your email to receive a reset link</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginTop: LAYOUT.headerMarginTop,
    marginBottom: 48,
  },
  lockContainer: {
    marginBottom: 24,
  },
  lock: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: COLORS.formBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.formBorder,
  },
  lockIcon: {
    fontSize: SIZES.logo,
    color: COLORS.white,
  },
});