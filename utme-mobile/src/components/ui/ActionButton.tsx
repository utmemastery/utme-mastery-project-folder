import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants';
import { globalStyles } from '../../styles/global';

interface ActionButtonProps {
  title: string;
  icon: string;
  color: string;
  accessibilityLabel?: string;
  onPress: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ title, icon, color, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.container, { backgroundColor: color }]}
    accessibilityLabel={title}
    accessibilityRole="button"
    accessibilityHint={`Navigate to ${title.toLowerCase()} screen`}
  >
    <Text style={styles.icon}>{icon}</Text>
    <Text style={[globalStyles.text, styles.text]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.cardPadding,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.formBorder,
  },
  icon: {
    fontSize: SIZES.xLargeText,
    marginBottom: 8,
    color: COLORS.white,
  },
  text: {
    fontSize: SIZES.mediumText,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
});