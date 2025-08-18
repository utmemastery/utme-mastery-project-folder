import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/global';
import { COLORS, SIZES } from '../../constants';

interface TaskCardProps {
  title: string;
  description: string;
  progress: number;
  icon: string;
  completed: boolean;
  difficulty?: string; // Optional difficulty level
  subject?: string;    // Optional subject for filtering
  accessibilityLabel?: string;
  onPress: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  progress,
  icon,
  completed,
  subject,
  difficulty,
  accessibilityLabel,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[globalStyles.cardContainer, { backgroundColor: COLORS.formBackground, borderColor: COLORS.formBorder }]}
    accessibilityLabel={accessibilityLabel ?? `${title}, ${completed ? 'completed' : `${Math.round(progress * 100)}% progress`}`}
    accessibilityRole="button"
    accessibilityHint={`Practice ${title}`}
  >
    {/* Icon */}
    <View style={[styles.iconContainer, { backgroundColor: completed ? COLORS.success : COLORS.primaryLight }]}>
      <Text style={styles.icon}>{completed ? '✅' : icon}</Text>
    </View>

    {/* Content */}
    <View style={styles.content}>
      <Text style={[globalStyles.text, { color: COLORS.textPrimary, fontWeight: 'bold' }]}>{title}</Text>

      {subject && (
        <Text style={[globalStyles.subText, { color: COLORS.textSecondary }]}>
          Subject: {subject}
        </Text>
      )}

      {difficulty && (
        <Text style={[globalStyles.subText, { color: COLORS.textSecondary }]}>
          Difficulty: {difficulty}
        </Text>
      )}

      <Text style={[globalStyles.subText, { color: COLORS.textSecondary }]}>{description}</Text>

      <View style={globalStyles.progressBar}>
        <View
          style={[
            globalStyles.progressFill,
            { width: `${progress * 100}%`, backgroundColor: completed ? COLORS.success : COLORS.primary },
          ]}
        />
      </View>
    </View>

    <Text style={styles.arrow}>→</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: SIZES.icon,
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  arrow: {
    color: COLORS.textSecondary,
    fontSize: SIZES.mediumText,
  },
});
