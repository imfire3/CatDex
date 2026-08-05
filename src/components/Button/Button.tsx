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

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'text'
  | 'destructive'
  | 'icon'
  | 'google'
  | 'apple';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  title?: string;
  children?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  pill?: boolean;
};

const SIZE_HEIGHT: Record<ButtonSize, number> = {
  sm: 36,
  md: 48,
  lg: 56,
};

/**
 * Figma Cat-DEX-UI buttons — primary indigo, secondary surface, outline, ghost, text, destructive.
 * Heights: 36 / 48 / 56 · radius medium (16) or pill.
 */
export function Button({
  title,
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  accessibilityLabel,
  style,
  fullWidth = variant !== 'icon',
  pill = false,
}: ButtonProps) {
  const { colors, spacing, radius, motion, shadow } = useTheme();
  const isDisabled = disabled || loading;
  const height = SIZE_HEIGHT[size];

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
            backgroundColor: colors.surface,
            borderRadius: radius.full,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: isDisabled ? 0.45 : pressed ? 0.88 : 1,
            width: 44,
            height: 44,
            transform: [{ scale: pressed && !isDisabled ? motion.pressScale : 1 }],
          },
          shadow.soft,
          style,
        ]}
      >
        {loading ? <ActivityIndicator color={colors.primary} /> : icon}
      </Pressable>
    );
  }

  const labelColor = (() => {
    if (isDisabled && variant === 'primary') return colors.textMuted;
    if (variant === 'primary' || variant === 'destructive') return colors.onPrimary;
    if (variant === 'google') return colors.authGoogleLabel;
    if (variant === 'apple') return colors.authAppleLabel;
    if (variant === 'secondary' || variant === 'outline') {
      return isDisabled ? colors.textMuted : colors.text;
    }
    if (variant === 'ghost' || variant === 'text') {
      return isDisabled ? colors.textMuted : colors.primary;
    }
    return colors.primary;
  })();

  const content = (
    <View style={[styles.content, { gap: spacing[8] }]}>
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <>
          {icon}
          {title ? (
            <Text variant="button" style={{ color: labelColor }}>
              {title}
            </Text>
          ) : (
            children
          )}
        </>
      )}
    </View>
  );

  const primaryDisabled = variant === 'primary' && isDisabled;

  const surfaceBg = (() => {
    if (primaryDisabled) return colors.surfaceDisabled;
    if (variant === 'primary') return colors.primary;
    if (variant === 'google') return colors.background;
    if (variant === 'apple') return colors.authAppleBg;
    if (variant === 'secondary') return colors.surface;
    if (variant === 'outline') return colors.background;
    if (variant === 'ghost' || variant === 'text') return 'transparent';
    if (variant === 'destructive') return colors.danger;
    return 'transparent';
  })();

  const showBorder =
    primaryDisabled ||
    variant === 'secondary' ||
    variant === 'outline' ||
    variant === 'google';

  const borderRadius = pill ? radius.pill : radius.cta;

  const pressedBg = (() => {
    if (variant === 'primary') return colors.primaryPressed;
    if (variant === 'google') return colors.authGooglePressed;
    if (variant === 'apple') return colors.authApplePressed;
    if (variant === 'secondary') return colors.ctaSecondaryPressed;
    if (variant === 'outline') return colors.surface;
    if (variant === 'destructive') return '#DC2626';
    if (variant === 'ghost' || variant === 'text') return colors.primarySoft;
    return colors.surface;
  })();

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
          borderRadius,
          minHeight: height,
          height,
          opacity: isDisabled && !primaryDisabled ? 0.45 : 1,
          transform: [{ scale: pressed && !isDisabled ? motion.pressScale : 1 }],
          overflow: 'hidden',
          borderWidth: showBorder ? 1 : 0,
          borderColor:
            variant === 'google'
              ? colors.authGoogleBorder
              : variant === 'outline' || variant === 'secondary' || primaryDisabled
                ? colors.border
                : colors.border,
          backgroundColor: pressed && !isDisabled ? pressedBg : surfaceBg,
        },
        (variant === 'primary' && !isDisabled) || variant === 'apple' ? shadow.soft : null,
        style,
      ]}
    >
      <View style={{ paddingHorizontal: spacing[16], flex: 1, justifyContent: 'center' }}>
        {content}
      </View>
    </Pressable>
  );
}

export const PrimaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button {...props} variant="primary" />
);
export const SecondaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button {...props} variant="secondary" />
);
export const GhostButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button {...props} variant="ghost" />
);

const styles = StyleSheet.create({
  button: {
    alignSelf: 'stretch',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
