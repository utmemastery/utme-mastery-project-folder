import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { onboardingStyles } from '../../../styles/onboarding';
import { COLORS, SIZES } from '../../../constants';

interface DiagnosticQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: string;
}

interface DiagnosticAssessmentQuestionProps {
  currentQuestion: DiagnosticQuestion;
  selectedAnswer: number | null;
  handleAnswerSelect: (index: number) => void;
}

export const DiagnosticAssessmentQuestion: React.FC<DiagnosticAssessmentQuestionProps> = ({
  currentQuestion,
  selectedAnswer,
  handleAnswerSelect,
}) => (
  <View style={onboardingStyles.sectionContainer}>
    <Text style={styles.questionText}>{currentQuestion.question}</Text>
    <View style={styles.optionsContainer}>
      {currentQuestion.options.map((option, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleAnswerSelect(index)}
          style={[
            onboardingStyles.card,
            selectedAnswer === index && onboardingStyles.selectedCard,
          ]}
          accessibilityLabel={`Option ${String.fromCharCode(65 + index)}: ${option}`}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedAnswer === index }}
        >
          <View style={[
            styles.radio,
            selectedAnswer === index && styles.selectedRadio,
          ]}>
            {selectedAnswer === index && (
              <Text style={styles.radioText}>{String.fromCharCode(65 + index)}</Text>
            )}
          </View>
          <Text style={[
            onboardingStyles.cardText,
            selectedAnswer === index && onboardingStyles.selectedCardText,
          ]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  questionText: {
    fontSize: SIZES.mediumText,
    color: COLORS.textPrimary,
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textTertiary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadio: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  radioText: {
    color: COLORS.white,
    fontSize: SIZES.smallText,
    fontWeight: 'bold',
  },
});