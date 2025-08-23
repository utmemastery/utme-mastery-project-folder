import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMockExamStore, MockExam, RecentScore } from '../../stores/mockExamStore';
import { useAuthStore } from '../../stores/authStore';
import { SubjectMockCard } from '../../components/ui/SubjectMockCard';
import { MockResultCard } from '../../components/ui/MockResultCard';
import { globalStyles } from '../../styles/global';
import { COLORS, LAYOUT, SIZES } from '../../constants';
import { Button } from '../../components/ui/Button';

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

  return (
            <View style={styles.container}>
              <View style={styles.orbTop} />
              <View style={styles.orbBottom} />
              <SafeAreaView style={styles.safeArea}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: LAYOUT.padding }}>
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Text style={[globalStyles.sectionHeader, { marginBottom: 8 }]}>
              Mock Exams
            </Text>
            <Text style={globalStyles.text}>
              Practice under real exam conditions
            </Text>
          </View>

          {/* Performance Overview */}
          <View style={[globalStyles.cardContainer, { marginBottom: 24 }]}>
            <Text style={[globalStyles.sectionHeader, { fontSize: SIZES.mediumText, marginBottom: 16 }]}>
              Your Performance
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[globalStyles.sectionHeader, { fontSize: SIZES.xLargeText, color: COLORS.primary, marginBottom: 4 }]}>
                  {projectedUTMEScore ?? 'N/A'}
                </Text>
                <Text style={[globalStyles.subText, { textAlign: 'center' }]}>
                  Projected UTME Score
                </Text>
              </View>
              
              <View style={{ width: 1, height: 60, backgroundColor: COLORS.progressBackground, marginHorizontal: 20 }} />
              
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[globalStyles.sectionHeader, { fontSize: SIZES.xLargeText, color: COLORS.success, marginBottom: 4 }]}>
                  {averageScore}%{recentScores?.length === 0 && ' (No scores yet)'}
                </Text>
                <Text style={[globalStyles.subText, { textAlign: 'center' }]}>
                  Average Score
                </Text>
              </View>
            </View>

            {user?.goalScore && projectedUTMEScore !== null && (
              <View style={[globalStyles.cardContainer, {
                backgroundColor: projectedUTMEScore >= user.goalScore ? COLORS.success + '20' : COLORS.warning + '20',
                borderLeftWidth: 4,
                borderLeftColor: projectedUTMEScore >= user.goalScore ? COLORS.success : COLORS.warning
              }]}>
                <Text style={[globalStyles.text, { 
                  color: projectedUTMEScore >= user.goalScore ? COLORS.success : COLORS.warning
                }]}>
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
              <Text style={[globalStyles.sectionHeader, { fontSize: SIZES.mediumText, marginBottom: 16 }]}>
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
                <Text style={[globalStyles.sectionHeader, { fontSize: SIZES.mediumText }]}>
                  Recent Results
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('MockExamHistory')}>
                  <Text style={[globalStyles.text, { color: COLORS.primary, fontWeight: '500' }]}>
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
            </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  orbTop: {
    position: 'absolute',
    top: LAYOUT.orbTopOffset,
    right: -0.25 * LAYOUT.orbTopSize,
    width: LAYOUT.orbTopSize,
    height: LAYOUT.orbTopSize,
    borderRadius: LAYOUT.orbTopSize / 2,
    backgroundColor: COLORS.orbBlue,
    transform: [{ rotate: '20deg' }],
  },
  orbBottom: {
    position: 'absolute',
    bottom: LAYOUT.orbBottomOffset,
    left: -0.2 * LAYOUT.orbBottomSize,
    width: LAYOUT.orbBottomSize,
    height: LAYOUT.orbBottomSize,
    borderRadius: LAYOUT.orbBottomSize / 2,
    backgroundColor: COLORS.orbGold,
    transform: [{ rotate: '-40deg' }],
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: LAYOUT.padding,
  },
  headerContainer: {
    marginTop: LAYOUT.headerMarginTop,
    marginBottom: 48,
    alignItems: 'center',
  }
});