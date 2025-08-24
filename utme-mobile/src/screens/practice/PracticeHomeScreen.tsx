import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { usePracticeStore } from '../../stores/practiceStore';
import { COLORS, SIZES, LAYOUT } from '../../constants';
import { practiceStyles as styles } from '../../styles/practice';
import { globalStyles } from '../../styles/global';

const { width } = Dimensions.get('window');

export const PracticeHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    dashboard,
    subjects,
    badges,
    loading,
    loadDashboard,
    loadSubjects,
    loadBadges,
    createSmartReviewSession,
    createAdaptiveDrillSession,
    createTimedSprintSession,
  } = usePracticeStore();

  useEffect(() => {
    loadDashboard();
    loadSubjects();
    loadBadges();
  }, []);

  const PerformanceSnapshot = () => (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.performanceCard}>
      <Text style={styles.cardTitle}>Your Progress</Text>
      <View style={styles.performanceContent}>
        <View style={styles.masteryCircle}>
          <Text style={styles.masteryPercent}>
            {dashboard?.overallMastery?.mastery || 0}%
          </Text>
          <Text style={styles.masteryLabel}>Mastery</Text>
        </View>
        <View style={styles.performanceStats}>
          <Text style={styles.performanceText}>
            Overall Mastery
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${dashboard?.overallMastery?.mastery || 0}%` }
              ]} 
            />
          </View>
          <Text style={styles.performanceSubText}>
            {dashboard?.overallMastery?.questionsAnswered || 0}/1000 Qs • 
            Accuracy: {dashboard?.overallMastery?.accuracy || 0}% (+5%)
          </Text>
        </View>
      </View>
      {/* Add Badges Display */}
      {badges.length > 0 && (
        <View style={styles.achievements}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {badges.map((badge, index) => (
              <Animated.View key={badge.id} entering={FadeInRight.delay(index * 100)} style={styles.badgeCard}>
                <Text style={styles.badgeText}>🏆 {badge.type}</Text>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      )}
    </Animated.View>
  );

  const SmartPracticeModes = () => (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
      <Text style={styles.sectionTitle}>Intelligent Practice Modes</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.modesScroll}
      >
        <TouchableOpacity 
          style={[styles.modeCard, styles.smartReviewCard]}
          onPress={() => createSmartReviewSession(15)}
        >
          <View style={styles.modeIcon}>
            <Ionicons name="flame" size={24} color={COLORS.white} />
          </View>
          <Text style={styles.modeTitle}>🎯 Smart Review</Text>
          <Text style={styles.modeSubtitle}>
            {dashboard?.reviewQueue?.dueCount || 0} Qs Due (Spaced Rep)
          </Text>
          <Text style={styles.modeDetail}>Weak: Quadratic Eqns</Text>
          <TouchableOpacity style={styles.modeButton}>
            <Text style={styles.modeButtonText}>START NOW</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.modeCard, styles.adaptiveCard]}
          onPress={() => createAdaptiveDrillSession({})}
        >
          <View style={styles.modeIcon}>
            <Ionicons name="flash" size={24} color={COLORS.white} />
          </View>
          <Text style={styles.modeTitle}>⚡ Adaptive Drill</Text>
          <Text style={styles.modeSubtitle}>Auto-Adjusted Difficulty</Text>
          <Text style={styles.modeDetail}>Focus: Calculus</Text>
          <TouchableOpacity style={styles.modeButton}>
            <Text style={styles.modeButtonText}>PRACTICE</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.modeCard, styles.timedCard]}
          onPress={() => createTimedSprintSession({ questionCount: 10, timeLimit: 12 * 60 })}
        >
          <View style={styles.modeIcon}>
            <Ionicons name="timer" size={24} color={COLORS.white} />
          </View>
          <Text style={styles.modeTitle}>⏱️ Timed Sprint</Text>
          <Text style={styles.modeSubtitle}>10 Qs • 12 Mins</Text>
          <Text style={styles.modeDetail}>Build Speed & Accuracy</Text>
          <TouchableOpacity style={styles.modeButton}>
            <Text style={styles.modeButtonText}>START SPRINT</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );

  const SubjectPerformance = () => (
    <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
      <Text style={styles.sectionTitle}>Subjects</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.subjectsScroll}
      >
        {subjects.map((subject, index) => (
          <Animated.View 
            key={subject.id}
            entering={FadeInRight.delay(index * 100)}
            style={styles.subjectCard}
          >
            <View style={styles.subjectHeader}>
              <Text style={styles.subjectIcon}>
                {subject.name === 'Mathematics' ? '📊' : 
                 subject.name === 'English' ? '📖' : 
                 subject.name === 'Physics' ? '⚡' : '🧪'}
              </Text>
              <Text style={styles.subjectName}>{subject.name}</Text>
            </View>
            <Text style={styles.subjectMastery}>{subject.mastery}%</Text>
            <View style={styles.subjectTrend}>
              <Text style={[ 
                styles.trendText,
                subject.trend > 0 ? styles.trendUp : 
                subject.trend < 0 ? styles.trendDown : styles.trendFlat
              ]}>
                {subject.trend > 0 ? '↗️' : subject.trend < 0 ? '↘️' : '→'} 
                {subject.trend !== 0 ? Math.abs(subject.trend) + '%' : '0'}
              </Text>
            </View>
            <Text style={styles.subjectWeak}>
              {subject.mastery < 70 ? 'Weak:' : 'Strong'}
            </Text>
            <Text style={styles.weakArea}>
              {subject.mastery < 70 ? 'Integration' : 'Area'}
            </Text>
            <TouchableOpacity 
              style={styles.subjectButton}
              onPress={() => navigation.navigate('SubjectSelection', { subjectId: subject.id })}
            >
              <Text style={styles.subjectButtonText}>GO</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const AIRecommendations = () => (
    <Animated.View entering={FadeInDown.delay(800)} style={styles.recommendationsCard}>
      <Text style={styles.cardTitle}>Recommended for You</Text>
      <View style={styles.priorityAreas}>
        <Text style={styles.priorityTitle}>🎯 Priority Areas:</Text>
        <Text style={styles.priorityItem}>• Integration (Due for review)</Text>
        <Text style={styles.priorityItem}>• Organic Chem (Low confidence: 40%)</Text>
        <Text style={styles.priorityItem}>• Essay Writing (New topic)</Text>
        <Text style={styles.insightText}>
          📊 Insight: 23% score boost by focusing on these topics
        </Text>
      </View>
      <TouchableOpacity style={[globalStyles.button, styles.personalizedButton]}>
        <Text style={globalStyles.buttonText}>START PERSONALIZED SESSION</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading.dashboard) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Practice</Text>
          <Text style={styles.headerSubtitle}>Master JAMB with Precision</Text>
          <View style={styles.streakContainer}>
            <Text style={styles.streakText}>🔥 Streak: {dashboard?.streak?.count || 0}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <PerformanceSnapshot />
        <SmartPracticeModes />
        <SubjectPerformance />
        <AIRecommendations />
      </ScrollView>
    </SafeAreaView>
  );
};
