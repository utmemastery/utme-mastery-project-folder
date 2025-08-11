// mobile/src/screens/onboarding/DiagnosticAssessmentScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';

interface DiagnosticAssessmentScreenProps {
  navigation: any;
  route: {
    params: {
      selectedSubjects: string[];
      aspiringCourse: string;
      goalScore: number;
      learningStyle: string;
    };
  };
}

// Mock diagnostic questions - in real app, these would come from API
const DIAGNOSTIC_QUESTIONS = {
  english: [
    {
      id: 1,
      question: "Choose the correct option to fill the gap:\n'The students _____ to school every day.'",
      options: ['goes', 'go', 'going', 'went'],
      correctAnswer: 1,
      difficulty: 'easy'
    },
    // Add more questions...
  ],
  mathematics: [
    {
      id: 2,
      question: "Solve: 3x + 7 = 22",
      options: ['x = 5', 'x = 6', 'x = 7', 'x = 8'],
      correctAnswer: 0,
      difficulty: 'medium'
    },
    // Add more questions...
  ]
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
  const [answers, setAnswers] = useState<Record<string, any[]>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentSubject = selectedSubjects[currentSubjectIndex];
  const subjectQuestions = DIAGNOSTIC_QUESTIONS[currentSubject as keyof typeof DIAGNOSTIC_QUESTIONS] || [];
  const currentQuestion = subjectQuestions[currentQuestionIndex];

  const totalQuestions = selectedSubjects.reduce((total, subject) => {
    return total + (DIAGNOSTIC_QUESTIONS[subject as keyof typeof DIAGNOSTIC_QUESTIONS]?.length || 0);
  }, 0);

  const completedQuestions = Object.values(answers).flat().length;

  useEffect(() => {
    // Initialize answers object
    const initialAnswers: Record<string, any[]> = {};
    selectedSubjects.forEach(subject => {
      initialAnswers[subject] = [];
    });
    setAnswers(initialAnswers);
  }, [selectedSubjects]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    // Save answer
    const newAnswers = { ...answers };
    newAnswers[currentSubject].push({
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      timeSpent: 30 // You can track actual time
    });
    setAnswers(newAnswers);

    // Move to next question
    if (currentQuestionIndex < subjectQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else if (currentSubjectIndex < selectedSubjects.length - 1) {
      // Move to next subject
      setCurrentSubjectIndex(currentSubjectIndex + 1);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
    } else {
      // Assessment completed
      setIsCompleted(true);
      handleCompleteAssessment(newAnswers);
    }
  };

  const handleCompleteAssessment = async (finalAnswers: Record<string, any[]>) => {
    try {
      // Calculate proficiency levels
      const subjectProficiency = selectedSubjects.map(subject => {
        const subjectAnswers = finalAnswers[subject];
        const correct = subjectAnswers.filter(a => a.isCorrect).length;
        const total = subjectAnswers.length;
        return {
          subject,
          proficiency: total > 0 ? (correct / total) * 100 : 0
        };
      });

      // Complete onboarding
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
    } catch (error) {
      Alert.alert('Error', 'Failed to complete assessment. Please try again.');
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

  if (!currentQuestion) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 18, color: '#6B7280' }}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1 }}>
        {/* Progress Header */}
        <View style={{ padding: 24, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
              Diagnostic Assessment
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
              {completedQuestions + 1}/{totalQuestions}
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View style={{ 
            height: 4, 
            backgroundColor: '#E5E7EB', 
            borderRadius: 2, 
            overflow: 'hidden' 
          }}>
            <View style={{ 
              height: '100%', 
              backgroundColor: '#3B82F6',
              width: `${((completedQuestions + 1) / totalQuestions) * 100}%`
            }} />
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

        {/* Question */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }}>
          <View style={{ 
            backgroundColor: '#F9FAFB', 
            padding: 20, 
            borderRadius: 12, 
            marginBottom: 24 
          }}>
            <Text style={{ 
              fontSize: 16, 
              color: '#1F2937', 
              lineHeight: 24,
              fontWeight: '500'
            }}>
              {currentQuestion.question}
            </Text>
          </View>

          {/* Options */}
          <View style={{ gap: 12 }}>
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
                    alignItems: 'center'
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

        {/* Next Button */}
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