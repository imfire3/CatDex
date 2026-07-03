import { Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AUTH, BORDER, POGO, RADIUS, SPACE, TYPE } from "@/constants/theme";

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
    >
      <LinearGradient
        colors={[AUTH.gradientStart, AUTH.gradientEnd]}
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
    borderRadius: RADIUS.full,
    overflow: "hidden",
    borderWidth: BORDER.default,
    borderColor: POGO.skyDark,
  },
  gradient: {
    paddingVertical: SPACE.sm - 4,
    paddingHorizontal: SPACE.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: POGO.navy,
    fontWeight: "900",
    fontSize: TYPE.body,
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
