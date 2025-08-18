import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/global';
import { COLORS, SIZES } from '../../constants';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
  flex?: number;
  unit?: string;              
  accessibilityLabel?: string; 
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  unit,
  accessibilityLabel,
  flex = 0,
  onPress,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[globalStyles.cardContainer, styles.container, { flex: flex > 0 ? flex : undefined, minWidth: flex > 0 ? undefined : 120, backgroundColor: COLORS.formBackground, borderColor: COLORS.formBorder }]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel || `${title}: ${value}`}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityHint={onPress ? `View details for ${title.toLowerCase()}` : undefined}
    >
      <View style={styles.content}>
        <Text style={[styles.icon, { fontSize: SIZES.xLargeText }]}>{icon}</Text>
        <Text style={[globalStyles.text, { fontSize: SIZES.largeText, fontWeight: 'bold', color }]}>{value}{unit ? ` ${unit}` : ''}</Text>
        <Text style={[globalStyles.subText, { color: COLORS.textPrimary }]}>{title}</Text>
        <Text style={[globalStyles.subText, { fontSize: SIZES.smallText, color: COLORS.textSecondary }]}>{subtitle}</Text>
      </View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {},
  content: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: 8,
    color: COLORS.textPrimary,
  },
});