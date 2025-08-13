// mobile/src/components/ui/ActionButton.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';


// Action Button Component
interface ActionButtonProps {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ title, icon, color, onPress }) => (
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