import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { onboardingStyles } from '../../../styles/onboarding';
import { COLORS } from '../../../constants';

interface CourseSelectionFooterProps {
  handleBack: () => void;
  handleContinue: () => void;
  isDisabled: boolean;
}

export const CourseSelectionFooter: React.FC<CourseSelectionFooterProps> = ({ handleBack, handleContinue, isDisabled }) => (
  <View style={onboardingStyles.buttonContainer}>
    <Button
      title="Back"
      onPress={handleBack}
      variant="outline"
      size="medium"
      accessibilityLabel="Go back"
      accessibilityRole="button"
      style={{ flex: 1 }}
    />
    <Button
      title="Continue"
      onPress={handleContinue}
      variant="primary"
      size="large"
      disabled={isDisabled}
      accessibilityLabel="Continue to goal setting"
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={{ flex: 2 }}
    />
  </View>
);