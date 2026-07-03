import { Pressable, StyleSheet, Text, View } from "react-native";
import { Flame } from "lucide-react-native";
import { GAME } from "@/constants/game";
import { nextStreakMilestone } from "@/gameplay/retention/daily-bonus";

type StreakPillProps = {
  streak: number;
  onPress?: () => void;
  compact?: boolean;
};

export function StreakPill({ streak, onPress, compact }: StreakPillProps) {
  const milestone = nextStreakMilestone(streak);
  const active = streak > 0;

  return (
    <Pressable
      style={[styles.pill, active && styles.pillActive, compact && styles.pillCompact]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Série de ${streak} jour${streak > 1 ? "s" : ""}`}
    >
      <Flame color={active ? GAME.gold : GAME.textDim} size={compact ? 14 : 16} fill={active ? GAME.gold : "transparent"} />
      <Text style={[styles.count, active && styles.countActive]}>{streak}</Text>
      {!compact && milestone ? (
        <Text style={styles.hint}>· {milestone.days}j → {milestone.reward}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: GAME.radius.full,
    paddingHorizontal: GAME.space.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: GAME.glassBorder,
  },
  pillActive: {
    backgroundColor: "rgba(255,204,0,0.15)",
    borderColor: "rgba(255,204,0,0.45)",
  },
  pillCompact: { paddingHorizontal: 8, paddingVertical: 4 },
  count: { color: GAME.textDim, fontWeight: "900", fontSize: 13 },
  countActive: { color: GAME.gold },
  hint: { color: GAME.textMuted, fontSize: 10, fontWeight: "600", maxWidth: 120 },
});
