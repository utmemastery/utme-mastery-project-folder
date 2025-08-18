import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { onboardingStyles } from '../../../styles/onboarding';
import { globalStyles } from '../../../styles/global';
import { COLORS, SIZES } from '../../../constants';

interface LearningStyle {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface GoalSettingStylesProps {
  learningStyle: string;
  setLearningStyle: (value: string) => void;
}

const LEARNING_STYLES: LearningStyle[] = [
  { id: 'visual', name: 'Visual Learner', icon: '👁️', description: 'Learn best with charts, diagrams, and images' },
  { id: 'auditory', name: 'Auditory Learner', icon: '👂', description: 'Prefer explanations and discussions' },
  { id: 'kinesthetic', name: 'Hands-on Learner', icon: '✋', description: 'Learn through practice and examples' },
  { id: 'reading', name: 'Reading/Writing', icon: '📝', description: 'Prefer text-based learning and notes' },
];

export const GoalSettingStyles: React.FC<GoalSettingStylesProps> = ({ learningStyle, setLearningStyle }) => (
  <View style={onboardingStyles.sectionContainer}>
    <Text style={[globalStyles.text, styles.title]}>How Do You Learn Best?</Text>
    {LEARNING_STYLES.map(style => (
      <TouchableOpacity
        key={style.id}
        onPress={() => setLearningStyle(style.id)}
        style={[
          onboardingStyles.card,
          learningStyle === style.id && onboardingStyles.selectedCard,
        ]}
        accessibilityLabel={style.name}
        accessibilityRole="button"
        accessibilityState={{ selected: learningStyle === style.id }}
      >
        <Text style={styles.icon}>{style.icon}</Text>
        <View style={styles.textContainer}>
          <Text style={[
            onboardingStyles.cardText,
            learningStyle === style.id && onboardingStyles.selectedCardText,
          ]}>
            {style.name}
          </Text>
          <Text style={globalStyles.subText}>{style.description}</Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  title: {
    fontWeight: '600',
    marginBottom: 16,
  },
  icon: {
    fontSize: SIZES.largeText,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
});