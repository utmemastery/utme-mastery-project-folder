import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMockExamStore, MockExamHistory } from '../../stores/mockExamStore';

interface MockExamHistoryScreenProps {
  navigation: any;
}

export const MockExamHistoryScreen: React.FC<MockExamHistoryScreenProps> = ({ navigation }) => {
  const { examHistory, isLoading, error, fetchExamHistory, clearError } = useMockExamStore();

  useEffect(() => {
    fetchExamHistory(1, 20);
  }, []);

  const handleLoadMore = () => {
    if (examHistory && examHistory.page * examHistory.limit < examHistory.total) {
      fetchExamHistory(examHistory.page + 1, examHistory.limit);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#3B82F6';
    if (percentage >= 40) return '#F59E0B';
    return '#EF4444';
  };

  if (isLoading && !examHistory) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 8 }}>
            Loading history...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !examHistory) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, color: '#EF4444', textAlign: 'center' }}>
            {error || 'History not found'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              clearError();
              fetchExamHistory(1, 20);
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
              Exam History
            </Text>
            <Text style={{ fontSize: 16, color: '#6B7280' }}>
              Review your past mock exams
            </Text>
          </View>

          {/* Exam List */}
          {examHistory.exams.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
                No exams completed yet. Start a mock exam to see your history!
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('MockExamHome')}
                style={{
                  backgroundColor: '#3B82F6',
                  borderRadius: 8,
                  padding: 12,
                  marginTop: 16
                }}
              >
                <Text style={{ color: 'white', fontWeight: '500' }}>Go to Mock Exams</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {examHistory.exams.map((exam) => (
                <TouchableOpacity
                  key={exam.id}
                  onPress={() => navigation.navigate('MockExamResults', { examId: exam.id })}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: `${getScoreColor(exam.percentage)}20`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: getScoreColor(exam.percentage) }}>
                      {exam.percentage}%
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#1F2937' }}>
                      {exam.examType === 'FULL_UTME' ? 'Full UTME Mock' : `${exam.subjects[0]} Mock`}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>
                      {exam.correctAnswers}/{exam.questionCount} correct • {formatRelativeTime(exam.completedAt)}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>
                      Subjects: {exam.subjects.join(', ')}
                    </Text>
                  </View>
                  <Text style={{ color: '#6B7280', fontSize: 14 }}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Load More */}
          {examHistory.exams.length < examHistory.total && (
            <TouchableOpacity
              onPress={handleLoadMore}
              style={{
                backgroundColor: '#3B82F6',
                borderRadius: 8,
                padding: 12,
                alignItems: 'center',
                marginTop: 16
              }}
            >
              <Text style={{ color: 'white', fontWeight: '500' }}>Load More</Text>
            </TouchableOpacity>
          )}

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('MockExamHome')}
            style={{
              backgroundColor: '#E5E7EB',
              borderRadius: 8,
              padding: 12,
              alignItems: 'center',
              marginTop: 16
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#1F2937' }}>
              Back to Home
            </Text>
          </TouchableOpacity>
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