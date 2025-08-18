import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../../../styles/global';
import { COLORS, SIZES, LAYOUT } from '../../../constants';

export const AssessmentResultsHeader: React.FC = () => {

  return (
    <View style={styles.headerContainer}>
      <Text style={globalStyles.sectionHeader}>Your Assessment Results</Text>
      <Text style={globalStyles.text}>
        Based on your performance, here's your current standing
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