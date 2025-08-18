import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleSheet,
  TouchableOpacityProps,
} from 'react-native';
import { globalStyles } from '../../styles/global';
import { COLORS, SIZES } from '../../constants';

interface CustomButtonProps {
  title: string;
  variant?: 'primary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: string;
  rightIcon?: string;
}

export type ButtonProps = CustomButtonProps & TouchableOpacityProps;

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
  rightIcon,
  ...rest // ✅ includes accessibilityLabel, accessibilityRole, etc.
}) => {
  const getButtonStyle = (): ViewStyle => {
    const sizeStyles = {
      small: { paddingVertical: 8, paddingHorizontal: 16 },
      medium: { paddingVertical: 12, paddingHorizontal: 20 },
      large: { paddingVertical: 14, paddingHorizontal: 22 },
    };
    const variantStyles = {
      primary: {
        backgroundColor: disabled ? COLORS.disabled : COLORS.primary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? COLORS.disabled : COLORS.primary,
      },
      text: {
        backgroundColor: 'transparent',
      },
    };
    return { ...globalStyles.button, ...sizeStyles[size], ...variantStyles[variant] };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles = {
      small: { fontSize: SIZES.mediumText },
      medium: { fontSize: SIZES.buttonText },
      large: { fontSize: 18 },
    };
    const variantStyles = {
      primary: { color: disabled ? COLORS.textTertiary : COLORS.white },
      outline: { color: disabled ? COLORS.textTertiary : COLORS.primary },
      text: { color: disabled ? COLORS.textTertiary : COLORS.primary },
    };
    return { ...globalStyles.buttonText, ...sizeStyles[size], ...variantStyles[variant] };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyle(), style]}
      activeOpacity={0.7}
      accessibilityLabel={title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      {...rest} // ✅ spreads accessibility & other TouchableOpacity props
    >
      {leftIcon && !loading && <Text style={styles.icon}>{leftIcon}</Text>}
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? COLORS.white : COLORS.primary}
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
      {rightIcon && !loading && <Text style={styles.icon}>{rightIcon}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    fontSize: SIZES.mediumText,
    marginHorizontal: 8,
  },
});
