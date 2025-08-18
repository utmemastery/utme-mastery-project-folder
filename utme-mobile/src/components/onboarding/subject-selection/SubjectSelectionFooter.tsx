import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { onboardingStyles } from '../../../styles/onboarding';
import { COLORS } from '../../../constants';

interface SubjectSelectionFooterProps {
  handleBack: () => void;
  handleContinue: () => void;
  isDisabled: boolean;
}

export const SubjectSelectionFooter: React.FC<SubjectSelectionFooterProps> = ({ handleBack, handleContinue, isDisabled }) => (
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
      accessibilityLabel="Continue to course selection"
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={{ flex: 2 }}
    />
  </View>
);