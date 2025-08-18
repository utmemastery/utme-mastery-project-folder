import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/global';
import { COLORS, SIZES } from '../../constants';

interface SubjectCardProps {
  subject: string;
  accuracy: number;
  totalQuestions: number;
  accessibilityLabel?: string;
  onPress: () => void;
}

export const SUBJECT_ICONS: Record<string, string> = {
  english: '📚',
  mathematics: '🔢',
  physics: '⚛️',
  chemistry: '🧪',
  biology: '🧬',
  geography: '🌍',
  economics: '💰',
  government: '🏛️',
  literature: '📖',
  history: '📜',
};

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  accuracy,
  totalQuestions,
  onPress,
}) => {
  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return COLORS.success;
    if (acc >= 60) return COLORS.primary;
    if (acc >= 40) return COLORS.warning;
    return COLORS.error;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[globalStyles.cardContainer, styles.container]}
      accessibilityLabel={`${subject} card, accuracy ${accuracy}%`}
      accessibilityRole="button"
      accessibilityHint={`View details for ${subject}`}
    >
      <View style={styles.content}>
        <Text style={[styles.icon, { fontSize: SIZES.xLargeText }]}>{SUBJECT_ICONS[subject.toLowerCase()] || '📋'}</Text>
        <Text style={[globalStyles.text, styles.subjectText]}>{subject.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</Text>
        <Text style={[globalStyles.text, { fontSize: SIZES.largeText, fontWeight: 'bold', color: getAccuracyColor(accuracy) }]}>
          {accuracy}%
        </Text>
        <Text style={globalStyles.subText}>{totalQuestions} questions</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 140,
    backgroundColor: COLORS.formBackground,
    borderColor: COLORS.formBorder,
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: 8,
    color: COLORS.textPrimary,
  },
  subjectText: {
    textTransform: 'capitalize',
    marginBottom: 8,
    color: COLORS.textPrimary,
  },
});