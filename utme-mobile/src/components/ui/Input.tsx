// mobile/src/components/ui/Input.tsx (Enhanced version)
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[{ marginBottom: 16 }, style]}>
      {label && (
        <Text style={{
          fontSize: 14,
          fontWeight: '500',
          color: '#374151',
          marginBottom: 8
        }}>
          {label}
        </Text>
      )}
      
      <View style={{
        flexDirection: 'row',
        alignItems: multiline ? 'flex-start' : 'center',
        backgroundColor: disabled ? '#F3F4F6' : 'white',
        borderWidth: 1,
        borderColor: error ? '#EF4444' : isFocused ? '#3B82F6' : '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: multiline ? 12 : 0,
        minHeight: multiline ? numberOfLines * 20 + 24 : 48
      }}>
        {leftIcon && (
          <Text style={{ fontSize: 16, marginRight: 8, color: '#6B7280' }}>
            {leftIcon}
          </Text>
        )}
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[{
            flex: 1,
            fontSize: 16,
            color: '#1F2937',
            paddingVertical: multiline ? 0 : 12
          }, inputStyle]}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            style={{ marginLeft: 8 }}
          >
            <Text style={{ fontSize: 16, color: '#6B7280' }}>
              {rightIcon}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={{
          fontSize: 12,
          color: '#EF4444',
          marginTop: 4
        }}>
          {error}
        </Text>
      )}
    </View>
  );
};