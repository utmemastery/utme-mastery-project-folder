import React, { useState, useEffect } from 'react';
import { View, ScrollView, Animated, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiagnosticAssessmentHeader } from '../../components/onboarding/diagnostic-assessment/DiagnosticAssessmentHeader';
import { DiagnosticAssessmentQuestion } from '../../components/onboarding/diagnostic-assessment/DiagnosticAssessmentQuestion';
import { DiagnosticAssessmentFooter } from '../../components/onboarding/diagnostic-assessment/DiagnosticAssessmentFooter';
import { useScreenAnimation } from '../../hooks/useScreenAnimation';
import { COLORS, LAYOUT } from '../../constants';

interface DiagnosticQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: string;
}

interface QuestionAnswer {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

interface DiagnosticAssessmentScreenProps extends NativeStackScreenProps<OnboardingStackParamList, 'DiagnosticAssessment'> {}

export const DiagnosticAssessmentScreen: React.FC<DiagnosticAssessmentScreenProps> = ({ navigation, route }) => {
  const { selectedSubjects, aspiringCourse, goalScore, learningStyle } = route.params;
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const { updateProfile } = useAuthStore();
  const { fadeAnim, slideAnim } = useScreenAnimation();

  const subjectQuestions = DIAGNOSTIC_QUESTIONS[selectedSubjects[currentSubjectIndex]];
  const currentQuestion = subjectQuestions[currentQuestionIndex];
  const currentSubject = selectedSubjects[currentSubjectIndex];

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === null) {
      Alert.alert('Select an Answer', 'Please choose an option before proceeding');
      return;
    }

    setIsLoading(true);

    const timeSpent = (Date.now() - startTime) / 1000;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const newAnswer: QuestionAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: selectedAnswer!,
      isCorrect,
      timeSpent,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    // Move to next question/subject if not finished
    if (currentQuestionIndex < subjectQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setStartTime(Date.now());
      setIsLoading(false);
      return;
    }

    if (currentSubjectIndex < selectedSubjects.length - 1) {
      setCurrentSubjectIndex(currentSubjectIndex + 1);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setStartTime(Date.now());
      setIsLoading(false);
      return;
    }

    // All subjects finished — prepare results and navigate
    const subjectProficiency = selectedSubjects.map(subject => {
      const subjectAnswers = updatedAnswers.filter(a =>
        DIAGNOSTIC_QUESTIONS[subject].some(q => q.id === a.questionId)
      );
      const correctCount = subjectAnswers.filter(a => a.isCorrect).length;
      const totalQuestions = DIAGNOSTIC_QUESTIONS[subject].length;
      return { subject, proficiency: (correctCount / totalQuestions) * 100 };
    });

    // Navigate to AssessmentResults without updating profile
    navigation.navigate('AssessmentResults', {
      subjectProficiency,
      goalScore,
      aspiringCourse,
      selectedSubjects,
      learningStyle,
    });

    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <DiagnosticAssessmentHeader currentSubject={currentSubject} />
            <DiagnosticAssessmentQuestion
              currentQuestion={currentQuestion}
              selectedAnswer={selectedAnswer}
              handleAnswerSelect={handleAnswerSelect}
            />
            <DiagnosticAssessmentFooter
              isLastQuestion={currentSubjectIndex === selectedSubjects.length - 1 && currentQuestionIndex === subjectQuestions.length - 1}
              handleNextQuestion={handleNextQuestion}
              isDisabled={selectedAnswer === null}
              isLoading={isLoading}
            />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const DIAGNOSTIC_QUESTIONS: Record<string, DiagnosticQuestion[]> = {
  english: [
    {
      id: 1,
      question: "Choose the correct option to fill the gap:\n'The students _____ to school every day.'",
      options: ['goes', 'go', 'going', 'went'],
      correctAnswer: 1,
      difficulty: 'easy'
    },
  ],
  mathematics: [
    {
      id: 2,
      question: "Solve: 3x + 7 = 22",
      options: ['x = 5', 'x = 6', 'x = 7', 'x = 8'],
      correctAnswer: 0,
      difficulty: 'medium'
    },
  ],
  physics: [{ id: 3, question: "Placeholder physics question", options: ['A', 'B', 'C', 'D'], correctAnswer: 0, difficulty: 'easy' }],
  chemistry: [{ id: 4, question: "Placeholder chemistry question", options: ['A', 'B', 'C', 'D'], correctAnswer: 0, difficulty: 'easy' }],
  biology: [{ id: 5, question: "Placeholder biology question", options: ['A', 'B', 'C', 'D'], correctAnswer: 0, difficulty: 'easy' }],
  geography: [{ id: 6, question: "Placeholder geography question", options: ['A', 'B', 'C', 'D'], correctAnswer: 0, difficulty: 'easy' }],
  economics: [{ id: 7, question: "Placeholder economics question", options: ['A', 'B', 'C', 'D'], correctAnswer: 0, difficulty: 'easy' }],
  government: [{ id: 8, question: "Placeholder government question", options: ['A', 'B', 'C', 'D'], correctAnswer: 0, difficulty: 'easy' }],
  literature: [{ id: 9, question: "Placeholder literature question", options: ['A', 'B', 'C', 'D'], correctAnswer: 0, difficulty: 'easy' }],
  history: [{ id: 10, question: "Placeholder history question", options: ['A', 'B', 'C', 'D'], correctAnswer: 0, difficulty: 'easy' }],
  crs: [{ id: 11, question: "Placeholder CRS question", options: ['A', 'B', 'C', 'D'], correctAnswer: 0, difficulty: 'easy' }],
  irs: [{ id: 12, question: "Placeholder IRS question", options: ['A', 'B', 'C', 'D'], correctAnswer: 0, difficulty: 'easy' }],
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