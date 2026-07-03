import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, borderRadius, spacing } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.text} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, styles[`text_${variant}`], icon ? styles.textWithIcon : undefined]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  ghost: { backgroundColor: 'transparent' },
  size_sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  size_md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  size_lg: { paddingVertical: spacing.md + 4, paddingHorizontal: spacing.xl },
  disabled: { opacity: 0.5 },
  text: { fontWeight: '600', fontSize: 16 },
  text_primary: { color: colors.text },
  text_secondary: { color: colors.text },
  text_outline: { color: colors.primary },
  text_ghost: { color: colors.primary },
  textWithIcon: { marginLeft: spacing.sm },
});
