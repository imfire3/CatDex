/**
 * Soft cream luminous veil — very light so Apple Maps 3D remains readable.
 */
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function MapLuminousOverlay() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.12)',
          'rgba(255, 255, 255, 0)',
          'rgba(255, 255, 255, 0.08)',
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
