// mobile/src/screens/mockExam/MockExamSessionScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMockExamStore } from '../../stores/mockExamStore';

interface MockExamSessionScreenProps {
  navigation: any;
}

export const MockExamSessionScreen: React.FC<MockExamSessionScreenProps> = ({ navigation }) => {
  const { 
    currentExam, 
    currentQuestionIndex, 
    answers,
    timeRemaining,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    endExam,
    isLoading
  } = useMockExamStore();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showConfirmExit, setShowConfirmExit] = useState(false);

  const currentQuestion = currentExam?.questions[currentQuestionIndex];
  const totalQuestions = currentExam?.questions.length || 0;

  useEffect(() => {
    // Handle hardware back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleExitAttempt();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    // Load existing answer for this question
    if (currentQuestion) {
      const existingAnswer = answers[currentQuestion.id];
      setSelectedAnswer(existingAnswer?.selectedAnswer ?? null);
    }
  }, [currentQuestionIndex, currentQuestion]);

  const handleExitAttempt = () => {
    Alert.alert(
      'Exit Mock Exam?',
      'Your progress will be saved. You can resume this exam later.',
      [
        { text: 'Continue Exam', style: 'cancel' },
        { 
          text: 'Exit', 
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null && currentQuestion) {
      submitAnswer(currentQuestion.id, selectedAnswer);
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      nextQuestion();
    } else {
      // Exam completed
      handleFinishExam();
    }
  };

  const handlePreviousQuestion = () => {
    if (selectedAnswer !== null && currentQuestion) {
      submitAnswer(currentQuestion.id, selectedAnswer);
    }
    previousQuestion();
  };

  const handleFinishExam = () => {
    Alert.alert(
      'Finish Exam?',
      'Are you sure you want to submit your exam? You cannot change your answers after submission.',
      [
        { text: 'Review', style: 'cancel' },
        { 
          text: 'Submit', 
          onPress: async () => {
            await endExam();
            navigation.navigate('MockExamResults');
          }
        }
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds: number) => {
    if (seconds < 300) return '#EF4444'; // Red for < 5 minutes
    if (seconds < 900) return '#F59E0B'; // Yellow for < 15 minutes
    return '#10B981'; // Green
  };

  if (!currentExam || !currentQuestion) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#6B7280' }}>Loading exam...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: 20,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB'
        }}>
          <TouchableOpacity onPress={handleExitAttempt}>
            <Text style={{ fontSize: 16, color: '#EF4444', fontWeight: '500' }}>Exit</Text>
          </TouchableOpacity>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              {currentQuestion.subject} • {currentQuestion.difficulty}
            </Text>
          </View>
          
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: 'bold', 
              color: getTimeColor(timeRemaining)
            }}>
              {formatTime(timeRemaining)}
            </Text>
            <Text style={{ fontSize: 10, color: '#6B7280' }}>Time left</Text>
          </View>
        </View>

        {/* Progress Indicators */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
          {/* Progress Bar */}
          <View style={{ 
            height: 4, 
            backgroundColor: '#E5E7EB', 
            borderRadius: 2, 
            overflow: 'hidden',
            marginBottom: 8
          }}>
            <View style={{ 
              height: '100%', 
              backgroundColor: '#3B82F6',
              width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`
            }} />
          </View>
          
          <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
            {answeredCount} answered • {totalQuestions - answeredCount} remaining
          </Text>
        </View>

        {/* Question Content */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
          {/* Question */}
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

          {/* Answer Options */}
          <View style={{ gap: 12, marginBottom: 24 }}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const existingAnswer = answers[currentQuestion.id];
              const wasAnswered = existingAnswer !== undefined;
              
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleAnswerSelect(index)}
                  style={{
                    backgroundColor: isSelected ? '#EFF6FF' : wasAnswered && existingAnswer.selectedAnswer === index ? '#F0FDF4' : 'white',
                    borderWidth: 2,
                    borderColor: isSelected ? '#3B82F6' : wasAnswered && existingAnswer.selectedAnswer === index ? '#10B981' : '#E5E7EB',
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
                    borderColor: isSelected ? '#3B82F6' : wasAnswered && existingAnswer.selectedAnswer === index ? '#10B981' : '#D1D5DB',
                    backgroundColor: isSelected ? '#3B82F6' : wasAnswered && existingAnswer.selectedAnswer === index ? '#10B981' : 'transparent',
                    marginRight: 12,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {(isSelected || (wasAnswered && existingAnswer.selectedAnswer === index)) && (
                      <Text style={{ 
                        color: 'white', 
                        fontSize: 12, 
                        fontWeight: 'bold' 
                      }}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    )}
                  </View>
                  <Text style={{ 
                    fontSize: 16, 
                    color: isSelected ? '#1E40AF' : wasAnswered && existingAnswer.selectedAnswer === index ? '#065F46' : '#374151',
                    flex: 1
                  }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Navigation */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB'
        }}>
          <TouchableOpacity
            onPress={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            style={{
              backgroundColor: currentQuestionIndex === 0 ? '#F3F4F6' : 'white',
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 24,
              opacity: currentQuestionIndex === 0 ? 0.5 : 1
            }}
          >
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '500',
              color: currentQuestionIndex === 0 ? '#9CA3AF' : '#374151'
            }}>
              ← Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={currentQuestionIndex === totalQuestions - 1 ? handleFinishExam : handleNextQuestion}
            style={{
              backgroundColor: '#3B82F6',
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 24
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '500', color: 'white' }}>
              {currentQuestionIndex === totalQuestions - 1 ? 'Finish Exam' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
