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

type SurfaceTokens = {
  background: string;
  pressed: string;
  borderColor: string;
  borderWidth: number;
  label: string;
  useShadow: boolean;
};

/**
 * Primary = purple · Secondary / Outline / Ghost / Text · Destructive · Icon · Google / Apple
 * Primary CTA: height 56, radius 20, horizontal padding 24.
 */
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
  fullWidth = variant !== 'icon' && variant !== 'text',
}: ButtonProps) {
  const { colors, spacing, radius, fonts, motion, shadow } = useTheme();
  const isDisabled = disabled || loading;

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
            backgroundColor: colors.ctaSecondary,
            borderRadius: radius.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.ctaSecondaryBorder,
            opacity: isDisabled ? 0.5 : pressed ? 0.88 : 1,
            width: spacing[48],
            height: spacing[48],
            transform: [{ scale: pressed && !isDisabled ? motion.pressScale : 1 }],
          },
          style,
        ]}
      >
        {loading ? <ActivityIndicator color={colors.accent} /> : icon}
      </Pressable>
    );
  }

  const surfaces: Record<Exclude<ButtonVariant, 'icon'>, SurfaceTokens> = {
    primary: {
      background: isDisabled ? colors.surfaceDisabled : colors.accent,
      pressed: colors.accentPressed,
      borderColor: 'transparent',
      borderWidth: 0,
      label: isDisabled ? colors.textMuted : colors.onAccent,
      useShadow: !isDisabled,
    },
    secondary: {
      background: colors.ctaSecondary,
      pressed: colors.ctaSecondaryPressed,
      borderColor: colors.ctaSecondaryBorder,
      borderWidth: StyleSheet.hairlineWidth,
      label: isDisabled ? colors.textMuted : colors.brand,
      useShadow: false,
    },
    outline: {
      background: colors.surface,
      pressed: colors.brandSoft,
      borderColor: colors.brand,
      borderWidth: 1.5,
      label: isDisabled ? colors.textMuted : colors.brand,
      useShadow: false,
    },
    ghost: {
      background: colors.surfaceSecondary,
      pressed: colors.surfaceTertiary,
      borderColor: colors.border,
      borderWidth: 1,
      label: isDisabled ? colors.textMuted : colors.brand,
      useShadow: false,
    },
    text: {
      background: 'transparent',
      pressed: colors.brandSoft,
      borderColor: 'transparent',
      borderWidth: 0,
      label: isDisabled ? colors.textMuted : colors.brand,
      useShadow: false,
    },
    destructive: {
      background: colors.dangerSoft,
      pressed: colors.dangerSoft,
      borderColor: colors.danger,
      borderWidth: 1,
      label: colors.danger,
      useShadow: false,
    },
    google: {
      background: colors.surface,
      pressed: colors.authGooglePressed,
      borderColor: colors.authGoogleBorder,
      borderWidth: 1,
      label: colors.authGoogleLabel,
      useShadow: false,
    },
    apple: {
      background: colors.authAppleBg,
      pressed: colors.authApplePressed,
      borderColor: 'transparent',
      borderWidth: 0,
      label: colors.authAppleLabel,
      useShadow: true,
    },
  };

  const surface = surfaces[variant];
  const isTextVariant = variant === 'text';
  const horizontalPadding = isTextVariant ? spacing[8] : spacing[24];
  /** Text buttons keep a 44px minimum touch target (WCAG). */
  const minHeight = isTextVariant ? 44 : spacing[56];

  const content = (
    <View style={[styles.content, { gap: spacing[8] }]}>
      {loading ? (
        <ActivityIndicator color={surface.label} />
      ) : (
        <>
          {icon}
          {title ? (
            <Text
              variant="button"
              style={{
                fontFamily: fonts.bodySemi,
                color: surface.label,
              }}
            >
              {title}
            </Text>
          ) : (
            children
          )}
        </>
      )}
    </View>
  );

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
          borderRadius: radius.cta,
          minHeight,
          opacity: isDisabled && variant !== 'primary' ? 0.45 : 1,
          transform: [{ scale: pressed && !isDisabled ? motion.pressScale : 1 }],
          overflow: 'hidden',
          borderWidth: surface.borderWidth,
          borderColor: surface.borderColor,
          backgroundColor: pressed && !isDisabled ? surface.pressed : surface.background,
        },
        surface.useShadow ? shadow.low : null,
        style,
      ]}
    >
      <View style={{ paddingHorizontal: horizontalPadding, flex: 1, justifyContent: 'center' }}>
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
export const OutlineButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button {...props} variant="outline" />
);
export const TextButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button {...props} variant="text" />
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
