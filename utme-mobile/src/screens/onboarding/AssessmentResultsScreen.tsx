import React from 'react';
import { View, ScrollView, Animated, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, OnboardingStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../stores/authStore';
import { AssessmentResultsHeader } from '../../components/onboarding/assessment-results/AssessmentResultsHeader';
import { AssessmentResultsSummary } from '../../components/onboarding/assessment-results/AssessmentResultsSummary';
import { AssessmentResultsSubjects } from '../../components/onboarding/assessment-results/AssessmentResultsSubjects';
import { AssessmentResultsPlan } from '../../components/onboarding/assessment-results/AssessmentResultsPlan';
import { AssessmentResultsFooter } from '../../components/onboarding/assessment-results/AssessmentResultsFooter';
import { useScreenAnimation } from '../../hooks/useScreenAnimation';
import { COLORS, LAYOUT } from '../../constants';

interface AssessmentResultsScreenProps {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'AssessmentResults'>;
  route: {
    params: {
      subjectProficiency: Array<{ subject: string; proficiency: number }>;
      goalScore: number;
      aspiringCourse: string;
      selectedSubjects: string[];
      learningStyle: string;
    };
  };
}

export const AssessmentResultsScreen: React.FC<AssessmentResultsScreenProps> = ({ navigation, route }) => {
  const { subjectProficiency, goalScore, aspiringCourse, selectedSubjects, learningStyle } = route.params;
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const { updateProfile, setOnboardingDone } = useAuthStore();

  const getSubjectName = (subject: string) => {
    const names: Record<string, string> = {
      english: 'English Language',
      mathematics: 'Mathematics',
      physics: 'Physics',
      chemistry: 'Chemistry',
      biology: 'Biology',
      geography: 'Geography',
      economics: 'Economics',
      government: 'Government',
      literature: 'Literature in English',
      history: 'History',
      crs: 'Christian Religious Studies',
      irs: 'Islamic Religious Studies',
      yoruba: 'Yoruba',
      hausa: 'Hausa',
      igbo: 'Igbo',
    };
    return names[subject] || subject.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const getProficiencyLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: COLORS.success };
    if (score >= 60) return { level: 'Good', color: COLORS.primary };
    if (score >= 40) return { level: 'Fair', color: COLORS.accent };
    return { level: 'Needs Work', color: COLORS.error };
  };

  const averageProficiency = subjectProficiency.reduce((sum, item) => sum + item.proficiency, 0) / subjectProficiency.length;
  const clampedAverage = Math.min(Math.max(averageProficiency, 0), 100);
  const currentProjectedScore = Math.round(200 + (clampedAverage / 100) * 200);

  const handleStartLearning = async () => {
    try {
      // Update profile with assessment results
      await updateProfile({
        selectedSubjects,
        aspiringCourse,
        goalScore,
        learningStyle,
        diagnosticResults: subjectProficiency.map(s => ({
          subject: s.subject,
          proficiency: s.proficiency,
        })),
        onboardingDone: true,
      });

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        'onboardingProgress',
        JSON.stringify({ selectedSubjects, aspiringCourse, goalScore, learningStyle, done: true })
      );

      // Update onboarding status
      await setOnboardingDone(true);

    } catch (error) {
      console.log('Error updating profile:', error);
      Alert.alert('Error', 'Failed to save assessment results. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <AssessmentResultsHeader />
            <AssessmentResultsSummary
              currentProjectedScore={currentProjectedScore}
              goalScore={goalScore}
              aspiringCourse={aspiringCourse}
            />
            <AssessmentResultsSubjects
              subjectProficiency={subjectProficiency}
              getSubjectName={getSubjectName}
              getProficiencyLevel={getProficiencyLevel}
            />
            <AssessmentResultsPlan />
            <AssessmentResultsFooter handleStartLearning={handleStartLearning} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: LAYOUT.padding,
  },
});