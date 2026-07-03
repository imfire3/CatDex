import { Pressable, StyleSheet, Text, View } from "react-native";
import { GAME, ELEVATION } from "@/constants/game";

type EmptyStateProps = {
  emoji?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  emoji = "🐾",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconRing}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable
          style={styles.action}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
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
    paddingHorizontal: GAME.space.xl,
    paddingVertical: GAME.space.xxl,
    gap: GAME.space.sm,
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: GAME.glass,
    borderWidth: 1,
    borderColor: GAME.glassBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: GAME.space.sm,
    ...ELEVATION.sm,
  },
  emoji: { fontSize: 40 },
  title: {
    color: GAME.text,
    fontSize: GAME.type.subtitle,
    fontWeight: "900",
    textAlign: "center",
  },
  description: {
    color: GAME.textMuted,
    fontSize: GAME.type.body,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
  action: {
    marginTop: GAME.space.md,
    backgroundColor: GAME.sky,
    paddingHorizontal: GAME.space.lg,
    paddingVertical: GAME.space.sm,
    borderRadius: GAME.radius.full,
    minHeight: 44,
    justifyContent: "center",
  },
  actionText: {
    color: GAME.navy,
    fontWeight: "900",
    fontSize: GAME.type.body,
  },
});
