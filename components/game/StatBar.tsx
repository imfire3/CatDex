import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { GAME } from "@/constants/game";

export function XpBar({ current, max, label }: { current: number; max: number; label?: string }) {
  const pct = Math.min(current / max, 1);

  const fillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${pct * 100}%`, { duration: 800 }),
  }));

  return (
    <View style={styles.wrap}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>
            {current} / {max} XP
          </Text>
        </View>
      ) : null}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
}

export function StatBar({ label, value, color = GAME.sky }: { label: string; value: number; color?: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statTrack}>
        <View style={[styles.statFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: GAME.space.xs },
  labelRow: { flexDirection: "row", justifyContent: "space-between" },
  label: { color: GAME.textMuted, fontSize: GAME.type.caption, fontWeight: "700" },
  value: { color: GAME.gold, fontSize: GAME.type.caption, fontWeight: "800" },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: GAME.gold,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: GAME.space.sm,
  },
  statLabel: {
    color: GAME.textMuted,
    fontSize: GAME.type.caption,
    fontWeight: "700",
    width: 72,
  },
  statTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  statFill: { height: "100%", borderRadius: 3 },
  statValue: {
    color: GAME.text,
    fontSize: GAME.type.caption,
    fontWeight: "800",
    width: 28,
    textAlign: "right",
  },
});
