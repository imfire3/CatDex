import { StyleSheet, Text, View } from "react-native";
import { GAME } from "@/constants/game";

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];

export function StreakWeek({ streak }: { streak: number }) {
  const today = new Date().getDay();
  const mondayBased = today === 0 ? 6 : today - 1;
  const filled = Math.min(streak, 7);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Série cette semaine</Text>
      <View style={styles.row}>
        {DAYS.map((day, i) => {
          const isToday = i === mondayBased;
          const isDone = i < filled || (isToday && streak > 0);
          return (
            <View key={`${day}-${i}`} style={styles.dayCol}>
              <View
                style={[
                  styles.dot,
                  isDone && styles.dotDone,
                  isToday && styles.dotToday,
                ]}
              >
                {isDone ? <Text style={styles.check}>✓</Text> : null}
              </View>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{day}</Text>
            </View>
          );
        })}
      </View>
      {streak > 0 ? (
        <Text style={styles.freezeHint}>🛡️ 1 protection de série par semaine si tu rates un jour</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: GAME.space.sm },
  label: { color: GAME.textMuted, fontSize: GAME.type.caption, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  dayCol: { alignItems: "center", gap: 4 },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 2,
    borderColor: GAME.glassBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  dotDone: { backgroundColor: "rgba(255,204,0,0.2)", borderColor: GAME.gold },
  dotToday: { borderColor: GAME.sky, borderWidth: 2 },
  check: { color: GAME.gold, fontWeight: "900", fontSize: 12 },
  dayLabel: { color: GAME.textDim, fontSize: 10, fontWeight: "700" },
  dayLabelToday: { color: GAME.sky },
  freezeHint: { color: GAME.textMuted, fontSize: 11, fontWeight: "600", textAlign: "center" },
});
