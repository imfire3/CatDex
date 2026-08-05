import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

export type CameraCaptureButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Large circular shutter control for the camera / scanner screen.
 * Outer ring + solid purple core — 72px hit area, 44px+ accessible.
 */
export function CameraCaptureButton({
  onPress,
  disabled = false,
  accessibilityLabel = 'Prendre une photo',
  style,
}: CameraCaptureButtonProps) {
  const { colors, spacing, radius, motion, shadow } = useTheme();
  const outer = spacing[80];
  const ring = spacing[64];
  const core = spacing[56];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: outer,
          height: outer,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed && !disabled ? motion.pressScale : 1 }],
        },
        style,
      ]}
    >
      <View
        style={[
          {
            width: ring,
            height: ring,
            borderRadius: radius.full,
            borderWidth: 4,
            borderColor: colors.onAccent,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.glassFill,
          },
          shadow.glow,
        ]}
      >
        <View
          style={{
            width: core,
            height: core,
            borderRadius: radius.full,
            backgroundColor: colors.accent,
          }}
        />
      </View>
    </Pressable>
  );
}
