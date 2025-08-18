import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { usePulseAnimation } from '../../hooks/usePulseAnimation';
import { globalStyles } from '../../styles/global';
import { COLORS, SIZES, LAYOUT } from '../../constants';

interface EmailVerificationHeaderProps {
  email: string;
}

export const EmailVerificationHeader: React.FC<EmailVerificationHeaderProps> = ({ email }) => {
  const { pulseAnim } = usePulseAnimation();

  return (
    <View style={styles.headerContainer}>
      <Animated.View style={[styles.emailContainer, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.emailIcon}>
          <Text style={styles.icon}>📧</Text>
        </View>
      </Animated.View>
      <Text style={globalStyles.sectionHeader}>Verify Your Email</Text>
      <Text style={globalStyles.text}>
        We sent a code to <Text style={styles.emailText}>{email}</Text>
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
  emailContainer: {
    marginBottom: 24,
  },
  emailIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: COLORS.formBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.formBorder,
  },
  icon: {
    fontSize: SIZES.logo,
    color: COLORS.white,
  },
  emailText: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
});