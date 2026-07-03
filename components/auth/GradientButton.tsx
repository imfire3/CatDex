import { Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GAME, GRADIENTS } from "@/constants/game";

type GradientButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function GradientButton({ label, onPress, disabled, loading }: GradientButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.wrap,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <LinearGradient
        colors={[...GRADIENTS.primary]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}
      >
        <Text style={styles.label}>{loading ? "..." : label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    borderRadius: GAME.radius.full,
    overflow: "hidden",
    borderWidth: GAME.border.default,
    borderColor: GAME.skyDark,
    minHeight: GAME.touch.button,
  },
  gradient: {
    flex: 1,
    paddingVertical: GAME.space.sm,
    paddingHorizontal: GAME.space.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: GAME.navy,
    fontWeight: GAME.weight.black,
    fontSize: GAME.type.body,
    letterSpacing: 0.3,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});
