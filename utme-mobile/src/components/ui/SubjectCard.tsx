// mobile/src/components/ui/SubjectCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SubjectCardProps {
  subject: string;
  accuracy: number;
  totalQuestions: number;
  onPress: () => void;
}

export const SUBJECT_ICONS: Record<string, string> = {
  english: '📚',
  mathematics: '🔢',
  physics: '⚛️',
  chemistry: '🧪',
  biology: '🧬',
  geography: '🌍',
  economics: '💰',
  government: '🏛️',
  literature: '📖',
  history: '📜'
};

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  accuracy,
  totalQuestions,
  onPress
}) => {
  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return '#10B981';
    if (acc >= 60) return '#3B82F6';
    if (acc >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        width: 140,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2
      }}
    >
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 32, marginBottom: 8 }}>
          {SUBJECT_ICONS[subject] || '📋'}
        </Text>
        <Text style={{ 
          fontSize: 14, 
          fontWeight: '600', 
          color: '#1F2937',
          textAlign: 'center',
          marginBottom: 8,
          textTransform: 'capitalize'
        }}>
          {subject}
        </Text>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: getAccuracyColor(accuracy),
          marginBottom: 4
        }}>
          {accuracy}%
        </Text>
        <Text style={{ 
          fontSize: 12, 
          color: '#6B7280',
          textAlign: 'center'
        }}>
          {totalQuestions} questions
        </Text>
      </View>
    </TouchableOpacity>
  );
};


