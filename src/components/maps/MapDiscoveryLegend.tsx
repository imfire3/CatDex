import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  /** Zoom out and frame discoverable cats around the player. */
  onShowDiscoverable?: () => void;
  discoverableCount?: number;
};

/**
 * Discreet map legend — owned (solid) vs discoverable (open ring).
 * Tap « À découvrir » to overview nearby mystery pins.
 */
export function MapDiscoveryLegend({
  onShowDiscoverable,
  discoverableCount = 0,
}: Props) {
  const { colors, spacing, radius, shadow, motion } = useTheme();
  const insets = useSafeAreaInsets();
  const canOverview = Boolean(onShowDiscoverable) && discoverableCount > 0;

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel="Légende : plein capturé, vide à découvrir"
      style={[
        styles.wrap,
        {
          top: insets.top + spacing[8] + spacing[48] + spacing[8],
          left: spacing[16],
          backgroundColor: colors.surfaceElevated,
          borderRadius: radius.full,
          paddingHorizontal: spacing[8],
          paddingVertical: spacing[4],
          borderWidth: 1,
          borderColor: colors.border,
          gap: spacing[8],
        },
        shadow.low,
      ]}
    >
      <View style={styles.item} pointerEvents="none">
        <View style={[styles.dot, { backgroundColor: colors.brand }]} />
        <Text variant="caption" weight="semibold" color="textSecondary">
          Capturé
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          canOverview
            ? `À découvrir, ${discoverableCount} chat${discoverableCount > 1 ? 's' : ''} autour de toi`
            : 'À découvrir'
        }
        accessibilityHint={
          canOverview
            ? 'Dézoome la carte pour montrer les chats à découvrir autour de toi'
            : undefined
        }
        disabled={!canOverview}
        onPress={onShowDiscoverable}
        style={({ pressed }) => [
          styles.item,
          {
            opacity: canOverview ? 1 : 0.72,
            transform: [{ scale: pressed && canOverview ? motion.pressScale : 1 }],
            paddingHorizontal: spacing[4],
            paddingVertical: spacing[4],
            borderRadius: radius.full,
            backgroundColor:
              pressed && canOverview ? colors.brandSoft : 'transparent',
          },
        ]}
      >
        <View style={[styles.ring, { borderColor: colors.brand }]} />
        <Text
          variant="caption"
          weight="semibold"
          color={canOverview ? 'textBrand' : 'textSecondary'}
        >
          À découvrir
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ring: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
});
