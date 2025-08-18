import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { onboardingStyles } from '../../../styles/onboarding';
import { COLORS, SIZES } from '../../../constants';

interface Course {
  id: string;
  name: string;
  icon: string;
  cutoff: number;
  requiredSubjects: string[];
}

interface CourseSelectionListProps {
  selectedCourse: string;
  handleCourseSelect: (courseId: string) => void;
  handleCustomCourse: () => void;
}

const POPULAR_COURSES: Course[] = [
  { id: 'medicine', name: 'Medicine & Surgery', icon: '🩺', cutoff: 320, requiredSubjects: ['english', 'physics', 'chemistry', 'biology'] },
  { id: 'engineering', name: 'Engineering', icon: '⚙️', cutoff: 280, requiredSubjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'law', name: 'Law', icon: '⚖️', cutoff: 280, requiredSubjects: ['english', 'mathematics', 'literature', 'government'] },
  { id: 'pharmacy', name: 'Pharmacy', icon: '💊', cutoff: 300, requiredSubjects: ['english', 'physics', 'chemistry', 'biology'] },
  { id: 'computer_science', name: 'Computer Science', icon: '💻', cutoff: 270, requiredSubjects: ['english', 'mathematics', 'physics', 'chemistry'] },
  { id: 'accounting', name: 'Accounting', icon: '📊', cutoff: 250, requiredSubjects: ['english', 'mathematics', 'economics', 'government'] },
  { id: 'business_admin', name: 'Business Administration', icon: '💼', cutoff: 240, requiredSubjects: ['english', 'mathematics', 'economics', 'government'] },
  { id: 'economics', name: 'Economics', icon: '📈', cutoff: 260, requiredSubjects: ['english', 'mathematics', 'economics', 'government'] },
  { id: 'psychology', name: 'Psychology', icon: '🧠', cutoff: 270, requiredSubjects: ['english', 'mathematics', 'biology', 'government'] },
  { id: 'mass_comm', name: 'Mass Communication', icon: '📺', cutoff: 250, requiredSubjects: ['english', 'mathematics', 'literature', 'government'] },
];

export const CourseSelectionList: React.FC<CourseSelectionListProps> = ({ selectedCourse, handleCourseSelect, handleCustomCourse }) => (
  <View style={onboardingStyles.sectionContainer}>
    <View style={styles.courseGrid}>
      {POPULAR_COURSES.map(course => (
        <TouchableOpacity
          key={course.id}
          onPress={() => handleCourseSelect(course.id)}
          style={[
            onboardingStyles.card,
            selectedCourse === course.id && onboardingStyles.selectedCard,
          ]}
          accessibilityLabel={course.name}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedCourse === course.id }}
        >
          <Text style={styles.icon}>{course.icon}</Text>
          <Text style={[
            onboardingStyles.cardText,
            selectedCourse === course.id && onboardingStyles.selectedCardText,
          ]}>
            {course.name}
          </Text>
          <Text style={styles.cutoffText}>Cutoff: {course.cutoff}+</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        onPress={handleCustomCourse}
        style={[
          onboardingStyles.card,
          selectedCourse === 'custom' && onboardingStyles.selectedCard,
          styles.customCard,
        ]}
        accessibilityLabel="Add custom course"
        accessibilityRole="button"
        accessibilityState={{ selected: selectedCourse === 'custom' }}
      >
        <Text style={styles.icon}>➕</Text>
        <Text style={[
          onboardingStyles.cardText,
          selectedCourse === 'custom' && onboardingStyles.selectedCardText,
        ]}>
          Other Course
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  courseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: SIZES.largeText,
    marginBottom: 8,
  },
  cutoffText: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  customCard: {
    borderStyle: 'dashed',
  },
});