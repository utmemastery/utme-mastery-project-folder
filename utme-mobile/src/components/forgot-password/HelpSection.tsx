import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/global';
import { COLORS, SIZES } from '../../constants';

export const HelpSection: React.FC = () => (
  <View style={styles.helpContainer}>
    <Text style={globalStyles.subText}>
      💡 Check your spam folder if you don't see the email within a few minutes
    </Text>
  </View>
);

const styles = StyleSheet.create({
  helpContainer: {
    backgroundColor: COLORS.formBackground,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.cardPadding,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.formBorder,
  },
});