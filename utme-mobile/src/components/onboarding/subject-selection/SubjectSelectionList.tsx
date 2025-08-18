import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { onboardingStyles } from '../../../styles/onboarding';
import { COLORS, SIZES } from '../../../constants';

interface Subject {
  id: string;
  name: string;
  icon: string;
  category?: string;
  required?: boolean;
}

interface SubjectSelectionListProps {
  selectedSubjects: string[];
  toggleSubject: (subjectId: string) => void;
}

const UTME_SUBJECTS: Subject[] = [
  { id: 'english', name: 'Use of English', icon: '📚', required: true },
  { id: 'mathematics', name: 'Mathematics', icon: '🔢', category: 'Science' },
  { id: 'physics', name: 'Physics', icon: '⚛️', category: 'Science' },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪', category: 'Science' },
  { id: 'biology', name: 'Biology', icon: '🧬', category: 'Science' },
  { id: 'geography', name: 'Geography', icon: '🌍', category: 'Social Science' },
  { id: 'economics', name: 'Economics', icon: '💰', category: 'Social Science' },
  { id: 'government', name: 'Government', icon: '🏛️', category: 'Social Science' },
  { id: 'literature', name: 'Literature in English', icon: '📖', category: 'Arts' },
  { id: 'history', name: 'History', icon: '📜', category: 'Arts' },
  { id: 'crs', name: 'Christian Religious Studies', icon: '✝️', category: 'Arts' },
  { id: 'irs', name: 'Islamic Religious Studies', icon: '☪️', category: 'Arts' },
  { id: 'yoruba', name: 'Yoruba', icon: '🗣️', category: 'Languages' },
  { id: 'hausa', name: 'Hausa', icon: '🗣️', category: 'Languages' },
  { id: 'igbo', name: 'Igbo', icon: '🗣️', category: 'Languages' },
];

export const SubjectSelectionList: React.FC<SubjectSelectionListProps> = ({ selectedSubjects, toggleSubject }) => {
  const categories = Array.from(new Set(UTME_SUBJECTS.map(s => s.category).filter(Boolean))) as string[];

  return (
    <View style={onboardingStyles.sectionContainer}>
      {categories.map(category => (
        <View key={category} style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <View style={styles.subjectGrid}>
            {UTME_SUBJECTS.filter(s => s.category === category).map(subject => (
              <TouchableOpacity
                key={subject.id}
                onPress={() => toggleSubject(subject.id)}
                style={[
                  onboardingStyles.card,
                  selectedSubjects.includes(subject.id) && onboardingStyles.selectedCard,
                  subject.required && styles.requiredCard,
                ]}
                disabled={subject.required}
                accessibilityLabel={subject.name}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedSubjects.includes(subject.id), disabled: subject.required }}
              >
                <Text style={styles.icon}>{subject.icon}</Text>
                <Text style={[
                  onboardingStyles.cardText,
                  selectedSubjects.includes(subject.id) && onboardingStyles.selectedCardText,
                ]}>
                  {subject.name}
                </Text>
                {subject.required && <Text style={styles.requiredText}>Required</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: SIZES.largeText,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: SIZES.largeText,
    marginBottom: 8,
  },
  requiredCard: {
    opacity: 0.7,
  },
  requiredText: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});