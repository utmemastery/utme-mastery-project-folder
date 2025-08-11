// mobile/src/components/ui/SubjectCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SubjectCardProps {
  subject: string;
  accuracy: number;
  totalQuestions: number;
  onPress: () => void;
}

const SUBJECT_ICONS: Record<string, string> = {
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

// Task Card Component
interface TaskCardProps {
  title: string;
  description: string;
  progress: number;
  icon: string;
  completed: boolean;
  onPress: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  progress,
  icon,
  completed,
  onPress
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
    }}
  >
    <View style={{
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: completed ? '#F0FDF4' : '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12
    }}>
      <Text style={{ fontSize: 20 }}>
        {completed ? '✅' : icon}
      </Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#1F2937',
        marginBottom: 2
      }}>
        {title}
      </Text>
      <Text style={{ 
        fontSize: 14, 
        color: '#6B7280',
        marginBottom: 8
      }}>
        {description}
      </Text>
      {/* Progress Bar */}
      <View style={{ 
        height: 4, 
        backgroundColor: '#E5E7EB', 
        borderRadius: 2, 
        overflow: 'hidden' 
      }}>
        <View style={{ 
          height: '100%', 
          backgroundColor: completed ? '#10B981' : '#3B82F6',
          width: `${progress * 100}%`
        }} />
      </View>
    </View>
    <Text style={{ color: '#6B7280', fontSize: 14 }}>→</Text>
  </TouchableOpacity>
);

// Action Button Component
interface ActionButtonProps {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ title, icon, color, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flex: 1,
      backgroundColor: color,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center'
    }}
  >
    <Text style={{ fontSize: 24, marginBottom: 8 }}>{icon}</Text>
    <Text style={{ 
      fontSize: 14, 
      fontWeight: '600', 
      color: 'white',
      textAlign: 'center'
    }}>
      {title}
    </Text>
  </TouchableOpacity>
);