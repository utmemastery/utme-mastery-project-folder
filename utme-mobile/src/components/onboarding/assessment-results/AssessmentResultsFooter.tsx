import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { onboardingStyles } from '../../../styles/onboarding';
import { SIZES } from '../../../constants';

interface AssessmentResultsFooterProps {
  handleStartLearning: () => void;
}

export const AssessmentResultsFooter: React.FC<AssessmentResultsFooterProps> = ({ handleStartLearning }) => (
  <View style={onboardingStyles.buttonContainer}>
    <Button
      title="Start My Learning Journey"
      onPress={handleStartLearning}
      variant="primary"
      size="large"
      accessibilityLabel="Start learning journey"
      accessibilityRole="button"
      style={{ borderRadius: SIZES.smallBorderRadius }}
    />
  </View>
);