import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { usePracticeStore } from '../../stores/practiceStore';
import { practiceStyles as styles } from '../../styles/practice';
import { COLORS, SIZES } from '../../constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PracticeStackParamList } from '../../navigation/types';


type Props = NativeStackScreenProps<PracticeStackParamList, 'ReviewMistakes'>;

export const ReviewMistakesScreen: React.FC<Props> = ({ route, navigation }) => {  const { sessionId } = route.params;
  const { mistakes, reviewMistakes, scheduleReview } = usePracticeStore();

  useEffect(() => {
    reviewMistakes(sessionId);
  }, [sessionId]);

  const MistakeCard = ({ mistake, index }: { mistake: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(200 + index * 100)} style={styles.actionCard}>
      <Text style={styles.actionTitle}>Question {index + 1}</Text>
      <Text style={styles.actionSubtitle}>{mistake.question}</Text>
      <Text style={styles.actionDetail}>Selected: {mistake.selectedAnswer}</Text>
      <Text style={styles.actionDetail}>Correct: {mistake.correctAnswer}</Text>
      <Text style={styles.actionDetail}>Explanation: {mistake.explanation}</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() =>
          scheduleReview({
            questionId: mistake.questionId,
            difficulty: 1,
            performance: 0.6,
          })
        }
      >
        <Text style={styles.actionButtonText}>SCHEDULE REVIEW</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Mistakes</Text>
      </View>
      <ScrollView style={styles.content}>
        {mistakes.length > 0 ? (
          mistakes.map((mistake, index) => (
            <MistakeCard key={index} mistake={mistake} index={index} />
          ))
        ) : (
          <Text style={styles.actionSubtitle}>No mistakes to review.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};