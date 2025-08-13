// mobile/src/screens/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { StatCard } from '../../components/ui/StatCard';
import { SubjectCard } from '../../components/ui/SubjectCard';
import { TaskCard } from '../../components/ui/TaskCard';
import { ActionButton } from '../../components/ui/ActionButton';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { 
    analytics, 
    isLoading, 
    fetchUserAnalytics, 
    dailyStats,
    weakTopics 
  } = useAnalyticsStore();
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserAnalytics();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserAnalytics();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const calculateOverallProgress = () => {
    if (!analytics?.subjectPerformance) return 0;
    const avgAccuracy = analytics.subjectPerformance.reduce((sum, subject) => {
      const accuracy = subject.total_questions > 0 ? (subject.correct_answers / subject.total_questions) * 100 : 0;
      return sum + accuracy;
    }, 0) / analytics.subjectPerformance.length;
    return Math.round(avgAccuracy);
  };

  const projectedScore = () => {
    const progress = calculateOverallProgress();
    return Math.round(200 + (progress / 100) * 200);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={{ padding: 24 }}>
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 }}>
              {getGreeting()}, {user?.firstName || 'Student'}! 👋
            </Text>
            <Text style={{ fontSize: 16, color: '#6B7280' }}>
              Ready to continue your UTME journey?
            </Text>
          </View>

          {/* Progress Ring */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <CircularProgress 
              progress={calculateOverallProgress()}
              size={120}
              strokeWidth={8}
              color="#3B82F6"
              backgroundColor="#E5E7EB"
            />
            <Text style={{ 
              position: 'absolute', 
              top: '50%', 
              fontSize: 24, 
              fontWeight: 'bold', 
              color: '#1F2937',
              marginTop: -12
            }}>
              {calculateOverallProgress()}%
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 16 }}>
              Overall Progress
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <StatCard 
              title="Current Score"
              value={projectedScore().toString()}
              subtitle={`Target: ${user?.goalScore || 300}`}
              icon="🎯"
              color="#3B82F6"
              flex={1}
            />
            <StatCard 
              title="Study Streak"
              value={analytics?.overall?.currentStreak?.toString() || '0'}
              subtitle="Days"
              icon="🔥"
              color="#EF4444"
              flex={1}
            />
            <StatCard 
              title="Questions Done"
              value={analytics?.overall?.totalQuestions?.toString() || '0'}
              subtitle={`${analytics?.overall?.correctAnswers || 0} correct`}
              icon="📝"
              color="#10B981"
              flex={1}
            />
            <StatCard 
              title="Time Spent"
              value={`${Math.round((dailyStats?.reduce((sum, day) => sum + day.timeSpent, 0) || 0) / 3600)}h`}
              subtitle="This month"
              icon="⏰"
              color="#8B5CF6"
              flex={1}
            />
          </View>

          {/* Daily Tasks */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
              Today's Tasks
            </Text>
            <View style={{ gap: 12 }}>
              <TaskCard 
                title="Daily Quiz"
                description="Complete 10 mixed questions"
                progress={0.6}
                onPress={() => navigation.navigate('Practice', { screen: 'PracticeHome' })}
                icon="⚡"
                completed={false}
              />
              <TaskCard 
                title="Review Weak Topics"
                description={`Focus on ${weakTopics?.[0]?.topic || 'identified areas'}`}
                progress={0.3}
                onPress={() => navigation.navigate('WeakTopics')}
                icon="📚"
                completed={false}
              />
              <TaskCard 
                title="Flashcards Review"
                description="Review 15 flashcards"
                progress={1.0}
                onPress={() => navigation.navigate('Flashcards')}
                icon="🗂️"
                completed={true}
              />
            </View>
          </View>

          {/* Subject Performance */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151' }}>
                Subject Performance
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
                <Text style={{ fontSize: 14, color: '#3B82F6', fontWeight: '500' }}>
                  View All →
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                {user?.selectedSubjects?.map((subject) => {
                  const subjectData = analytics?.subjectPerformance?.find(
                    (s: any) => s.subject.toLowerCase() === subject.toLowerCase()
                  );
                  const accuracy = subjectData 
                    ? Math.round((subjectData.correct_answers / subjectData.total_questions) * 100)
                    : 0;
                  
                  return (
                    <SubjectCard
                      key={subject}
                      subject={subject}
                      accuracy={accuracy}
                      totalQuestions={subjectData?.total_questions || 0}
                      onPress={() => navigation.navigate('SubjectDetail', { subject })}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
              Quick Actions
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <ActionButton 
                title="Start Practice"
                icon="🎮"
                color="#3B82F6"
                onPress={() => navigation.navigate('Practice')}
              />
              <ActionButton 
                title="Mock Exam"
                icon="📋"
                color="#8B5CF6"
                onPress={() => navigation.navigate('MockExam')}
              />
              <ActionButton 
                title="Study Plan"
                icon="📅"
                color="#10B981"
                onPress={() => navigation.navigate('StudyPlan')}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};