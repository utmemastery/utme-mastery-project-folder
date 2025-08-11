// mobile/src/components/ui/StatCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
  flex?: number;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  flex = 0,
  onPress
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        flex: flex > 0 ? flex : undefined,
        minWidth: flex > 0 ? undefined : 120,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1
      }}
      onPress={onPress}
    >
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 24, marginBottom: 8 }}>{icon}</Text>
        <Text style={{ 
          fontSize: 20, 
          fontWeight: 'bold', 
          color, 
          marginBottom: 4 
        }}>
          {value}
        </Text>
        <Text style={{ 
          fontSize: 12, 
          color: '#6B7280', 
          textAlign: 'center',
          fontWeight: '500' 
        }}>
          {title}
        </Text>
        <Text style={{ 
          fontSize: 10, 
          color: '#9CA3AF', 
          textAlign: 'center' 
        }}>
          {subtitle}
        </Text>
      </View>
    </CardComponent>
  );
};