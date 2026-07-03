import type { ReactNode } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GAME } from "@/constants/game";

const LOGIN_BG = require("@/assets/login-bg.png");

export function AuthBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <ImageBackground source={LOGIN_BG} style={styles.background} resizeMode="cover">
        <LinearGradient
          colors={["rgba(13,27,42,0.55)", "rgba(13,27,42,0.82)", "rgba(13,27,42,0.96)"]}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.glow, styles.glowLeft]} />
        <View style={[styles.glow, styles.glowRight]} />
        {children}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GAME.navy },
  background: { flex: 1 },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.45,
  },
  glowLeft: { top: "18%", left: -60, backgroundColor: "rgba(90,200,250,0.35)" },
  glowRight: { top: "32%", right: -80, backgroundColor: "rgba(0,122,255,0.28)" },
});
