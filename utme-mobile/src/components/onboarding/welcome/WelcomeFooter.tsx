import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/types';
import { globalStyles } from '../../../styles/global';
import { COLORS, SIZES } from '../../../constants';

interface WelcomeFooterProps {
  navigation: NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>['navigation'];
}

export const WelcomeFooter: React.FC<WelcomeFooterProps> = ({ navigation }) => (
  <View style={styles.footerContainer}>
    <Button
      title="Let's Get Started"
      onPress={() => navigation.navigate('SubjectSelection')}
      variant="primary"
      size="large"
      accessibilityLabel="Start onboarding"
      accessibilityRole="button"
      style={{ marginBottom: 16 }}
    />
    <Text style={[globalStyles.subText, styles.footerText]}>
      Complete setup in just 3 minutes to get your personalized study plan
    </Text>
  </View>
);

const styles = StyleSheet.create({
  footerContainer: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});