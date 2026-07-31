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
  | 'ghost'
  | 'destructive'
  | 'icon';

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

/** Primary = turquoise · Secondary = navy border · Ghost · Destructive · Icon */
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
            backgroundColor: colors.surface,
            borderRadius: radius.full,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: isDisabled ? 0.5 : pressed ? 0.88 : 1,
            width: spacing[48],
            height: spacing[48],
            transform: [{ scale: pressed && !isDisabled ? motion.pressScale : 1 }],
          },
          shadow.low,
          style,
        ]}
      >
        {loading ? <ActivityIndicator color={colors.accent} /> : icon}
      </Pressable>
    );
  }

  const labelColor =
    variant === 'primary'
      ? colors.onAccent
      : variant === 'destructive'
        ? colors.danger
        : colors.brand;

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
                fontFamily: fonts.bodySemi,
                color: labelColor,
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

  const surfaceBg =
    variant === 'primary'
      ? colors.accent
      : variant === 'secondary'
        ? colors.surfaceSecondary
        : variant === 'destructive'
          ? colors.dangerSoft
          : 'transparent';

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
          borderRadius: radius.button,
          minHeight: spacing[56],
          opacity: isDisabled ? 0.5 : 1,
          transform: [{ scale: pressed && !isDisabled ? motion.pressScale : 1 }],
          overflow: 'hidden',
          borderWidth: variant === 'secondary' || variant === 'destructive' ? 1 : 0,
          borderColor:
            variant === 'destructive'
              ? colors.danger
              : variant === 'secondary'
                ? colors.border
                : 'transparent',
          backgroundColor: pressed
            ? variant === 'primary'
              ? colors.accentPressed
              : variant === 'secondary'
                ? colors.brandSoft
                : variant === 'destructive'
                  ? colors.dangerSoft
                  : colors.brandSoft
            : surfaceBg,
        },
        variant === 'primary' ? shadow.medium : null,
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
