import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

// 🔹 Define the shape of a question
interface DiagnosticQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index in `options`
  difficulty: string;
}

// 🔹 Shape of answers stored for each subject
interface QuestionAnswer {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // seconds
}

// 🔹 Props for this screen
interface DiagnosticAssessmentScreenProps
  extends NativeStackScreenProps<RootStackParamList, 'DiagnosticAssessment'> {}

// 🔹 Mock questions
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
  yoruba: [{ id: 13, question: "Placeholder Yoruba question", options: ['A', 'B', 'C', 'D'], correctAnswer: 0, difficulty: 'easy' }],
  hausa: [{ id: 14, question: "Placeholder Hausa question", options: ['A', 'B', 'C', 'D'], correctAnswer: 0, difficulty: 'easy' }],
  igbo: [{ id: 15, question: "Placeholder Igbo question", options: ['A', 'B', 'C', 'D'], correctAnswer: 0, difficulty: 'easy' }],
};

export const DiagnosticAssessmentScreen: React.FC<DiagnosticAssessmentScreenProps> = ({
  navigation,
  route
}) => {
  const { selectedSubjects, aspiringCourse, goalScore, learningStyle } = route.params;
  const { updateProfile, isLoading } = useAuthStore();

  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer[]>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [subjectQuestions, setSubjectQuestions] = useState<DiagnosticQuestion[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const currentSubject = selectedSubjects[currentSubjectIndex];
  const currentQuestion = subjectQuestions[currentQuestionIndex];

  const totalQuestions = selectedSubjects.reduce((total, subject) => {
    return total + (DIAGNOSTIC_QUESTIONS[subject]?.length || 0);
  }, 0);
  const completedQuestions = Object.values(answers).flat().length;

  // Initialize answers object
  useEffect(() => {
    const initialAnswers: Record<string, QuestionAnswer[]> = {};
    selectedSubjects.forEach(subject => {
      initialAnswers[subject] = [];
    });
    setAnswers(initialAnswers);
  }, [selectedSubjects]);

  // Fetch questions for the current subject
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoadingQuestions(true);
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
        const fallbackQuestions = DIAGNOSTIC_QUESTIONS[currentSubject] || [];
        if (fallbackQuestions.length === 0) {
          Alert.alert('No Questions Available', `No diagnostic questions for ${currentSubject}. Skipping to next subject.`);
          handleNextSubject();
        } else {
          setSubjectQuestions(fallbackQuestions);
        }
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, [currentSubject]);

  const handleNextSubject = () => {
    if (currentSubjectIndex < selectedSubjects.length - 1) {
      setCurrentSubjectIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
    } else {
      setIsCompleted(true);
      handleCompleteAssessment(answers);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const newAnswers = { ...answers };
    newAnswers[currentSubject].push({
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      timeSpent: 30
    });
    setAnswers(newAnswers);

    if (currentQuestionIndex < subjectQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      handleNextSubject();
    }
  };

  const saveProgress = async (finalAnswers: Record<string, QuestionAnswer[]>) => {
    await AsyncStorage.setItem('assessmentProgress', JSON.stringify(finalAnswers));
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
        const correct = subjectAnswers.filter(a => a.isCorrect).length;
        const total = subjectAnswers.length;
        return {
          subject,
          proficiency: total > 0 ? (correct / total) * 100 : 0
        };
      });

      await updateProfile({
        selectedSubjects,
        aspiringCourse,
        goalScore,
        learningStyle,
        diagnosticResults: subjectProficiency,
        onboardingDone: true
      });

      navigation.replace('AssessmentResults', {
        subjectProficiency,
        goalScore,
        aspiringCourse
      });
    } catch {
      setRetryCount(prev => prev + 1);
      Alert.alert('Error', 'Failed to complete assessment. Please try again.', [
        { text: 'Retry', onPress: () => handleCompleteAssessment(finalAnswers) },
        { text: 'Back', onPress: () => navigation.goBack() }
      ]);
    }
  };

  if (isCompleted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 48, marginBottom: 24 }}>🎉</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 }}>
            Assessment Complete!
          </Text>
          <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
            Analyzing your results and creating your personalized study plan...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoadingQuestions || !currentQuestion) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 18, color: '#6B7280' }}>
            {isLoadingQuestions ? 'Loading questions...' : 'No questions available for this subject.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1 }}>
        <View style={{ padding: 24, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>Diagnostic Assessment</Text>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
              {completedQuestions + 1}/{totalQuestions}
            </Text>
          </View>
          <View style={{ height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
            <View
              style={{
                height: '100%',
                backgroundColor: '#3B82F6',
                width: `${((completedQuestions + 1) / totalQuestions) * 100}%`
              }}
            />
          </View>
          <Text style={{
            fontSize: 18,
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
