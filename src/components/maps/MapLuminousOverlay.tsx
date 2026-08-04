/**
 * Soft cream luminous veil — keeps the pale isometric map high-key.
 */
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function MapLuminousOverlay() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[
          'rgba(244, 243, 248, 0.18)',
          'rgba(255, 255, 255, 0)',
          'rgba(244, 243, 248, 0.14)',
        ]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
