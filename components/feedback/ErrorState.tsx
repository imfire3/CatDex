import { Pressable, StyleSheet, Text, View } from "react-native";
import { AlertCircle } from "lucide-react-native";
import { GAME } from "@/constants/game";

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Oups",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.wrap}>
      <AlertCircle color={GAME.gold} size={40} strokeWidth={2} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable
          style={styles.retry}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Réessayer"
        >
          <Text style={styles.retryText}>Réessayer</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: GAME.space.xl,
    gap: GAME.space.sm,
  },
  title: {
    color: GAME.text,
    fontSize: GAME.type.subtitle,
    fontWeight: "900",
  },
  message: {
    color: GAME.textMuted,
    fontSize: GAME.type.body,
    textAlign: "center",
    lineHeight: 22,
  },
  retry: {
    marginTop: GAME.space.md,
    paddingHorizontal: GAME.space.lg,
    paddingVertical: GAME.space.sm,
    borderRadius: GAME.radius.full,
    borderWidth: 2,
    borderColor: GAME.sky,
    minHeight: 44,
    justifyContent: "center",
  },
  retryText: {
    color: GAME.sky,
    fontWeight: "800",
    fontSize: GAME.type.body,
  },
});
