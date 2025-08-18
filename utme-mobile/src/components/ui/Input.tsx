import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { globalStyles } from '../../styles/global';
import { COLORS } from '../../constants';

interface CustomInputProps {
  label?: string;
  error?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export type InputProps = TextInputProps & CustomInputProps;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  labelStyle,
  ...rest // includes value, onChangeText, placeholder, keyboardType, accessibilityLabel, etc.
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[globalStyles.input, style]}>
      {label && <Text style={[globalStyles.label, labelStyle]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: disabled ? COLORS.disabled : COLORS.white,
            borderColor: error
              ? COLORS.error
              : isFocused
              ? COLORS.primary
              : COLORS.textTertiary,
            minHeight: rest.multiline
              ? (rest.numberOfLines || 1) * 20 + 24
              : 48,
          },
        ]}
      >
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
        <TextInput
          {...rest}
          editable={!disabled}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
          style={[globalStyles.inputText, styles.inputText, inputStyle]}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.icon}
            disabled={!onRightIconPress}
            accessibilityLabel={
              onRightIconPress ? 'Toggle input action' : undefined
            }
            accessibilityRole={onRightIconPress ? 'button' : undefined}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={globalStyles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 0,
  },
  inputText: {
    flex: 1,
    paddingVertical: 12,
  },
  icon: {
    marginHorizontal: 8,
  },
});
