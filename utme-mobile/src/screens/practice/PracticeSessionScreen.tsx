import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Slider from '@react-native-community/slider';

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
    getNextQuestion,
    settings
  } = usePracticeStore();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [confidenceLevel, setConfidenceLevel] = useState<number | null>(null);

  const currentQuestion = getNextQuestion();
  const totalQuestions = currentSession?.questionCount || 0;
  const answeredQuestions = currentSession?.attempts.length || 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQuestionIndex]);

  useEffect(() => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeSpent(0);
    setConfidenceLevel(null);
  }, [currentQuestionIndex]);

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null || !currentQuestion) return;
    try {
      await submitAnswer({
        questionId: currentQuestion.id,
        selectedAnswer,
        timeSpent,
        confidenceLevel: confidenceLevel || undefined
      });
      setShowExplanation(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit answer. Please try again.');
    }
  };

  const handleNextQuestion = async () => {
    if (answeredQuestions >= totalQuestions) {
      await handleEndSession();
    } else {
      setShowExplanation(false);
      usePracticeStore.setState(state => ({
        currentQuestionIndex: state.currentQuestionIndex + 1
      }));
    }
  };

  const handleEndSession = async () => {
    try {
      await endSession();
      navigation.navigate('PracticeResults');
    } catch (error) {
      Alert.alert('Error', 'Failed to end session. Your progress has been saved locally.');
    }
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

  const attempt = currentSession.attempts.find(a => a.questionId === currentQuestion.id);
  const isCorrect = attempt?.isCorrect;

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
            {currentSession.sessionType}
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
                {currentQuestion.difficulty}
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

          {/* Options */}
          <View style={{ gap: 12, marginBottom: 24 }}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                disabled={showExplanation}
                onPress={() => setSelectedAnswer(index)}
                style={{
                  backgroundColor: showExplanation
                    ? (attempt && attempt.selectedAnswer === index
                      ? (isCorrect ? '#F0FDF4' : '#FEF2F2')
                      : 'white')
                    : (selectedAnswer === index ? '#E0E7FF' : 'white'),
                  borderWidth: 1,
                  borderColor: showExplanation
                    ? (attempt && attempt.selectedAnswer === index
                      ? (isCorrect ? '#10B981' : '#EF4444')
                      : '#E5E7EB')
                    : (selectedAnswer === index ? '#3B82F6' : '#E5E7EB'),
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
                  borderColor: showExplanation
                    ? (attempt && attempt.selectedAnswer === index
                      ? (isCorrect ? '#10B981' : '#EF4444')
                      : '#D1D5DB')
                    : (selectedAnswer === index ? '#3B82F6' : '#D1D5DB'),
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  {selectedAnswer === index && (
                    <View style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: showExplanation
                        ? (isCorrect ? '#10B981' : '#EF4444')
                        : '#3B82F6'
                    }} />
                  )}
                </View>
                <Text style={{
                  fontSize: 14,
                  color: '#1F2937',
                  flex: 1
                }}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Confidence Slider */}
          {settings.confidenceTracking && !showExplanation && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, color: '#374151', marginBottom: 8 }}>
                Confidence Level
              </Text>
              <Slider
                minimumValue={0}
                maximumValue={100}
                step={10}
                value={confidenceLevel || 50}
                onValueChange={value => setConfidenceLevel(value)}
                minimumTrackTintColor="#3B82F6"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#3B82F6"
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>Not confident</Text>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>Very confident</Text>
              </View>
            </View>
          )}

          {/* Explanation */}
          {showExplanation && (
            <View style={{
              backgroundColor: '#F0F9FF',
              padding: 20,
              borderRadius: 12,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: '#BFDBFE'
            }}>
              <Text style={{
                fontSize: 16,
                color: isCorrect ? '#10B981' : '#EF4444',
                fontWeight: '600',
                marginBottom: 12
              }}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </Text>
              <Text style={{ fontSize: 14, color: '#1F2937', lineHeight: 20 }}>
                {currentQuestion.explanation}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, padding: 24 }}>
          {showExplanation ? (
            <Button
              title={answeredQuestions >= totalQuestions ? 'Finish' : 'Next Question'}
              onPress={handleNextQuestion}
              style={{ flex: 1 }}
            />
          ) : (
            <Button
              title="Submit Answer"
              onPress={handleAnswerSubmit}
              disabled={selectedAnswer === null}
              style={{ flex: 1 }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'EASY':
      return { bg: '#F0FDF4', text: '#10B981' };
    case 'MEDIUM':
      return { bg: '#EFF6FF', text: '#3B82F6' };
    case 'HARD':
      return { bg: '#FEF2F2', text: '#EF4444' };
    default:
      return { bg: '#F3F4F6', text: '#6B7280' };
  }
};