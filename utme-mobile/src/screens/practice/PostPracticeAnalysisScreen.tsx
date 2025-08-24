import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { usePracticeStore } from '../../stores/practiceStore';
import { practiceStyles as styles } from '../../styles/practice';
import { COLORS, SIZES } from '../../constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PracticeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<PracticeStackParamList, 'PostPracticeAnalysis'>;

export const PostPracticeAnalysisScreen: React.FC<Props> = ({ navigation }) => {
  const {
    sessionSummary,
    mistakes,
    badges,
    currentSession,
    createSmartReviewSession,
    reviewMistakes,
    scheduleReview,
    loadBadges,
  } = usePracticeStore();

  useEffect(() => {
    loadBadges();
  }, []);

  const PerformanceSummary = () => (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.summaryCard}>
      <Text style={styles.celebrationText}>🎉 Great Progress! 🎉</Text>

      <View style={styles.scoreCircle}>
        <Text style={styles.finalScore}>
          {sessionSummary?.accuracy != null
            ? Math.round(sessionSummary.accuracy * 100)
            : 85}
          %
        </Text>

        <View style={styles.scoreProgress}>
          {Array.from({ length: 10 }, (_, i) => (
            <View
              key={i}
              style={[
                styles.scoreDot,
                i < (sessionSummary?.correctCount ?? 8) && styles.scoreDotFilled,
              ]}
            />
          ))}
        </View>

        <Text style={styles.scoreDetails}>
          {(sessionSummary?.correctCount ?? 13)}/{sessionSummary?.totalQuestions ?? 15} Correct
        </Text>
      </View>

      <View style={styles.summaryStats}>
        <Text style={styles.statItem}>Percentile: 89th (+3%)</Text>
        <Text style={styles.statItem}>
          Time: {Math.round((sessionSummary?.avgTime ?? 1.6) * (sessionSummary?.totalQuestions ?? 15))} min • 
          Avg: {sessionSummary?.avgTime ?? 1.6} min/Q
        </Text>
        <Text style={styles.statItem}>Improvement: +12% vs last session</Text>
      </View>

      {badges.length > 0 && (
        <View style={styles.achievements}>
          <Text style={styles.sectionTitle}>Achievements Earned</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {badges.map((badge, index) => (
              <Animated.View
                key={badge.id ?? index}
                entering={FadeInDown.delay(200 + index * 100)}
                style={styles.badgeCard}
              >
                <Text style={styles.badgeText}>🏆 {badge.type}</Text>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      )}
    </Animated.View>
  );

  const IntelligentAnalysis = () => (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.analysisCard}>
      <Text style={styles.cardTitle}>Performance Insights</Text>

  <View style={styles.strengthsSection}>
  <Text style={styles.sectionTitle}>🎯 Strengths:</Text>
  {(sessionSummary?.strengths?.length ?? 0) > 0
    ? sessionSummary?.strengths.map((strength, index) => (
        <Text key={index} style={styles.strengthItem}>
          • {strength}
        </Text>
      ))
    : (
      <>
        <Text style={styles.strengthItem}>• Linear Equations: 100%</Text>
        <Text style={styles.strengthItem}>• Speed: 18% faster than avg</Text>
      </>
    )}
</View>

<View style={styles.weaknessesSection}>
  <Text style={styles.sectionTitle}>⚠️ Weaknesses:</Text>
  {(sessionSummary?.weaknesses?.length ?? 0) > 0
    ? sessionSummary?.weaknesses.map((weakness, index) => (
        <Text key={index} style={styles.weaknessItem}>
          • {weakness}
        </Text>
      ))
    : (
      <>
        <Text style={styles.weaknessItem}>• Quadratic Factoring: 60% accuracy</Text>
        <Text style={styles.weaknessItem}>• Word Problems: Translation errors</Text>
      </>
    )}
</View>


      <View style={styles.insightSection}>
        <Text style={styles.sectionTitle}>🧠 Learning Science Insight:</Text>
        <Text style={styles.insightText}>
          Spaced repetition on factoring scheduled for tomorrow
        </Text>

        <Text style={styles.sectionTitle}>📚 JAMB-Specific Tips:</Text>
        <Text style={styles.tipItem}>• Factoring appears in 20% of papers</Text>
        <Text style={styles.tipItem}>• Focus on discriminant method</Text>
        <Text style={styles.tipItem}>• Review past JAMB questions</Text>
      </View>
    </Animated.View>
  );

  const ActionOptions = () => (
    <Animated.View entering={FadeInDown.delay(600)} style={styles.actionsContainer}>
      <Text style={styles.cardTitle}>What's Next?</Text>

      <TouchableOpacity
        style={[styles.actionCard, styles.reviewCard]}
        onPress={() => navigation.navigate('ReviewMistakes', { sessionId: currentSession?.id ?? '' })}
      >
        <Text style={styles.actionTitle}>Review Mistakes</Text>
        <Text style={styles.actionSubtitle}>
          {mistakes.length ?? 2} questions need review
        </Text>
        <Text style={styles.actionDetail}>With detailed solutions</Text>
        <View style={styles.actionButton}>
          <Text style={styles.actionButtonText}>REVIEW NOW</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionCard, styles.practiceCard]}
        onPress={() => createSmartReviewSession(15)}
      >
        <Text style={styles.actionTitle}>Related Practice</Text>
        <Text style={styles.actionSubtitle}>Similar difficulty level</Text>
        <Text style={styles.actionDetail}>Focus on weak areas</Text>
        <View style={styles.actionButton}>
          <Text style={styles.actionButtonText}>PRACTICE AGAIN</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionCard, styles.scheduleCard]}
        onPress={() =>
          scheduleReview({
            questionId: 1,
            difficulty: 1,
            performance: sessionSummary?.accuracy ?? 0.8,
          })
        }
      >
        <Text style={styles.actionTitle}>Spaced Repetition</Text>
        <Text style={styles.actionSubtitle}>Add to review schedule</Text>
        <Text style={styles.actionDetail}>Optimal timing: 2 days</Text>
        <View style={styles.actionButton}>
          <Text style={styles.actionButtonText}>SCHEDULE REVIEW</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionCard, styles.shareCard]}>
        <Text style={styles.actionTitle}>Share Achievement</Text>
        <Text style={styles.actionSubtitle}>
          Just scored {Math.round((sessionSummary?.accuracy ?? 0.85) * 100)}% in
        </Text>
        <Text style={styles.actionDetail}>Algebra practice! 💪</Text>
        <View style={styles.actionButton}>
          <Text style={styles.actionButtonText}>SHARE PROGRESS</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.content}>
          <View style={styles.orbTop} />
          <View style={styles.orbBottom} />
          <PerformanceSummary />
          <IntelligentAnalysis />
          <ActionOptions />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
