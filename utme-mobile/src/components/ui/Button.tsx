// mobile/src/components/ui/Button.tsx (Enhanced version)
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: string;
  rightIcon?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    };

    // Size styles
    const sizeStyles = {
      small: { paddingVertical: 8, paddingHorizontal: 16 },
      medium: { paddingVertical: 12, paddingHorizontal: 20 },
      large: { paddingVertical: 16, paddingHorizontal: 24 }
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: disabled ? '#D1D5DB' : '#3B82F6',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? '#D1D5DB' : '#3B82F6'
      },
      text: {
        backgroundColor: 'transparent'
      }
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant]
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600'
    };

    // Size styles
    const sizeStyles = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 }
    };

    // Variant styles
    const variantStyles = {
      primary: {
        color: disabled ? '#9CA3AF' : 'white'
      },
      outline: {
        color: disabled ? '#9CA3AF' : '#3B82F6'
      },
      text: {
        color: disabled ? '#9CA3AF' : '#3B82F6'
      }
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant]
    };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyle(), style]}
      activeOpacity={0.7}
    >
      {leftIcon && !loading && (
        <Text style={{ fontSize: 16, marginRight: 8 }}>{leftIcon}</Text>
      )}
      
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? 'white' : '#3B82F6'} 
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
      
      {rightIcon && !loading && (
        <Text style={{ fontSize: 16, marginLeft: 8 }}>{rightIcon}</Text>
      )}
    </TouchableOpacity>
  );
};