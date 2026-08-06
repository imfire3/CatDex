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
  | 'tertiary'
  | 'ghost'
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

/**
 * Primary = indigo · Secondary = white fill · Tertiary = text-only brand
 * Ghost · Destructive · Icon · Google / Apple
 * CTA corners use radius.cta (16).
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
  fullWidth = variant !== 'icon',
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
            borderRadius: radius[8],
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

  const labelColor =
    variant === 'primary'
      ? isDisabled
        ? colors.textMuted
        : colors.onAccent
      : variant === 'google'
        ? colors.authGoogleLabel
        : variant === 'apple'
          ? colors.authAppleLabel
          : variant === 'secondary' || variant === 'tertiary'
            ? isDisabled
              ? colors.textMuted
              : colors.brand
            : variant === 'destructive'
              ? colors.danger
              : colors.brand;

  const labelWeight = fonts.bodySemi;

  const content = (
    <View style={[styles.content, { gap: spacing[8] }]}>
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <>
          {icon}
          {title ? (
            <Text
              variant="body"
              style={{
                fontFamily: labelWeight,
                color: labelColor,
                textDecorationLine: variant === 'tertiary' ? 'underline' : 'none',
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

  const primaryDisabled = variant === 'primary' && isDisabled;

  const surfaceBg = primaryDisabled
    ? colors.surfaceDisabled
    : variant === 'primary'
      ? colors.accent
      : variant === 'google'
        ? colors.surface
        : variant === 'apple'
          ? colors.authAppleBg
          : variant === 'secondary'
            ? colors.ctaSecondary
            : variant === 'tertiary'
              ? 'transparent'
              : variant === 'ghost'
                ? colors.surface
                : variant === 'destructive'
                  ? colors.dangerSoft
                  : 'transparent';

  const showBorder =
    primaryDisabled ||
    variant === 'secondary' ||
    variant === 'destructive' ||
    variant === 'google' ||
    variant === 'ghost';

  const borderRadius = radius.cta;

  const pressedBg =
    variant === 'primary'
      ? colors.accentPressed
      : variant === 'google'
        ? colors.authGooglePressed
        : variant === 'apple'
          ? colors.authApplePressed
          : variant === 'secondary'
            ? colors.ctaSecondaryPressed
            : variant === 'tertiary'
              ? colors.brandSoft
              : variant === 'destructive'
                ? colors.dangerSoft
                : colors.surfaceTertiary;

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
          minHeight: spacing[56],
          opacity: isDisabled && !primaryDisabled ? 0.45 : 1,
          transform: [{ scale: pressed && !isDisabled ? motion.pressScale : 1 }],
          overflow: 'hidden',
          borderWidth: variant === 'google' ? 1 : showBorder ? (variant === 'secondary' || primaryDisabled ? StyleSheet.hairlineWidth : 1) : 0,
          borderColor:
            variant === 'google'
              ? colors.authGoogleBorder
              : variant === 'destructive'
                ? colors.danger
                : variant === 'secondary' || primaryDisabled
                  ? colors.ctaSecondaryBorder
                  : colors.border,
          backgroundColor: pressed && !isDisabled ? pressedBg : surfaceBg,
        },
        (variant === 'primary' && !isDisabled) || variant === 'apple' ? shadow.low : null,
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
export const TertiaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button {...props} variant="tertiary" />
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
