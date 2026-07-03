import { StyleSheet, View } from "react-native";
import { GAME } from "@/constants/game";

export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i === current && styles.dotActive, i < current && styles.dotDone]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: GAME.space.xs,
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dotActive: {
    width: 24,
    backgroundColor: GAME.sky,
  },
  dotDone: {
    backgroundColor: GAME.sky,
    opacity: 0.5,
  },
});
