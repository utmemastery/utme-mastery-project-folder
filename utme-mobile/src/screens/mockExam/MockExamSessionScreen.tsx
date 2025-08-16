import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, BackHandler, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMockExamStore, MockExamQuestion } from '../../stores/mockExamStore';

interface MockExamSessionScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

export const MockExamSessionScreen: React.FC<MockExamSessionScreenProps> = ({ navigation }) => {
  const { 
    currentExam, 
    currentQuestionIndex, 
    answers,
    timeRemaining,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    jumpToQuestion,
    getQuestionStatus,
    getProgressSummary,
    getCompletion,
    getActiveQuestion,
    endExam,
    isLoading,
    error,
    clearError
  } = useMockExamStore();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showLowTimeWarning, setShowLowTimeWarning] = useState(false);
  const [showCriticalTimeWarning, setShowCriticalTimeWarning] = useState(false);
  const [showQuestionOverview, setShowQuestionOverview] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const currentQuestion = getActiveQuestion();
  const totalQuestions = currentExam?.questions.length || 0;
  const progressSummary = getProgressSummary();
  const completionPercentage = getCompletion();

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
      setSelectedAnswer(existingAnswer?.selectedOptionId ?? null);
    }
  }, [currentQuestionIndex, currentQuestion, answers]);

  useEffect(() => {
    // Time-based warnings
    if (timeRemaining <= 60 && timeRemaining > 0 && !showCriticalTimeWarning) {
      setShowCriticalTimeWarning(true);
      Alert.alert(
        '⚠️ Critical Time Warning',
        'Less than 1 minute remaining! Your exam will auto-submit when time runs out.',
        [{ text: 'Continue', onPress: () => setShowCriticalTimeWarning(false) }]
      );
    } else if (timeRemaining <= 300 && timeRemaining > 60) {
      setShowLowTimeWarning(true);
    } else if (timeRemaining > 300) {
      setShowLowTimeWarning(false);
    }

    // Auto-submit when time runs out
    if (timeRemaining === 0 && currentExam) {
      Alert.alert(
        'Time Up!',
        'Your exam time has expired. Submitting automatically...',
        [{ text: 'OK', onPress: async () => {
          await endExam();
          navigation.navigate('MockExamResults');
        }}]
      );
    }
  }, [timeRemaining]);

  useEffect(() => {
    // Clear any existing errors when component mounts
    if (error) {
      clearError();
    }
  }, []);

  const handleExitAttempt = () => {
    Alert.alert(
      'Exit Mock Exam?',
      `Your progress will be saved automatically. You have answered ${progressSummary.answered} out of ${progressSummary.total} questions.\n\nYou can resume this exam later from where you left off.`,
      [
        { text: 'Continue Exam', style: 'cancel' },
        { 
          text: 'Exit & Save', 
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (currentQuestion) {
      const optionId = currentQuestion.optionIds ? currentQuestion.optionIds[answerIndex] : answerIndex;
      setSelectedAnswer(optionId);
      // Immediately save the answer
      submitAnswer(currentQuestion.id, optionId);
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestion) {
      // Submit with -1 to indicate skipped
      submitAnswer(currentQuestion.id, -1);
      setSelectedAnswer(-1);
      
      if (currentQuestionIndex < totalQuestions - 1) {
        nextQuestion();
      } else {
        // If this is the last question, show completion dialog
        handleFinishExam();
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      nextQuestion();
    } else {
      handleFinishExam();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      previousQuestion();
    }
  };

  const handleQuestionJump = (questionIndex: number) => {
    jumpToQuestion(questionIndex);
    setShowQuestionOverview(false);
  };

  const handleFinishExam = () => {
    const { answered, unanswered, skipped } = progressSummary;
    
    let message = `You have completed ${answered} questions`;
    if (unanswered > 0) message += `, ${unanswered} unanswered`;
    if (skipped > 0) message += `, ${skipped} skipped`;
    message += `.\n\nAre you sure you want to submit your exam? You cannot change your answers after submission.`;

    setShowConfirmSubmit(true);
  };

  const confirmSubmitExam = async () => {
    setShowConfirmSubmit(false);
    try {
      await endExam();
      navigation.navigate('MockExamResults');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit exam. Please try again.');
    }
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
    if (seconds < 60) return '#DC2626'; // Red for < 1 minute
    if (seconds < 300) return '#EF4444'; // Red for < 5 minutes
    if (seconds < 900) return '#F59E0B'; // Amber for < 15 minutes
    return '#10B981'; // Green
  };

  const getQuestionStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return '#10B981';
      case 'skipped': return '#F59E0B';
      case 'unanswered': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getQuestionStatusIcon = (status: string) => {
    switch (status) {
      case 'answered': return '✓';
      case 'skipped': return '⏭';
      case 'unanswered': return '○';
      default: return '○';
    }
  };

  if (isLoading || !currentExam || !currentQuestion) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ fontSize: 18, color: '#6B7280', marginTop: 16 }}>
            {currentExam ? 'Loading question...' : 'Preparing exam...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 24, marginBottom: 8 }}>⚠️</Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 8, textAlign: 'center' }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 16, color: '#EF4444', textAlign: 'center', marginBottom: 24 }}>
            {error}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                backgroundColor: '#6B7280',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 20
              }}
            >
              <Text style={{ color: 'white', fontWeight: '500' }}>Return to Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={clearError}
              style={{
                backgroundColor: '#3B82F6',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 20
              }}
            >
              <Text style={{ color: 'white', fontWeight: '500' }}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestionStatus = getQuestionStatus(currentQuestion.id);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1 }}>
        {/* Time Warnings */}
        {showLowTimeWarning && timeRemaining > 60 && (
          <View style={{
            backgroundColor: '#FEF3C7',
            padding: 12,
            margin: 16,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: '#F59E0B'
          }}>
            <Text style={{ fontSize: 14, color: '#92400E', fontWeight: '500' }}>
              ⏰ Less than 5 minutes remaining! Consider reviewing your answers.
            </Text>
          </View>
        )}

        {timeRemaining <= 60 && timeRemaining > 0 && (
          <View style={{
            backgroundColor: '#FEE2E2',
            padding: 12,
            margin: 16,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: '#DC2626'
          }}>
            <Text style={{ fontSize: 14, color: '#991B1B', fontWeight: '600' }}>
              🚨 Critical: Less than 1 minute remaining!
            </Text>
          </View>
        )}

        {/* Enhanced Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
          backgroundColor: '#F9FAFB'
        }}>
          <TouchableOpacity onPress={handleExitAttempt}>
            <Text style={{ fontSize: 16, color: '#EF4444', fontWeight: '600' }}>
              Exit
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowQuestionOverview(true)}
            style={{ alignItems: 'center' }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              {currentQuestion.subject} • {currentQuestion.difficulty} • Tap for overview
            </Text>
          </TouchableOpacity>
          
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: getTimeColor(timeRemaining)
            }}>
              {formatTime(timeRemaining)}
            </Text>
            <Text style={{ fontSize: 10, color: '#6B7280' }}>
              Time left
            </Text>
          </View>
        </View>

        {/* Enhanced Progress Bar */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
          <View style={{ 
            height: 6, 
            backgroundColor: '#E5E7EB', 
            borderRadius: 3, 
            overflow: 'hidden',
            marginBottom: 12
          }}>
            <View style={{ 
              height: '100%', 
              backgroundColor: '#3B82F6',
              width: `${completionPercentage}%`,
              borderRadius: 3
            }} />
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              Progress: {completionPercentage}% complete
            </Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Text style={{ fontSize: 12, color: '#10B981' }}>
                ✓ {progressSummary.answered}
              </Text>
              <Text style={{ fontSize: 12, color: '#F59E0B' }}>
                ⏭ {progressSummary.skipped}
              </Text>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>
                ○ {progressSummary.unanswered}
              </Text>
            </View>
          </View>
        </View>

        {/* Question Content */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
          {/* Question Status Badge */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 16 
          }}>
            <View style={{
              backgroundColor: getQuestionStatusColor(currentQuestionStatus) + '20',
              borderWidth: 1,
              borderColor: getQuestionStatusColor(currentQuestionStatus),
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 4
            }}>
              <Text style={{ 
                fontSize: 12, 
                fontWeight: '600',
                color: getQuestionStatusColor(currentQuestionStatus) 
              }}>
                {getQuestionStatusIcon(currentQuestionStatus)} {currentQuestionStatus.toUpperCase()}
              </Text>
            </View>
            {currentQuestion.topic && (
              <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 8 }}>
                Topic: {currentQuestion.topic}
              </Text>
            )}
          </View>

          {/* Question Text */}
          <View style={{ 
            backgroundColor: '#F9FAFB', 
            padding: 20, 
            borderRadius: 12, 
            marginBottom: 24,
            borderWidth: 1,
            borderColor: '#E5E7EB'
          }}>
            <Text style={{ 
              fontSize: 17, 
              color: '#1F2937', 
              lineHeight: 26,
              fontWeight: '500'
            }}>
              {currentQuestion.question}
            </Text>
          </View>

          {/* Answer Options */}
          <View style={{ gap: 12, marginBottom: 32 }}>
            {currentQuestion.options.map((option, index) => {
              const optionId = currentQuestion.optionIds ? currentQuestion.optionIds[index] : index;
              const isSelected = selectedAnswer === optionId;
              const existingAnswer = answers[currentQuestion.id];
              const wasAnswered = existingAnswer && existingAnswer.selectedOptionId === optionId;
              
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleAnswerSelect(index)}
                  style={{
                    backgroundColor: isSelected ? '#EFF6FF' : wasAnswered ? '#F0FDF4' : 'white',
                    borderWidth: 2,
                    borderColor: isSelected ? '#3B82F6' : wasAnswered ? '#10B981' : '#E5E7EB',
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    minHeight: 60
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: isSelected ? '#3B82F6' : wasAnswered ? '#10B981' : '#D1D5DB',
                    backgroundColor: isSelected ? '#3B82F6' : wasAnswered ? '#10B981' : 'transparent',
                    marginRight: 16,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Text style={{ 
                      color: (isSelected || wasAnswered) ? 'white' : '#6B7280', 
                      fontSize: 14, 
                      fontWeight: 'bold' 
                    }}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={{ 
                    fontSize: 16, 
                    color: isSelected ? '#1E40AF' : wasAnswered ? '#065F46' : '#374151',
                    flex: 1,
                    lineHeight: 22
                  }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Enhanced Navigation */}
        <View style={{ 
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          backgroundColor: '#FAFAFA'
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <TouchableOpacity
              onPress={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              style={{
                backgroundColor: currentQuestionIndex === 0 ? '#F3F4F6' : 'white',
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 20,
                opacity: currentQuestionIndex === 0 ? 0.5 : 1,
                minWidth: 100
              }}
            >
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '500',
                color: currentQuestionIndex === 0 ? '#9CA3AF' : '#374151',
                textAlign: 'center'
              }}>
                ← Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkipQuestion}
              style={{
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#F59E0B',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 16,
                minWidth: 80
              }}
            >
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '500',
                color: '#D97706',
                textAlign: 'center'
              }}>
                Skip
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={currentQuestionIndex === totalQuestions - 1 ? handleFinishExam : handleNextQuestion}
              style={{
                backgroundColor: '#3B82F6',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 20,
                minWidth: 100
              }}
            >
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '500', 
                color: 'white',
                textAlign: 'center'
              }}>
                {currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Question Overview Modal */}
        <Modal
          visible={showQuestionOverview}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowQuestionOverview(false)}
        >
          <View style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            justifyContent: 'flex-end' 
          }}>
            <View style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '80%',
              paddingTop: 20
            }}>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#E5E7EB'
              }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>
                  Question Overview
                </Text>
                <TouchableOpacity onPress={() => setShowQuestionOverview(false)}>
                  <Text style={{ fontSize: 24, color: '#6B7280' }}>×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 400 }}>
                <View style={{ 
                  flexDirection: 'row', 
                  flexWrap: 'wrap', 
                  padding: 20,
                  gap: 12
                }}>
                  {currentExam?.questions.map((_, index) => {
                    const question = currentExam.questions[index];
                    const status = getQuestionStatus(question.id);
                    const isCurrentQuestion = index === currentQuestionIndex;
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleQuestionJump(index)}
                        style={{
                          width: (width - 64) / 6,
                          height: 48,
                          backgroundColor: isCurrentQuestion ? '#3B82F6' : 
                            status === 'answered' ? '#10B981' : 
                            status === 'skipped' ? '#F59E0B' : 'white',
                          borderWidth: 1,
                          borderColor: isCurrentQuestion ? '#3B82F6' : 
                            status === 'answered' ? '#10B981' : 
                            status === 'skipped' ? '#F59E0B' : '#D1D5DB',
                          borderRadius: 8,
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: (isCurrentQuestion || status !== 'unanswered') ? 'white' : '#6B7280'
                        }}>
                          {index + 1}
                        </Text>
                        <Text style={{
                          fontSize: 8,
                          color: (isCurrentQuestion || status !== 'unanswered') ? 'white' : '#6B7280'
                        }}>
                          {getQuestionStatusIcon(status)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                
                <View style={{ padding: 20, paddingTop: 0 }}>
                  <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
                    Legend:
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <Text style={{ fontSize: 12, color: '#10B981' }}>✓ Answered</Text>
                    <Text style={{ fontSize: 12, color: '#F59E0B' }}>⏭ Skipped</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>○ Unanswered</Text>
                    <Text style={{ fontSize: 12, color: '#3B82F6' }}>● Current</Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Confirm Submit Modal */}
        <Modal
          visible={showConfirmSubmit}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowConfirmSubmit(false)}
        >
          <View style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20
          }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 400
            }}>
              <Text style={{ 
                fontSize: 20, 
                fontWeight: '600', 
                color: '#1F2937',
                marginBottom: 16,
                textAlign: 'center'
              }}>
                Submit Exam?
              </Text>
              
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: '#6B7280' }}>Answered:</Text>
                  <Text style={{ color: '#10B981', fontWeight: '500' }}>{progressSummary.answered} questions</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: '#6B7280' }}>Skipped:</Text>
                  <Text style={{ color: '#F59E0B', fontWeight: '500' }}>{progressSummary.skipped} questions</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: '#6B7280' }}>Unanswered:</Text>
                  <Text style={{ color: '#EF4444', fontWeight: '500' }}>{progressSummary.unanswered} questions</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                  <Text style={{ fontWeight: '600' }}>Completion:</Text>
                  <Text style={{ fontWeight: '600', color: '#3B82F6' }}>{completionPercentage}%</Text>
                </View>
              </View>

              <Text style={{ 
                fontSize: 14, 
                color: '#6B7280',
                textAlign: 'center',
                marginBottom: 24
              }}>
                You cannot change your answers after submission.
              </Text>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setShowConfirmSubmit(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                    paddingVertical: 12,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#374151', fontWeight: '500' }}>Review</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={confirmSubmitExam}
                  style={{
                    flex: 1,
                    backgroundColor: '#3B82F6',
                    borderRadius: 8,
                    paddingVertical: 12,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '500' }}>Submit Exam</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};