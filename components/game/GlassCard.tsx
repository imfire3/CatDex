import { StyleSheet, View, type ViewProps } from "react-native";
import { GAME, ELEVATION } from "@/constants/game";

type GlassCardProps = ViewProps & {
  padding?: number;
  variant?: "default" | "elevated" | "subtle";
};

export function GlassCard({
  children,
  style,
  padding = GAME.space.md,
  variant = "default",
  ...props
}: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === "elevated" && styles.elevated,
        variant === "subtle" && styles.subtle,
        { padding },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: GAME.radius.lg,
    backgroundColor: GAME.glass,
    borderWidth: 1,
    borderColor: GAME.glassBorder,
    ...ELEVATION.sm,
  },
  elevated: {
    backgroundColor: GAME.glassStrong,
    ...ELEVATION.md,
  },
  subtle: {
    backgroundColor: "rgba(255,255,255,0.06)",
    ...ELEVATION.none,
  },
});
