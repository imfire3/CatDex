import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import { GAME, ELEVATION } from "@/constants/game";

type ChipProps = PressableProps & {
  label: string;
  selected?: boolean;
};

export function Chip({ label, selected = false, style, ...props }: ChipProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
        typeof style === "function" ? style({ pressed, hovered: false }) : style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      {...props}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: GAME.space.md,
    paddingVertical: GAME.space.xs,
    minHeight: 36,
    borderRadius: GAME.radius.full,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: GAME.glassBorder,
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: "rgba(90,200,250,0.2)",
    borderColor: GAME.sky,
  },
  chipPressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  text: {
    color: GAME.textMuted,
    fontSize: GAME.type.caption,
    fontWeight: GAME.weight.bold,
  },
  textSelected: { color: GAME.sky },
});
