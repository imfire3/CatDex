import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { mapPalette } from './mapPalette';

/**
 * Soft cream luminous veil — breaks the raw GPS look without washing markers.
 */
export function MapLuminousOverlay() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[
          'rgba(248, 248, 245, 0.28)',
          'rgba(255, 255, 255, 0.06)',
          'rgba(46, 201, 195, 0.04)',
          'rgba(248, 248, 245, 0.22)',
        ]}
        locations={[0, 0.32, 0.68, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: mapPalette.land, opacity: 0.05 },
        ]}
      />
    </View>
  );
}
