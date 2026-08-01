import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/theme';

/**
 * Soft luminous veil over map tiles — breaks the raw GPS look without
 * competing with markers.
 */
export function MapLuminousOverlay() {
  const { colors } = useTheme();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[
          'rgba(248, 248, 246, 0.22)',
          'rgba(255, 255, 255, 0.08)',
          'rgba(46, 201, 195, 0.05)',
          'rgba(248, 248, 246, 0.18)',
        ]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.surface, opacity: 0.04 },
        ]}
      />
    </View>
  );
}
