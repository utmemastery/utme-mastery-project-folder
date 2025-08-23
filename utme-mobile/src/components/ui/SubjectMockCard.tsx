// Subject Mock Card Component
import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button'; // Assuming Button is a custom component
import { globalStyles } from '../../styles/global';
import { COLORS, SIZES } from '../../constants';

interface SubjectMockCardProps {
  subject: string;
  onPress: () => void;
}

export const SubjectMockCard: React.FC<SubjectMockCardProps> = ({ subject, onPress }) => {
  const getSubjectIcon = (subj: string) => {
    const icons: Record<string, string> = {
      english: '📚',
      mathematics: '🔢',
      physics: '⚛️',
      chemistry: '🧪',
      biology: '🧬',
      geography: '🌍',
      economics: '💰',
      government: '🏛️'
    };
    return icons[subj.toLowerCase()] || '📋';
  };

  return (
    <View style={[globalStyles.cardContainer, { width: 140, alignItems: 'center' }]}>
      <Text style={{ fontSize: SIZES.xLargeText, marginBottom: 8 }}>
        {getSubjectIcon(subject)}
      </Text>
      <Text style={[globalStyles.text, { 
        fontWeight: '600', 
        textAlign: 'center', 
        marginBottom: 8,
        textTransform: 'capitalize'
      }]}>
        {subject}
      </Text>
      <Text style={[globalStyles.subText, { textAlign: 'center', marginBottom: 8 }]}>
        60 questions • 1 hour
      </Text>
      <Button
        title="START MOCK"
        onPress={onPress}
        variant="primary"
        size="small"
        style={{ backgroundColor: COLORS.primaryLight }}
        textStyle={{ fontSize: SIZES.smallText, color: COLORS.primary }}
      />
    </View>
  );
};