import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../../../styles/global';
import { onboardingStyles } from '../../../styles/onboarding';
import { COLORS, SIZES } from '../../../constants';

interface SubjectProficiency {
  subject: string;
  proficiency: number;
}

interface AssessmentResultsSubjectsProps {
  subjectProficiency: SubjectProficiency[];
  getSubjectName: (subject: string) => string;
  getProficiencyLevel: (score: number) => { level: string; color: string };
}

export const AssessmentResultsSubjects: React.FC<AssessmentResultsSubjectsProps> = ({
  subjectProficiency,
  getSubjectName,
  getProficiencyLevel,
}) => {
  const chartData = {
    labels: subjectProficiency.map(item => getSubjectName(item.subject)),
    datasets: [
      {
        data: subjectProficiency.map(item => Math.round(item.proficiency)),
        // dynamic per-bar colors
        colors: subjectProficiency.map(item => () => getProficiencyLevel(item.proficiency).color),
      },
    ],
  };

  return (
    <View style={onboardingStyles.sectionContainer}>
      <Text style={[globalStyles.text, styles.title]}>Subject Performance</Text>
    
      {subjectProficiency.map(item => {
        const { level, color } = getProficiencyLevel(item.proficiency);
        return (
          <View key={item.subject} style={onboardingStyles.card}>
            <View style={styles.subjectHeader}>
              <Text style={styles.subjectName}>{getSubjectName(item.subject)}</Text>
              <Text style={[styles.levelText, { color }]}>{level}</Text>
            </View>
            <View style={onboardingStyles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${item.proficiency}%`, backgroundColor: color },
                ]}
              />
            </View>
            <Text style={styles.proficiencyText}>
              {Math.round(item.proficiency)}% proficiency
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontWeight: '600',
    marginBottom: 16,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: SIZES.mediumText,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  levelText: {
    fontSize: SIZES.smallText,
    fontWeight: '600',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  proficiencyText: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
