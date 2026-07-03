import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GAME } from "@/constants/game";

type LoadingViewProps = {
  label?: string;
  fullScreen?: boolean;
};

export function LoadingView({ label = "Chargement…", fullScreen = false }: LoadingViewProps) {
  return (
    <View style={[styles.wrap, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={GAME.sky} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: GAME.space.md,
    padding: GAME.space.xl,
  },
  fullScreen: { flex: 1, backgroundColor: GAME.navy },
  label: {
    color: GAME.textMuted,
    fontSize: GAME.type.body,
    fontWeight: "600",
  },
});
