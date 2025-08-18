import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/global';
import { COLORS, SIZES, LAYOUT } from '../../constants';

export const RegisterHeader: React.FC = () => (
  <View style={styles.headerContainer}>
    <View style={styles.logoContainer}>
      <Text style={styles.logo}>🎓</Text>
    </View>
    <Text style={globalStyles.sectionHeader}>Create Your Account</Text>
    <Text style={globalStyles.text}>Start your journey to UTME excellence</Text>
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginTop: LAYOUT.headerMarginTop,
    marginBottom: 32,
  },
  logoContainer: {
    backgroundColor: COLORS.formBackground,
    borderRadius: 100,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.formBorder,
  },
  logo: {
    fontSize: SIZES.logo,
    color: COLORS.white,
  },
});