import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

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

interface DiagnosticAssessmentScreenProps
  extends NativeStackScreenProps<RootStackParamList, 'DiagnosticAssessment'> {}

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

export const DiagnosticAssessmentScreen: React.FC<DiagnosticAssessmentScreenProps> = ({
  navigation,
  route,
}) => {
  const { selectedSubjects, aspiringCourse, goalScore, learningStyle } = route.params;
  const { updateProfile } = useAuthStore();
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [subjectQuestions, setSubjectQuestions] = useState<DiagnosticQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer[]>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const currentSubject = selectedSubjects[currentSubjectIndex];
  const currentQuestion = subjectQuestions[currentQuestionIndex];

  const saveProgress = async (currentAnswers: Record<string, QuestionAnswer[]>) => {
    await AsyncStorage.setItem('assessmentProgress', JSON.stringify({
      currentSubjectIndex,
      currentQuestionIndex,
      answers: currentAnswers,
      selectedSubjects,
      aspiringCourse,
      goalScore,
      learningStyle
    }));
  };

  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<{ questions: DiagnosticQuestion[] }>(
          `/questions/diagnostic/${currentSubject}`
        );
        const questions = response.data.questions || [];
        if (questions.length > 0) {
          setSubjectQuestions(questions);
          await AsyncStorage.setItem(`questions_${currentSubject}`, JSON.stringify(questions));
        } else {
          const cached = await AsyncStorage.getItem(`questions_${currentSubject}`);
          const fallbackQuestions: DiagnosticQuestion[] = cached
            ? JSON.parse(cached)
            : DIAGNOSTIC_QUESTIONS[currentSubject] || [];
          if (fallbackQuestions.length === 0) {
            Alert.alert('No Questions Available', `No diagnostic questions for ${currentSubject}. Skipping to next subject.`);
            handleNextSubject();
          } else {
            setSubjectQuestions(fallbackQuestions);
          }
        }
      } catch {
        const cached = await AsyncStorage.getItem(`questions_${currentSubject}`);
        const fallbackQuestions: DiagnosticQuestion[] = cached
          ? JSON.parse(cached)
          : DIAGNOSTIC_QUESTIONS[currentSubject] || [];
        if (fallbackQuestions.length === 0) {
          Alert.alert('No Questions Available', `No diagnostic questions for ${currentSubject}. Skipping to next subject.`);
          handleNextSubject();
        } else {
          setSubjectQuestions(fallbackQuestions);
        }
      }
      setIsLoading(false);
    };

    loadQuestions();
  }, [currentSubject]);

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNextSubject = () => {
    if (currentSubjectIndex < selectedSubjects.length - 1) {
      setCurrentSubjectIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setSubjectQuestions([]);
    } else {
      handleCompleteAssessment(answers);
    }
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === null) return;

    const newAnswers = { ...answers };
    if (!newAnswers[currentSubject]) {
      newAnswers[currentSubject] = [];
    }
    newAnswers[currentSubject].push({
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      timeSpent: 30 // Placeholder
    });
    setAnswers(newAnswers);
    await saveProgress(newAnswers);

    if (currentQuestionIndex < subjectQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      handleNextSubject();
    }
  };

  const handleCompleteAssessment = async (finalAnswers: Record<string, QuestionAnswer[]>) => {
    if (retryCount >= maxRetries) {
      await saveProgress(finalAnswers);
      Alert.alert('Too Many Attempts', 'Progress saved. Please try again later.');
      navigation.navigate('Welcome');
      return;
    }

    try {
      const subjectProficiency = selectedSubjects.map(subject => {
        const subjectAnswers = finalAnswers[subject];
        const correct = subjectAnswers?.filter(a => a.isCorrect).length || 0;
        const total = subjectAnswers?.length || 0;
        return {
          subject,
          proficiency: total > 0 ? (correct / total) * 100 : 0
        };
      });

      console.log('Updating profile with:', {
        selectedSubjects,
        aspiringCourse,
        goalScore,
        learningStyle,
        diagnosticResults: subjectProficiency,
        onboardingDone: true
      });

      // Clear onboarding progress first
      await AsyncStorage.removeItem('onboardingProgress');
      await AsyncStorage.removeItem('assessmentProgress');
      console.log('Cleared onboarding and assessment progress from AsyncStorage');

      // Navigate to AssessmentResults before updating profile
      console.log('Navigating to AssessmentResults with params:', { subjectProficiency, goalScore, aspiringCourse });
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Onboarding',
            params: {
              screen: 'AssessmentResults',
              params: { subjectProficiency, goalScore, aspiringCourse }
            }
          }
        ]
      });

      // Update profile after navigation
      await updateProfile({
        selectedSubjects,
        aspiringCourse,
        goalScore,
        learningStyle,
        diagnosticResults: subjectProficiency,
        onboardingDone: true
      });
    } catch (error: unknown) {
  console.error('Update profile error:', error);

  const errorMessage = error instanceof Error ? error.message : String(error);

  setRetryCount(prev => prev + 1);
  Alert.alert('Error', `Failed to complete assessment: ${errorMessage}. Please try again.`, [
    { text: 'Retry', onPress: () => handleCompleteAssessment(finalAnswers) },
    { text: 'Back', onPress: () => navigation.goBack() }
  ]);
}

  };

  if (isLoading || !currentQuestion) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1 }}>
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
            Question {currentQuestionIndex + 1} of {subjectQuestions.length}
          </Text>
          <Text style={{
            fontSize: 20,
            fontWeight: '600',
            color: '#1F2937',
            marginTop: 16,
            textTransform: 'capitalize'
          }}>
            {currentSubject.replace('_', ' ')}
          </Text>
        </View>
        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }}>
          <View style={{ backgroundColor: '#F9FAFB', padding: 20, borderRadius: 12, marginBottom: 24 }}>
            <Text style={{ fontSize: 16, color: '#1F2937', lineHeight: 24, fontWeight: '500' }}>
              {currentQuestion.question}
            </Text>
          </View>
          <View style={{ marginRight: 12, marginBottom: 12 }}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleAnswerSelect(index)}
                  style={{
                    backgroundColor: isSelected ? '#EFF6FF' : 'white',
                    borderWidth: 2,
                    borderColor: isSelected ? '#3B82F6' : '#E5E7EB',
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12
                  }}
                >
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: isSelected ? '#3B82F6' : '#D1D5DB',
                    backgroundColor: isSelected ? '#3B82F6' : 'transparent',
                    marginRight: 12,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {isSelected && (
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    )}
                  </View>
                  <Text style={{
                    fontSize: 16,
                    color: isSelected ? '#1E40AF' : '#374151',
                    flex: 1
                  }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        <View style={{ padding: 24 }}>
          <Button
            title={
              currentSubjectIndex === selectedSubjects.length - 1 &&
              currentQuestionIndex === subjectQuestions.length - 1
                ? "Complete Assessment"
                : "Next Question"
            }
            onPress={handleNextQuestion}
            disabled={selectedAnswer === null}
            loading={isLoading}
            size="large"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};