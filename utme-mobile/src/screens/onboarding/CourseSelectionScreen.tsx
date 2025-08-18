import React, { useState } from 'react';
import { View, ScrollView, Animated, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';
import { CourseSelectionHeader } from '../../components/onboarding/course-selection/CourseSelectionHeader';
import { CourseSelectionList } from '../../components/onboarding/course-selection/CourseSelectionList';
import { CourseSelectionForm } from '../../components/onboarding/course-selection/CourseSelectionForm';
import { CourseSelectionFooter } from '../../components/onboarding/course-selection/CourseSelectionFooter';
import { useScreenAnimation } from '../../hooks/useScreenAnimation';
import { COLORS, LAYOUT } from '../../constants';

interface CourseSelectionScreenProps extends NativeStackScreenProps<OnboardingStackParamList, 'CourseSelection'> {}

export const CourseSelectionScreen: React.FC<CourseSelectionScreenProps> = ({ navigation, route }) => {
  const { selectedSubjects } = route.params;
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [customCourse, setCustomCourse] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
    setShowCustomInput(false);
    setCustomCourse('');
  };

  const handleCustomCourse = () => {
    setShowCustomInput(true);
    setSelectedCourse('custom');
  };

  const handleContinue = () => {
    const aspiringCourseObj = POPULAR_COURSES.find(c => c.id === selectedCourse);
    const aspiringCourse = selectedCourse === 'custom' ? customCourse : aspiringCourseObj?.name || '';
    
    if (!aspiringCourse) {
      Alert.alert('Error', 'Please select or enter a course');
      return;
    }

    const suggestedScore = aspiringCourseObj?.cutoff || 250;

    navigation.navigate('GoalSetting', {
      selectedSubjects,
      aspiringCourse,
      suggestedScore,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <CourseSelectionHeader />
            <CourseSelectionList
              selectedCourse={selectedCourse}
              handleCourseSelect={handleCourseSelect}
              handleCustomCourse={handleCustomCourse}
            />
            {showCustomInput && (
              <CourseSelectionForm customCourse={customCourse} setCustomCourse={setCustomCourse} />
            )}
            <CourseSelectionFooter
              handleBack={() => navigation.goBack()}
              handleContinue={handleContinue}
              isDisabled={!selectedCourse || (selectedCourse === 'custom' && !customCourse.trim())}
            />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const POPULAR_COURSES = [
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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  orbTop: {
    position: 'absolute',
    top: LAYOUT.orbTopOffset,
    right: -0.25 * LAYOUT.orbTopSize,
    width: LAYOUT.orbTopSize,
    height: LAYOUT.orbTopSize,
    borderRadius: LAYOUT.orbTopSize / 2,
    backgroundColor: COLORS.orbBlue,
    transform: [{ rotate: '20deg' }],
  },
  orbBottom: {
    position: 'absolute',
    bottom: LAYOUT.orbBottomOffset,
    left: -0.2 * LAYOUT.orbBottomSize,
    width: LAYOUT.orbBottomSize,
    height: LAYOUT.orbBottomSize,
    borderRadius: LAYOUT.orbBottomSize / 2,
    backgroundColor: COLORS.orbGold,
    transform: [{ rotate: '-40deg' }],
  },
  safeArea: { 
    flex: 1 
  },
  scrollView: { 
    flexGrow: 1 
  },
  content: { 
    flex: 1, 
    padding: LAYOUT.padding 
  },
});