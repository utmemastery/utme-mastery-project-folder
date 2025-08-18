import React, { useState } from 'react';
import { View, ScrollView, Animated, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubjectSelectionHeader } from '../../components/onboarding/subject-selection/SubjectSelectionHeader';
import { SubjectSelectionList } from '../../components/onboarding/subject-selection/SubjectSelectionList';
import { SubjectSelectionFooter } from '../../components/onboarding/subject-selection/SubjectSelectionFooter';
import { useScreenAnimation } from '../../hooks/useScreenAnimation';
import { COLORS, LAYOUT } from '../../constants';

interface SubjectSelectionScreenProps extends NativeStackScreenProps<OnboardingStackParamList, 'SubjectSelection'> {}

export const SubjectSelectionScreen: React.FC<SubjectSelectionScreenProps> = ({ navigation }) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['english']);
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const toggleSubject = (subjectId: string) => {
    const subject = UTME_SUBJECTS.find(s => s.id === subjectId);
    
    if (subject?.required) {
      Alert.alert('Required Subject', `${subject.name} is required for all UTME candidates`);
      return;
    }

    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else if (prev.length < 4) {
        return [...prev, subjectId];
      } else {
        Alert.alert('Maximum Reached', 'You can only select 4 subjects for UTME');
        return prev;
      }
    });
  };

  const saveOnboardingProgress = async () => {
    await AsyncStorage.setItem('onboardingProgress', JSON.stringify({ selectedSubjects }));
  };

  const handleContinue = () => {
    if (selectedSubjects.length < 4) {
      Alert.alert('Incomplete Selection', `Please select ${4 - selectedSubjects.length} more subject(s)`);
      return;
    }
    saveOnboardingProgress();
    navigation.navigate('CourseSelection', { selectedSubjects });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <SubjectSelectionHeader />
            <SubjectSelectionList selectedSubjects={selectedSubjects} toggleSubject={toggleSubject} />
            <SubjectSelectionFooter handleBack={handleBack} handleContinue={handleContinue} isDisabled={selectedSubjects.length < 4} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const UTME_SUBJECTS = [
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