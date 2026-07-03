import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GAME } from "@/constants/game";

type ProgressBarProps = {
  progress: number;
  height?: number;
  variant?: "sky" | "gold" | "green";
  label?: string;
  showPercent?: boolean;
  style?: ViewStyle;
};

const VARIANTS = {
  sky: [GAME.sky, GAME.skyDark] as const,
  gold: [GAME.gold, GAME.goldDark] as const,
  green: [GAME.green, "#248A3D"] as const,
};

export function ProgressBar({
  progress,
  height = 8,
  variant = "sky",
  label,
  showPercent,
  style,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.wrap, style]} accessibilityRole="progressbar">
      {label || showPercent ? (
        <View style={styles.header}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          {showPercent ? <Text style={styles.percent}>{Math.round(clamped)}%</Text> : null}
        </View>
      ) : null}
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <LinearGradient
          colors={[...VARIANTS[variant]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${clamped}%`, borderRadius: height / 2 }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: GAME.space.xs },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: {
    color: GAME.textMuted,
    fontSize: GAME.type.caption,
    fontWeight: GAME.weight.bold,
    textTransform: "uppercase",
    letterSpacing: GAME.letterSpacing.wide,
  },
  percent: { color: GAME.text, fontSize: GAME.type.caption, fontWeight: GAME.weight.black },
  track: {
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  fill: { height: "100%" },
});
