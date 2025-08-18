import React, { useState } from 'react';
import { View, ScrollView, Animated, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';
import { GoalSettingHeader } from '../../components/onboarding/goal-setting/GoalSettingHeader';
import { GoalSettingForm } from '../../components/onboarding/goal-setting/GoalSettingForm';
import { GoalSettingStyles } from '../../components/onboarding/goal-setting/GoalSettingStyles';
import { GoalSettingFooter } from '../../components/onboarding/goal-setting/GoalSettingFooter';
import { useScreenAnimation } from '../../hooks/useScreenAnimation';
import { COLORS, LAYOUT } from '../../constants';

interface GoalSettingScreenProps extends NativeStackScreenProps<OnboardingStackParamList, 'GoalSetting'> {}

export const GoalSettingScreen: React.FC<GoalSettingScreenProps> = ({ navigation, route }) => {
  const { selectedSubjects, aspiringCourse, suggestedScore } = route.params;
  const [goalScore, setGoalScore] = useState(suggestedScore.toString());
  const [learningStyle, setLearningStyle] = useState<string>('');
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const handleContinue = () => {
    const numericGoal = parseInt(goalScore);
    
    if (numericGoal < 200 || numericGoal > 400) {
      Alert.alert('Invalid Score', 'Goal score must be between 200 and 400');
      return;
    }

    if (!learningStyle) {
      Alert.alert('Learning Style Required', 'Please select a learning style');
      return;
    }

    navigation.navigate('DiagnosticAssessment', {
      selectedSubjects,
      aspiringCourse,
      goalScore: numericGoal,
      learningStyle,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <GoalSettingHeader />
            <GoalSettingForm
              aspiringCourse={aspiringCourse}
              goalScore={goalScore}
              setGoalScore={setGoalScore}
            />
            <GoalSettingStyles learningStyle={learningStyle} setLearningStyle={setLearningStyle} />
            <GoalSettingFooter
              handleBack={() => navigation.goBack()}
              handleContinue={handleContinue}
              isDisabled={!learningStyle || !goalScore || parseInt(goalScore) < 200 || parseInt(goalScore) > 400}
            />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

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