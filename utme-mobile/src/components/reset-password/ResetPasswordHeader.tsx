import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useBounceAnimation } from '../../hooks/useBounceAnimation';
import { globalStyles } from '../../styles/global';
import { COLORS, SIZES } from '../../constants';

export const ResetPasswordHeader: React.FC = () => {
  const { bounceAnim } = useBounceAnimation();

  return (
    <View style={styles.headerContainer}>
      <Animated.View style={[styles.shieldContainer, { transform: [{ scale: bounceAnim }] }]}>
        <View style={styles.shield}>
          <Text style={styles.shieldIcon}>🛡️</Text>
        </View>
      </Animated.View>
      <Text style={globalStyles.sectionHeader}>Reset Your Password</Text>
      <Text style={globalStyles.text}>Create a new secure password</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  shieldContainer: {
    marginBottom: 24,
  },
  shield: {
    width: 120,
    height: 120,
    borderRadius: 35,
    backgroundColor: COLORS.formBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.formBorder,
  },
  shieldIcon: {
    fontSize: SIZES.logo,
    color: COLORS.white,
  },
});