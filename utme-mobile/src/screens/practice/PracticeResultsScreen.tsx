// mobile/src/screens/practice/PracticeResultsScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePracticeStore } from '../../stores/practiceStore';
import { Button } from '../../components/ui/Button';

interface PracticeResultsScreenProps {
  navigation: any;
}

export const PracticeResultsScreen: React.FC<PracticeResultsScreenProps> = ({ navigation }) => {
  const { currentSession } = usePracticeStore();

  if (!currentSession) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#6B7280' }}>No session data found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { questions, attempts, startTime, endTime } = currentSession;
  const totalQuestions = questions.length;
  const totalAttempts = attempts.length;
  const correctAnswers = attempts.filter(a => a.isCorrect).length;
  const accuracy = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;
  const avgTimePerQuestion = attempts.reduce((sum, a) => sum + a.timeSpent, 0) / attempts.length;
  const sessionDuration = endTime ? Math.round((endTime.getTime() - startTime.getTime()) / 1000) : 0;

  // Performance analysis
  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 85) return { level: 'Excellent', color: '#10B981', emoji: '🎉' };
    if (accuracy >= 70) return { level: 'Good', color: '#3B82F6', emoji: '👍' };
    if (accuracy >= 50) return { level: 'Fair', color: '#F59E0B', emoji: '👌' };
    return { level: 'Needs Improvement', color: '#EF4444', emoji: '📚' };
  };

  const performance = getPerformanceLevel(accuracy);

  // Topic analysis
  const topicPerformance = questions.reduce((acc, question) => {
    const attempt = attempts.find(a => a.questionId === question.id);
    if (attempt) {
      if (!acc[question.topic]) {
        acc[question.topic] = { correct: 0, total: 0 };
      }
      acc[question.topic].total++;
      if (attempt.isCorrect) acc[question.topic].correct++;
    }
    return acc;
  }, {} as Record<string, { correct: number; total: number }>);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 24 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>{performance.emoji}</Text>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
              Session Complete!
            </Text>
            <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
              Here's how you performed
            </Text>
          </View>

          {/* Overall Score */}
          <View style={{ 
            backgroundColor: 'white', 
            borderRadius: 16, 
            padding: 24,
            marginBottom: 24,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3
          }}>
            <Text style={{ fontSize: 48, fontWeight: 'bold', color: performance.color, marginBottom: 8 }}>
              {Math.round(accuracy)}%
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: performance.color, marginBottom: 16 }}>
              {performance.level}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
              {correctAnswers} out of {totalAttempts} questions correct
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            gap: 12, 
            marginBottom: 24 
          }}>
            <StatCard 
              title="Questions"
              value={`${totalAttempts}/${totalQuestions}`}
              subtitle="Attempted"
              icon="📝"
            />
            <StatCard 
              title="Avg Time"
              value={`${Math.round(avgTimePerQuestion)}s`}
              subtitle="Per question"
              icon="⏱️"
            />
            <StatCard 
              title="Duration"
              value={`${Math.round(sessionDuration / 60)}m`}
              subtitle="Total time"
              icon="⏰"
            />
            <StatCard 
              title="Streak"
              value={getMaxStreak(attempts).toString()}
              subtitle="Max correct"
              icon="🔥"
            />
          </View>

          {/* Topic Performance */}
          {Object.keys(topicPerformance).length > 1 && (
            <View style={{ 
              backgroundColor: 'white', 
              borderRadius: 16, 
              padding: 20,
              marginBottom: 24 
            }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
                Topic Breakdown
              </Text>
              
              {Object.entries(topicPerformance).map(([topic, stats]) => {
                const topicAccuracy = (stats.correct / stats.total) * 100;
                return (
                  <View key={topic} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
                        {topic}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#6B7280' }}>
                        {stats.correct}/{stats.total}
                      </Text>
                    </View>
                    <View style={{ 
                      height: 6, 
                      backgroundColor: '#E5E7EB', 
                      borderRadius: 3, 
                      overflow: 'hidden' 
                    }}>
                      <View style={{ 
                        height: '100%', 
                        backgroundColor: getAccuracyColor(topicAccuracy),
                        width: `${topicAccuracy}%`
                      }} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Question Review */}
          <View style={{ 
            backgroundColor: 'white', 
            borderRadius: 16, 
            padding: 20,
            marginBottom: 24 
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
              Question Review
            </Text>
            
            <View style={{ gap: 12 }}>
              {questions.slice(0, 5).map((question, index) => {
                const attempt = attempts.find(a => a.questionId === question.id);
                const isCorrect = attempt?.isCorrect || false;
                
                return (
                  <View key={question.id} style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    paddingVertical: 8
                  }}>
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: isCorrect ? '#F0FDF4' : '#FEF2F2',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12
                    }}>
                      <Text style={{ 
                        fontSize: 16, 
                        color: isCorrect ? '#10B981' : '#EF4444' 
                      }}>
                        {isCorrect ? '✓' : '✕'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, color: '#374151', fontWeight: '500' }}>
                        Question {index + 1}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6B7280' }}>
                        {question.topic} • {attempt?.timeSpent}s
                      </Text>
                    </View>
                  </View>
                );
              })}
              
              {questions.length > 5 && (
                <TouchableOpacity style={{ paddingVertical: 8, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: '#3B82F6', fontWeight: '500' }}>
                    View all {questions.length} questions →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Recommendations */}
          <View style={{ 
            backgroundColor: '#F0F9FF', 
            borderRadius: 16, 
            padding: 20,
            marginBottom: 32,
            borderWidth: 1,
            borderColor: '#BFDBFE'
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1E40AF', marginBottom: 12 }}>
              💡 Recommendations
            </Text>
            <Text style={{ fontSize: 14, color: '#1E40AF', lineHeight: 20 }}>
              {getRecommendation(accuracy, avgTimePerQuestion, topicPerformance)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 12, padding: 24 }}>
        <Button
          title="Practice Again"
          onPress={() => navigation.navigate('PracticeHome')}
          variant="outline"
          style={{ flex: 1 }}
        />
        <Button
          title="Home"
          onPress={() => navigation.navigate('Home')}
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
};


// Helper Components and Functions
const StatCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  icon: string;
}> = ({ title, value, subtitle, icon }) => (
  <View style={{ 
    flex: 1, 
    minWidth: '45%',
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  }}>
    <Text style={{ fontSize: 24, marginBottom: 8 }}>{icon}</Text>
    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 }}>
      {value}
    </Text>
    <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
      {subtitle}
    </Text>
  </View>
);

const getMaxStreak = (attempts: Array<{ isCorrect: boolean }>) => {
  let maxStreak = 0;
  let currentStreak = 0;
  
  attempts.forEach(attempt => {
    if (attempt.isCorrect) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  return maxStreak;
};

const getAccuracyColor = (accuracy: number) => {
  if (accuracy >= 80) return '#10B981';
  if (accuracy >= 60) return '#3B82F6';
  if (accuracy >= 40) return '#F59E0B';
  return '#EF4444';
};

const getRecommendation = (
  accuracy: number, 
  avgTime: number, 
  topicPerformance: Record<string, any>
) => {
  if (accuracy >= 85) {
    return "Excellent work! You're ready for more challenging questions. Consider practicing with harder difficulty levels or trying mixed-subject quizzes.";
  } else if (accuracy >= 70) {
    return "Good performance! Focus on reviewing the topics you missed and practice more questions in those areas.";
  } else if (accuracy >= 50) {
    return "You're making progress! Spend more time studying the fundamentals and practice more questions in your weak areas.";
  } else {
    return "Don't give up! Focus on understanding the basic concepts first. Consider reviewing study materials before attempting more questions.";
  }
};