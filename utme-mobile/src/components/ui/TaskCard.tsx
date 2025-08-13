import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// Task Card Component
interface TaskCardProps {
  title: string;
  description: string;
  progress: number;
  icon: string;
  completed: boolean;
  onPress: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
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