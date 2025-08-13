import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMockExamStore, MockExamResult } from '../../stores/mockExamStore';
import { useAuthStore } from '../../stores/authStore';

interface MockExamResultsScreenProps {
  navigation: any;
  route: { params: { examId: number } };
}

export const MockExamResultsScreen: React.FC<MockExamResultsScreenProps> = ({ navigation, route }) => {
  const { examId } = route.params;
  const { examResult, isLoading, error, fetchExamResult, clearError, startMockExam } = useMockExamStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchExamResult(examId);
  }, [examId]);

  const handleRetryExam = () => {
    if (!examResult) return;
    Alert.alert(
      'Retry Exam?',
      'Start a new exam with the same configuration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            startMockExam({
              type: examResult.examType,
              subjects: examResult.subjects,
              timeLimit: Math.round(examResult.timeSpent / 60),
              questionCount: examResult.questionCount
            });
            navigation.navigate('MockExamSession');
          }
        }
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return hours > 0
      ? `${hours}h ${minutes}m ${remainingSeconds}s`
      : `${minutes}m ${remainingSeconds}s`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#3B82F6';
    if (percentage >= 40) return '#F59E0B';
    return '#EF4444';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 8 }}>
            Loading results...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !examResult) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, color: '#EF4444', textAlign: 'center' }}>
            {error || 'Results not found'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              clearError();
              fetchExamResult(examId);
            }}
            style={{
              backgroundColor: '#3B82F6',
              borderRadius: 8,
              padding: 12,
              marginTop: 16
            }}
          >
            <Text style={{ color: 'white', fontWeight: '500' }}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('MockExamHome')}
            style={{
              backgroundColor: '#E5E7EB',
              borderRadius: 8,
              padding: 12,
              marginTop: 8
            }}
          >
            <Text style={{ color: '#1F2937', fontWeight: '500' }}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 24 }}>
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
              Exam Results
            </Text>
            <Text style={{ fontSize: 16, color: '#6B7280' }}>
              {examResult.examType === 'FULL_UTME' ? 'Full UTME Mock' : `${examResult.subjects[0]} Mock`}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
              Completed {formatRelativeTime(examResult.completedAt)}
            </Text>
          </View>

          {/* Overview */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
              Performance Overview
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: getScoreColor(examResult.percentage) }}>
                  {examResult.percentage}%
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>Score</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#1F2937' }}>
                  {examResult.correctAnswers}/{examResult.questionCount}
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>Correct Answers</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#1F2937' }}>
                  {formatTime(examResult.timeSpent)}
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>Time Spent</Text>
              </View>
            </View>
            {user?.goalScore && (
              <View style={{
                backgroundColor: examResult.percentage >= user.goalScore ? '#F0FDF4' : '#FEF3C7',
                padding: 12,
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: examResult.percentage >= user.goalScore ? '#10B981' : '#F59E0B'
              }}>
                <Text style={{
                  fontSize: 14,
                  color: examResult.percentage >= user.goalScore ? '#065F46' : '#92400E'
                }}>
                  {examResult.percentage >= user.goalScore
                    ? `🎉 You reached your goal of ${user.goalScore}%!`
                    : `🎯 ${user.goalScore - examResult.percentage}% to your goal of ${user.goalScore}%`
                  }
                </Text>
              </View>
            )}
          </View>

          {/* Subject Breakdown */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
              Subject Breakdown
            </Text>
            {Object.entries(examResult.subjectBreakdown).map(([subject, stats]) => (
              <View
                key={subject}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: `${getScoreColor(stats.percentage)}20`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: getScoreColor(stats.percentage) }}>
                    {stats.percentage}%
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#1F2937', textTransform: 'capitalize' }}>
                    {subject}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>
                    {stats.correct}/{stats.total} correct
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Detailed Results */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
              Question-by-Question Analysis
            </Text>
            {examResult.detailedResults.map((result, index) => (
              <View
                key={result.questionId}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: result.isCorrect ? '#10B981' : '#EF4444'
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#1F2937', marginBottom: 8 }}>
                  Question {index + 1}: {result.subject} {result.topic ? `(${result.topic})` : ''}
                </Text>
                <Text style={{ fontSize: 14, color: '#374151', marginBottom: 8 }}>
                  {result.question}
                </Text>
                <Text style={{ fontSize: 14, color: result.isCorrect ? '#10B981' : '#EF4444', marginBottom: 8 }}>
                  Your Answer: {result.selectedAnswer !== null ? result.options[result.options.findIndex((_, i) => result.optionIds[i] === result.selectedAnswer)] : 'Not answered'}
                </Text>
                <Text style={{ fontSize: 14, color: '#10B981', marginBottom: 8 }}>
                  Correct Answer: {result.options[result.options.findIndex((_, i) => result.optionIds[i] === result.correctAnswer)]}
                </Text>
                {result.explanation && (
                  <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
                    Explanation: {result.explanation}
                  </Text>
                )}
                <Text style={{ fontSize: 12, color: '#6B7280' }}>
                  Time Spent: {formatTime(result.responseTime)}
                </Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('MockExamHome')}
              style={{
                flex: 1,
                backgroundColor: '#E5E7EB',
                borderRadius: 8,
                padding: 12,
                alignItems: 'center'
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#1F2937' }}>
                Back to Home
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRetryExam}
              style={{
                flex: 1,
                backgroundColor: '#3B82F6',
                borderRadius: 8,
                padding: 12,
                alignItems: 'center'
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '500', color: 'white' }}>
                Retry Exam
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper function
const formatRelativeTime = (date: string | Date) => {
  try {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = (now.getTime() - past.getTime()) / (1000 * 60 * 60);
    
    if (isNaN(diffInHours)) return 'Unknown time';
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  } catch {
    return 'Unknown time';
  }
};