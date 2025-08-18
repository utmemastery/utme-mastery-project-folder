import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { onboardingStyles } from '../../../styles/onboarding';
import { SIZES } from '../../../constants';

interface DiagnosticAssessmentFooterProps {
  isLastQuestion: boolean;
  handleNextQuestion: () => void;
  isDisabled: boolean;
  isLoading: boolean;
}

export const DiagnosticAssessmentFooter: React.FC<DiagnosticAssessmentFooterProps> = ({
  isLastQuestion,
  handleNextQuestion,
  isDisabled,
  isLoading,
}) => (
  <View style={onboardingStyles.buttonContainer}>
    <Button
      title={isLastQuestion ? 'Complete Assessment' : 'Next Question'}
      onPress={handleNextQuestion}
      variant="primary"
      size="large"
      disabled={isDisabled}
      loading={isLoading}
      accessibilityLabel={isLastQuestion ? 'Complete assessment' : 'Next question'}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      style={{ borderRadius: SIZES.smallBorderRadius }}
    />
  </View>
);