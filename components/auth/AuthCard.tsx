import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { AUTH, RADIUS, SPACE } from "@/constants/theme";

export function AuthCard({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AUTH.card,
    borderRadius: RADIUS.lg,
    padding: SPACE.md,
    gap: SPACE.sm,
    shadowColor: AUTH.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
