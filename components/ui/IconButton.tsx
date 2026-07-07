import { Pressable, StyleSheet, type PressableProps } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { GAME, ELEVATION } from "@/constants/game";

type IconButtonProps = PressableProps & {
  icon: LucideIcon;
  size?: number;
  iconSize?: number;
  variant?: "glass" | "dark" | "light";
  color?: string;
  accessibilityLabel: string;
};

export function IconButton({
  icon: Icon,
  size = 44,
  iconSize = 22,
  variant = "glass",
  color = GAME.text,
  style,
  accessibilityLabel,
  ...props
}: IconButtonProps) {
  const bg =
    variant === "dark"
      ? "rgba(0,0,0,0.45)"
      : variant === "light"
        ? "rgba(255,255,255,0.92)"
        : GAME.glass;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        ELEVATION.sm,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
        typeof style === "function" ? style({ pressed }) : style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      {...props}
    >
      <Icon color={color} size={iconSize} strokeWidth={2.5} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: GAME.glassBorder,
  },
});
