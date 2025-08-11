// mobile/src/screens/practice/PracticeSessionScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePracticeStore } from '../../stores/practiceStore';
import { Button } from '../../components/ui/Button';

interface PracticeSessionScreenProps {
  navigation: any;
}

export const PracticeSessionScreen: React.FC<PracticeSessionScreenProps> = ({ navigation }) => {
  const { 
    currentSession, 
    currentQuestionIndex, 
    submitAnswer, 
    endSession, 
    getNextQuestion 
  } = usePracticeStore();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [confidenceLevel, setConfidenceLevel] = useState<number | null>(null);

  const currentQuestion = getNextQuestion();
  const totalQuestions = currentSession?.questions.length || 0;
  const answeredQuestions = currentSession?.attempts.length || 0;

  useEffect(() => {
    // Timer for question
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex]);

  useEffect(() => {
    // Reset for new question
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeSpent(0);
    setConfidenceLevel(null);
  }, [currentQuestionIndex]);

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const attempt: QuestionAttempt = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      timeSpent,
      confidenceLevel: confidenceLevel || undefined
    };

    await submitAnswer(attempt);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (answeredQuestions >= totalQuestions) {
      handleEndSession();
    } else {
      setShowExplanation(false);
    }
  };

  const handleEndSession = async () => {
    await endSession();
    navigation.navigate('PracticeResults');
  };

  const handleQuitSession = () => {
    Alert.alert(
      'Quit Session?',
      'Your progress will be saved. Are you sure you want to quit?',
      [
        { text: 'Continue', style: 'cancel' },
        { 
          text: 'Quit', 
          style: 'destructive',
          onPress: handleEndSession
        }
      ]
    );
  };

  if (!currentSession || !currentQuestion) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#6B7280' }}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: 24,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB'
        }}>
          <TouchableOpacity onPress={handleQuitSession}>
            <Text style={{ fontSize: 16, color: '#EF4444' }}>✕</Text>
          </TouchableOpacity>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
              {answeredQuestions + 1} of {totalQuestions}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              {Math.round((timeSpent / 60) * 10) / 10} min
            </Text>
          </View>
          
          <Text style={{ fontSize: 14, color: '#3B82F6', fontWeight: '600' }}>
            {currentSession.sessionType.toUpperCase()}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
          <View style={{ 
            height: 4, 
            backgroundColor: '#E5E7EB', 
            borderRadius: 2, 
            overflow: 'hidden' 
          }}>
            <View style={{ 
              height: '100%', 
              backgroundColor: '#3B82F6',
              width: `${((answeredQuestions + 1) / totalQuestions) * 100}%`
            }} />
          </View>
        </View>

        {/* Question Content */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }}>
          {/* Subject & Difficulty */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ 
              fontSize: 14, 
              color: '#6B7280', 
              textTransform: 'capitalize' 
            }}>
              {currentQuestion.subject} • {currentQuestion.topic}
            </Text>
            <View style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              backgroundColor: getDifficultyColor(currentQuestion.difficulty).bg,
              borderRadius: 4
            }}>
              <Text style={{ 
                fontSize: 12, 
                color: getDifficultyColor(currentQuestion.difficulty).text,
                fontWeight: '500'
              }}>
                {currentQuestion.difficulty.toUpperCase()}
              </Text>
            </View>
          </View>

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

          {/* Confidence Level (before answering) */}
          {!showExplanation && selectedAnswer !== null && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 }}>
                How confident are you?
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(level => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setConfidenceLevel(level)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      backgroundColor: confidenceLevel === level ? '#EFF6FF' : '#F9FAFB',
                      borderWidth: 2,
                      borderColor: confidenceLevel === level ? '#3B82F6' : '#E5E7EB',
                      borderRadius: 8,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ 
                      fontSize: 12, 
                      color: confidenceLevel === level ? '#1E40AF' : '#6B7280',
                      fontWeight: '500'
                    }}>
                      {level === 1 ? 'Not sure' : level === 5 ? 'Very sure' : level.toString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Answer Options */}
          <View style={{ gap: 12, marginBottom: 24 }}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showResult = showExplanation;
              
              let backgroundColor = 'white';
              let borderColor = '#E5E7EB';
              let textColor = '#374151';
              
              if (showResult) {
                if (isCorrect) {
                  backgroundColor = '#F0FDF4';
                  borderColor = '#10B981';
                  textColor = '#065F46';
                } else if (isSelected && !isCorrect) {
                  backgroundColor = '#FEF2F2';
                  borderColor = '#EF4444';
                  textColor = '#991B1B';
                }
              } else if (isSelected) {
                backgroundColor = '#EFF6FF';
                borderColor = '#3B82F6';
                textColor = '#1E40AF';
              }
              
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => !showExplanation && setSelectedAnswer(index)}
                  disabled={showExplanation}
                  style={{
                    backgroundColor,
                    borderWidth: 2,
                    borderColor,
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
                    borderColor: showResult && isCorrect ? '#10B981' : 
                                showResult && isSelected && !isCorrect ? '#EF4444' :
                                isSelected ? '#3B82F6' : '#D1D5DB',
                    backgroundColor: showResult && isCorrect ? '#10B981' : 
                                   showResult && isSelected && !isCorrect ? '#EF4444' :
                                   isSelected ? '#3B82F6' : 'transparent',
                    marginRight: 12,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {showResult && isCorrect && (
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✕</Text>
                    )}
                    {!showResult && isSelected && (
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    )}
                  </View>
                  <Text style={{ 
                    fontSize: 16, 
                    color: textColor,
                    flex: 1,
                    fontWeight: showResult && (isCorrect || (isSelected && !isCorrect)) ? '600' : 'normal'
                  }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explanation */}
          {showExplanation && (
            <View style={{ 
              backgroundColor: '#F0F9FF', 
              padding: 20, 
              borderRadius: 12, 
              marginBottom: 24,
              borderLeftWidth: 4,
              borderLeftColor: '#3B82F6'
            }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1E40AF', marginBottom: 8 }}>
                Explanation
              </Text>
              <Text style={{ fontSize: 14, color: '#1E40AF', lineHeight: 20 }}>
                {currentQuestion.explanation}
              </Text>
              
              {/* Performance Feedback */}
              <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#BFDBFE' }}>
                <Text style={{ fontSize: 12, color: '#1E40AF' }}>
                  ⏱️ Time: {timeSpent}s • 
                  {confidenceLevel && ` 🎯 Confidence: ${confidenceLevel}/5 • `}
                  💡 Cognitive Level: {currentQuestion.cognitiveLevel}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={{ padding: 24 }}>
          {!showExplanation ? (
            <Button
              title="Submit Answer"
              onPress={handleAnswerSubmit}
              disabled={selectedAnswer === null}
              size="large"
            />
          ) : (
            <Button
              title={answeredQuestions >= totalQuestions ? "View Results" : "Next Question"}
              onPress={handleNextQuestion}
              size="large"
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};