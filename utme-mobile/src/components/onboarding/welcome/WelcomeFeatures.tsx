import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { onboardingStyles } from '../../../styles/onboarding';
import { globalStyles } from '../../../styles/global';
import { COLORS, SIZES } from '../../../constants';

const FEATURES = [
  { icon: '🧠', title: 'AI-Powered Learning', desc: 'Personalized study plans' },
  { icon: '📊', title: 'Real-Time Analytics', desc: 'Track your progress' },
  { icon: '🎮', title: 'Gamified Experience', desc: 'Make learning fun' },
];

export const WelcomeFeatures: React.FC = () => (
  <View style={onboardingStyles.sectionContainer}>
    {FEATURES.map((feature, index) => (
      <View key={index} style={[onboardingStyles.card, styles.featureCard]}>
        <Text style={styles.icon}>{feature.icon}</Text>
        <View style={styles.textContainer}>
          <Text style={[onboardingStyles.cardText, globalStyles.text]}>{feature.title}</Text>
          <Text style={globalStyles.subText}>{feature.desc}</Text>
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.cardPadding,
  },
  icon: {
    fontSize: SIZES.largeText,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
});