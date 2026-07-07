import type { ReactNode } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GAME, GRADIENTS } from "@/constants/game";

type ScreenBackgroundProps = ViewProps & {
  children: ReactNode;
  variant?: "screen" | "profile" | "capture" | "welcome" | "celebration";
  withOrbs?: boolean;
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
  withOrbs = true,
  style,
  ...props
}: ScreenBackgroundProps) {
  return (
    <LinearGradient colors={[...VARIANTS[variant]]} style={[styles.root, style]} {...props}>
      {withOrbs ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View style={[styles.orb, styles.orbSky]} />
          <View style={[styles.orb, styles.orbGold]} />
        </View>
      ) : null}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GAME.navy },
  orb: {
    position: "absolute",
    width: 192,
    height: 192,
    borderRadius: 96,
    opacity: 0.16,
  },
  orbSky: {
    top: -64,
    right: -56,
    backgroundColor: GAME.sky,
  },
  orbGold: {
    bottom: 96,
    left: -72,
    backgroundColor: GAME.gold,
  },
});
