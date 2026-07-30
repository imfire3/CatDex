import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

export type ToastProps = {
  visible: boolean;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  tone?: 'default' | 'success' | 'warning';
};

export function Toast({
  visible,
  title,
  description,
  actionLabel,
  onAction,
  onDismiss,
  tone = 'default',
}: ToastProps) {
  const { colors, fonts, spacing, radius, scheme, shadow } = useTheme();
  const reduceMotion = useReducedMotion();

  if (!visible) return null;

  const accent =
    tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : colors.primary;

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeIn.duration(200)}
      exiting={reduceMotion ? undefined : FadeOut.duration(160)}
      style={[
        styles.wrap,
        {
          marginHorizontal: spacing[16],
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: accent + '44',
          overflow: 'hidden',
        },
        shadow.medium,
      ]}
    >
      <BlurView intensity={40} tint={scheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[16],
          padding: spacing[16],
          backgroundColor: colors.overlay,
        }}
      >
        <View style={{ flex: 1, gap: spacing[4] }}>
          <Text variant="body" style={{ fontFamily: fonts.bodyBlack }}>
            {title}
          </Text>
          {description ? (
            <Text variant="caption" color="textSecondary">
              {description}
            </Text>
          ) : null}
        </View>
        {actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            style={({ pressed }) => ({
              backgroundColor: accent,
              borderRadius: radius.md,
              paddingHorizontal: spacing[16],
              minHeight: spacing[40],
              justifyContent: 'center',
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text
              variant="caption"
              color={tone === 'success' || tone === 'warning' ? 'onPrimary' : 'onPrimary'}
              style={{
                fontFamily: fonts.bodyBlack,
                color: tone === 'success' ? colors.background : colors.onPrimary,
              }}
            >
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
        {onDismiss ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={onDismiss} hitSlop={8}>
            <Text variant="caption" color="textSecondary">
              Fermer
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 30,
  },
});
