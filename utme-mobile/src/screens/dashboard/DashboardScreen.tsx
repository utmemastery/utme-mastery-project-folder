import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshControl } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { StatCard } from '../../components/ui/StatCard';
import { SubjectCard } from '../../components/ui/SubjectCard';
import { TaskCard } from '../../components/ui/TaskCard';
import { ActionButton } from '../../components/ui/ActionButton';
import { Button } from '../../components/ui/Button';
import { useScreenAnimation } from '../../hooks/useScreenAnimation';
import { usePulseAnimation } from '../../hooks/usePulseAnimation';
import { globalStyles } from '../../styles/global';
import { onboardingStyles } from '../../styles/onboarding';
import { COLORS, SIZES, LAYOUT } from '../../constants';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { analytics, isLoading, fetchUserAnalytics, dailyStats, weakTopics } = useAnalyticsStore();
  const [refreshing, setRefreshing] = useState(false);
  const { fadeAnim, slideAnim } = useScreenAnimation();
  const { pulseAnim } = usePulseAnimation();

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
    const avgAccuracy = analytics.subjectPerformance.reduce((sum: number, subject: any) => {
      const accuracy = subject.total_questions > 0 ? (subject.correct_answers / subject.total_questions) * 100 : 0;
      return sum + accuracy;
    }, 0) / analytics.subjectPerformance.length;
    return Math.round(avgAccuracy);
  };

  const projectedScore = () => {
    const progress = calculateOverallProgress();
    return Math.round(200 + (progress / 100) * 200);
  };

  const getSubjectColor = (accuracy: number) => {
    if (accuracy >= 80) return COLORS.success;
    if (accuracy >= 60) return COLORS.primary;
    if (accuracy >= 40) return COLORS.warning;
    return COLORS.error;
  };

  const chartData = {
    labels: analytics?.subjectPerformance?.map((s: any) => s.subject) || [],
    datasets: [
      {
        data: analytics?.subjectPerformance?.map((s: any) =>
          s.total_questions > 0 ? Math.round((s.correct_answers / s.total_questions) * 100) : 0
        ) || [],
        backgroundColor: analytics?.subjectPerformance?.map((s: any) =>
          getSubjectColor(s.total_questions > 0 ? (s.correct_answers / s.total_questions) * 100 : 0)
        ) || [],
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
              accessibilityLabel="Refresh dashboard"
              accessibilityRole="button"
            />
          }
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Header */}
            <View style={[onboardingStyles.sectionContainer, styles.headerContainer]}>
              <Text
                style={[globalStyles.sectionHeader, styles.greetingText]}
                accessibilityLabel={`${getGreeting()}, ${user?.firstName || 'Student'}`}
              >
                {getGreeting()}, {user?.firstName || 'Student'}! 👋
              </Text>
              <Text style={globalStyles.text}>
                Ready to continue your UTME journey?
              </Text>
            </View>

            {/* Progress Ring */}
            <View style={onboardingStyles.sectionContainer}>
              <CircularProgress
                progress={calculateOverallProgress()}
                size={150}
                strokeWidth={10}
                color={COLORS.primary}
                backgroundColor={COLORS.progressBackground}
                accessibilityLabel={`Overall progress: ${calculateOverallProgress()}%`}
              />
              <Text style={[globalStyles.text, styles.progressText]}>
                Projected Score: {projectedScore()}
              </Text>
            </View>

            {/* Daily Stats */}
            <View style={onboardingStyles.sectionContainer}>
              <Text style={[globalStyles.text, styles.sectionTitle]}>Daily Stats</Text>
            <View style={styles.statsContainer}>
              {dailyStats?.map((stat: any, index: number) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  subtitle={stat.subtitle || ''}   // make sure you provide a subtitle
                  icon={stat.icon || '📊'}         // default icon if none provided
                  color={COLORS.primary}
                  unit={stat.unit}
                  accessibilityLabel={`${stat.title}: ${stat.value} ${stat.unit || ''}`}
                />
              ))}
            </View>
            </View>

            {/* Weak Topics */}
            <View style={onboardingStyles.sectionContainer}>
              <Text style={[globalStyles.text, styles.sectionTitle]}>Weak Topics to Review</Text>
             {weakTopics?.map((topic: any, index: number) => (
              <TaskCard
                key={index}
                title={topic.title}
                description={topic.description || 'No description'}   // required
                progress={topic.progress ?? 0}                         // required, default 0
                icon={topic.icon || '📖'}                               // required
                completed={topic.completed ?? false}                   // required
                subject={topic.subject}
                difficulty={topic.difficulty}
                onPress={() => navigation.navigate('TopicDetail', { topic })}
                accessibilityLabel={`Review ${topic.title} in ${topic.subject}`}
              />
            ))}
            </View>

            {/* Subject Performance */}
            <View style={onboardingStyles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={[globalStyles.text, styles.sectionTitle]}>Subject Performance</Text>
                <Button
                  title="View All"
                  variant="text"
                  size="small"
                  onPress={() => navigation.navigate('Analytics')}
                  accessibilityLabel="View all subject performance"
                  accessibilityRole="button"
                />
              </View>
            
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.subjectsContainer}>
                  {user?.selectedSubjects?.map((subject: string) => {
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
                        accessibilityLabel={`${subject}: ${accuracy}% accuracy`}
                      />
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Quick Actions */}
            <View style={onboardingStyles.sectionContainer}>
              <Text style={[globalStyles.text, styles.sectionTitle]}>Quick Actions</Text>
              <View style={styles.actionsContainer}>
                <ActionButton
                  title="Start Practice"
                  icon="🎮"
                  color={COLORS.primary}
                  onPress={() => navigation.navigate('Practice')}
                  accessibilityLabel="Start practice session"
                />
                <ActionButton
                  title="Mock Exam"
                  icon="📋"
                  color={COLORS.secondary}
                  onPress={() => navigation.navigate('MockExam')}
                  accessibilityLabel="Start mock exam"
                />
                <ActionButton
                  title="Study Plan"
                  icon="📅"
                  color={COLORS.success}
                  onPress={() => navigation.navigate('StudyPlan')}
                  accessibilityLabel="View study plan"
                />
              </View>
            </View>
          </Animated.View>
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
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: SIZES.logo,
    color: COLORS.primary,
  },
  greetingText: {
    fontSize: SIZES.headerText,
    fontWeight: '600',
  },
  progressText: {
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chartContainer: {
    height: 200,
    marginBottom: 24,
  },
  subjectsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
});