import { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type AccessibilityState,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';

export type ButtonProps = {
  title?: string;
  children?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
};

export function Button({
  title,
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  accessibilityLabel,
  style,
  fullWidth = variant !== 'icon',
}: ButtonProps) {
  const { colors, spacing, radius, shadow, fonts } = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'primary'
      ? colors.accent
      : variant === 'secondary'
        ? colors.surfaceSecondary
        : 'transparent';

  const labelColor =
    variant === 'primary'
      ? ('onAccent' as const)
      : variant === 'ghost'
        ? ('textSecondary' as const)
        : ('text' as const);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (isDisabled) return;
      onPress?.(event);
    },
    [isDisabled, onPress],
  );

  const accessibilityState: AccessibilityState = {
    disabled: isDisabled,
    busy: loading,
  };

  if (variant === 'icon') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={accessibilityState}
        disabled={isDisabled}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.iconButton,
          {
            backgroundColor: colors.surfaceSecondary,
            borderRadius: radius.full,
            opacity: isDisabled ? 0.45 : pressed ? 0.88 : 1,
            width: spacing[40],
            height: spacing[40],
          },
          style,
        ]}
      >
        {loading ? <ActivityIndicator color={colors.accent} /> : icon}
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={accessibilityState}
      disabled={isDisabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        fullWidth && styles.fullWidth,
        {
          backgroundColor,
          borderRadius: radius.lg,
          paddingHorizontal: spacing[16],
          minHeight: spacing[48],
          opacity: isDisabled ? 0.45 : pressed ? 0.9 : 1,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: colors.border,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
        },
        variant === 'primary' ? shadow.small : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onAccent : colors.accent} />
      ) : (
        <View style={[styles.content, { gap: spacing[8] }]}>
          {icon}
          {title ? (
            <Text variant="body" color={labelColor} style={{ fontFamily: fonts.bodySemi }}>
              {title}
            </Text>
          ) : (
            children
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
