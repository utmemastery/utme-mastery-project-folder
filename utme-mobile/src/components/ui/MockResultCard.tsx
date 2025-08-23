
// Mock Result Card Component
import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button'; // Assuming Button is a custom component
import { globalStyles } from '../../styles/global';
import { COLORS, SIZES } from '../../constants';
import { formatRelativeTime } from '../../utils/helper';
import { RecentScore } from '../../stores/mockExamStore';

interface MockResultCardProps {
  result: RecentScore;
}

export const MockResultCard: React.FC<MockResultCardProps> = ({ result }) => {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return COLORS.success;
    if (percentage >= 60) return COLORS.primary;
    if (percentage >= 40) return COLORS.warning;
    return COLORS.error;
  };

  return (
    <View style={[globalStyles.cardContainer, { flexDirection: 'row', alignItems: 'center' }]}>
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${getScoreColor(result.percentage)}20`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
      }}>
        <Text style={[globalStyles.text, { 
          fontWeight: 'bold', 
          color: getScoreColor(result.percentage) 
        }]}>
          {result.percentage}%
        </Text>
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={[globalStyles.text, { fontWeight: '500', marginBottom: 2 }]}>
          {result.examType === 'FULL_UTME' ? 'Full UTME Mock' : `${result.subject} Mock`}
        </Text>
        <Text style={globalStyles.subText}>
          {result.correctAnswers}/{result.questionCount} correct • {formatRelativeTime(result.completedAt)}
        </Text>
      </View>
      
      <Text style={[globalStyles.subText, { fontSize: SIZES.mediumText }]}>→</Text>
    </View>
  );
};
