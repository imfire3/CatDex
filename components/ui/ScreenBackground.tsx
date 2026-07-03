import type { ReactNode } from "react";
import { StyleSheet, type ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GAME, GRADIENTS } from "@/constants/game";

type ScreenBackgroundProps = ViewProps & {
  children: ReactNode;
  variant?: "screen" | "profile" | "capture" | "welcome" | "celebration";
};

const VARIANTS = {
  screen: GRADIENTS.screen,
  profile: GRADIENTS.profile,
  capture: GRADIENTS.capture,
  welcome: GRADIENTS.welcome,
  celebration: GRADIENTS.celebration,
} as const;

export function ScreenBackground({
  children,
  variant = "screen",
  style,
  ...props
}: ScreenBackgroundProps) {
  return (
    <LinearGradient colors={[...VARIANTS[variant]]} style={[styles.root, style]} {...props}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GAME.navy },
});
