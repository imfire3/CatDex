import { LinearGradient } from 'expo-linear-gradient';
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

/** PrimaryButton / SecondaryButton / GhostButton via variant */
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
  const { colors, spacing, radius, shadow, fonts, gradients, motion } = useTheme();
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
            opacity: isDisabled ? 0.45 : pressed ? 0.88 : 1,
            width: spacing[48],
            height: spacing[48],
            transform: [{ scale: pressed && !isDisabled ? motion.pressScale : 1 }],
          },
          shadow.small,
          style,
        ]}
      >
        {loading ? <ActivityIndicator color={colors.accent} /> : icon}
      </Pressable>
    );
  }

  const content = (
    <View style={[styles.content, { gap: spacing[8] }]}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onPrimary : colors.text} />
      ) : (
        <>
          {icon}
          {title ? (
            <Text
              variant="body"
              style={{
                fontFamily: fonts.bodySemi,
                color: variant === 'primary' ? colors.onPrimary : colors.text,
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
          borderRadius: radius.lg,
          minHeight: 56,
          opacity: isDisabled ? 0.45 : 1,
          transform: [{ scale: pressed && !isDisabled ? motion.pressScale : 1 }],
          overflow: 'hidden',
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: colors.border,
          backgroundColor:
            variant === 'secondary' ? 'transparent' : variant === 'ghost' ? 'transparent' : undefined,
        },
        variant === 'primary' ? shadow.medium : null,
        style,
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={[gradients.primary[0], gradients.primary[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientFill, { paddingHorizontal: spacing[16] }]}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={{ paddingHorizontal: spacing[16], flex: 1, justifyContent: 'center' }}>
          {content}
        </View>
      )}
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
  gradientFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
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
