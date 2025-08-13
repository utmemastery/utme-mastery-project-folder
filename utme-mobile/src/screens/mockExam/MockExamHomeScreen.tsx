import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMockExamStore, MockExam, RecentScore } from '../../stores/mockExamStore';
import { useAuthStore } from '../../stores/authStore';

interface MockExamHomeScreenProps {
  navigation: any;
}

export const MockExamHomeScreen: React.FC<MockExamHomeScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { 
    mockExams, 
    recentScores, 
    incompleteExam,
    isLoading, 
    error,
    fetchMockExams,
    startMockExam,
    resumeMockExam
  } = useMockExamStore();

  useEffect(() => {
    fetchMockExams();
  }, []);

  const handleStartFullMock = () => {
    Alert.alert(
      'Start Full UTME Mock?',
      'This is a 3.5-hour timed exam with 180 questions. Are you ready?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Exam',
          onPress: () => {
            startMockExam({
              type: 'FULL_UTME',
              subjects: user?.selectedSubjects || [],
              timeLimit: 210, // 3.5 hours in minutes
              questionCount: 180
            });
            navigation.navigate('MockExamSession');
          }
        }
      ]
    );
  };

  const handleResumeExam = () => {
    if (incompleteExam) {
      Alert.alert(
        'Resume Mock Exam?',
        'Continue your previous exam where you left off?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Resume',
            onPress: () => {
              resumeMockExam(incompleteExam.id);
              navigation.navigate('MockExamSession');
            }
          }
        ]
      );
    }
  };

  const handleStartSubjectMock = (subject: string) => {
    startMockExam({
      type: 'SUBJECT_SPECIFIC',
      subjects: [subject],
      timeLimit: 60, // 1 hour
      questionCount: 60
    });
    navigation.navigate('MockExamSession');
  };

  const handleStartQuickMock = () => {
    startMockExam({
      type: 'SUBJECT_SPECIFIC',
      subjects: user?.selectedSubjects || [],
      timeLimit: 30, // 30 minutes
      questionCount: 30
    });
    navigation.navigate('MockExamSession');
  };

  const averageScore = recentScores?.length > 0 
    ? Math.round(recentScores.reduce((sum, score) => sum + score.percentage, 0) / recentScores.length)
    : 0;

  const projectedUTMEScore = recentScores?.length > 0 
    ? Math.round(200 + (averageScore / 100) * 200)
    : null;

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 8 }}>
            Loading mock exams...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, color: '#EF4444', textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchMockExams()}
            style={{
              backgroundColor: '#3B82F6',
              borderRadius: 8,
              padding: 12,
              marginTop: 16
            }}
          >
            <Text style={{ color: 'white', fontWeight: '500' }}>Retry</Text>
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
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
              Mock Exams
            </Text>
            <Text style={{ fontSize: 16, color: '#6B7280' }}>
              Practice under real exam conditions
            </Text>
          </View>

          {/* Performance Overview */}
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
              Your Performance
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#3B82F6', marginBottom: 4 }}>
                  {projectedUTMEScore ?? 'N/A'}
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
                  Projected UTME Score
                </Text>
              </View>
              
              <View style={{ width: 1, height: 60, backgroundColor: '#E5E7EB', marginHorizontal: 20 }} />
              
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#10B981', marginBottom: 4 }}>
                  {averageScore}%{recentScores?.length === 0 && ' (No scores yet)'}
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
                  Average Score
                </Text>
              </View>
            </View>

            {user?.goalScore && projectedUTMEScore !== null && (
              <View style={{ 
                backgroundColor: projectedUTMEScore >= user.goalScore ? '#F0FDF4' : '#FEF3C7',
                padding: 12,
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: projectedUTMEScore >= user.goalScore ? '#10B981' : '#F59E0B'
              }}>
                <Text style={{ 
                  fontSize: 14, 
                  color: projectedUTMEScore >= user.goalScore ? '#065F46' : '#92400E'
                }}>
                  {projectedUTMEScore >= user.goalScore 
                    ? `🎉 You're on track! You've reached your goal of ${user.goalScore}`
                    : `🎯 ${user.goalScore - projectedUTMEScore} points to your goal of ${user.goalScore}`
                  }
                </Text>
              </View>
            )}
          </View>

          {/* Quick Start */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
              Quick Start
            </Text>
            
            {incompleteExam && (
              <TouchableOpacity
                onPress={handleResumeExam}
                style={{
                  backgroundColor: '#10B981',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16
                  }}>
                    <Text style={{ fontSize: 28 }}>🔄</Text>
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: 'white', marginBottom: 4 }}>
                      Resume {incompleteExam.type === 'FULL_UTME' ? 'Full UTME' : incompleteExam.subjects[0]} Exam
                    </Text>
                    <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 8 }}>
                      {incompleteExam.questions.length} questions • {incompleteExam.timeLimit} minutes
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' }}>
                        ⏰ Progress Saved
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 20 }}>→</Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleStartFullMock}
              style={{
                backgroundColor: '#8B5CF6',
                borderRadius: 16,
                padding: 20,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16
                }}>
                  <Text style={{ fontSize: 28 }}>🎯</Text>
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: 'white', marginBottom: 4 }}>
                    Full UTME Mock Exam
                  </Text>
                  <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 8 }}>
                    180 questions • 3.5 hours • All subjects
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' }}>
                      ⏰ Timed • 📊 Detailed Analysis
                    </Text>
                  </View>
                </View>
                
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 20 }}>→</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleStartQuickMock}
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#E5E7EB'
              }}
            >
              <Text style={{ fontSize: 24, marginRight: 12 }}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 }}>
                  Quick Mock (30 mins)
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>
                  Shorter practice session
                </Text>
              </View>
              <Text style={{ color: '#6B7280', fontSize: 16 }}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Subject-Specific Mocks */}
          {user?.selectedSubjects && user.selectedSubjects.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
                Subject Practice
              </Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  {user.selectedSubjects.map((subject) => (
                    <SubjectMockCard
                      key={subject}
                      subject={subject}
                      onPress={() => handleStartSubjectMock(subject)}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Recent Mock Results */}
          {recentScores && recentScores.length > 0 && (
            <View style={{ marginBottom: 32 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151' }}>
                  Recent Results
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('MockExamHistory')}>
                  <Text style={{ fontSize: 14, color: '#3B82F6', fontWeight: '500' }}>
                    View All →
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={{ gap: 12 }}>
                {recentScores.slice(0, 3).map((score: RecentScore, index: number) => (
                  <MockResultCard key={index} result={score} />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Subject Mock Card Component
interface SubjectMockCardProps {
  subject: string;
  onPress: () => void;
}

const SubjectMockCard: React.FC<SubjectMockCardProps> = ({ subject, onPress }) => {
  const getSubjectIcon = (subj: string) => {
    const icons: Record<string, string> = {
      english: '📚',
      mathematics: '🔢',
      physics: '⚛️',
      chemistry: '🧪',
      biology: '🧬',
      geography: '🌍',
      economics: '💰',
      government: '🏛️'
    };
    return icons[subj.toLowerCase()] || '📋';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        width: 140,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2
      }}
    >
      <Text style={{ fontSize: 32, marginBottom: 8 }}>
        {getSubjectIcon(subject)}
      </Text>
      <Text style={{ 
        fontSize: 14, 
        fontWeight: '600', 
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
        textTransform: 'capitalize'
      }}>
        {subject}
      </Text>
      <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', marginBottom: 8 }}>
        60 questions • 1 hour
      </Text>
      <View style={{
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12
      }}>
        <Text style={{ fontSize: 10, color: '#3B82F6', fontWeight: '500' }}>
          START MOCK
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Mock Result Card Component
interface MockResultCardProps {
  result: RecentScore;
}

const MockResultCard: React.FC<MockResultCardProps> = ({ result }) => {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#3B82F6';
    if (percentage >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center'
    }}>
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${getScoreColor(result.percentage)}20`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
      }}>
        <Text style={{ 
          fontSize: 16, 
          fontWeight: 'bold', 
          color: getScoreColor(result.percentage) 
        }}>
          {result.percentage}%
        </Text>
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#1F2937', marginBottom: 2 }}>
          {result.examType === 'FULL_UTME' ? 'Full UTME Mock' : `${result.subject} Mock`}
        </Text>
        <Text style={{ fontSize: 12, color: '#6B7280' }}>
          {result.correctAnswers}/{result.questionCount} correct • {formatRelativeTime(result.completedAt)}
        </Text>
      </View>
      
      <Text style={{ color: '#6B7280', fontSize: 14 }}>→</Text>
    </View>
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