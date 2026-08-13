import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Discreet map legend — owned (solid) vs discoverable (open ring).
 * Sits under the top HUD row without covering profile / tools.
 */
export function MapDiscoveryLegend() {
  const { colors, spacing, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="none"
      accessibilityRole="text"
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
      <View style={styles.item}>
        <View style={[styles.dot, { backgroundColor: colors.brand }]} />
        <Text
          variant="caption" weight="semibold"
          color="textSecondary"
        >
          Capturé
        </Text>
      </View>
      <View style={styles.item}>
        <View style={[styles.ring, { borderColor: colors.brand }]} />
        <Text
          variant="caption" weight="semibold"
          color="textSecondary"
        >
          À découvrir
        </Text>
      </View>
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
