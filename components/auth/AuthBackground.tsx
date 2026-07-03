import type { ReactNode } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AUTH } from "@/constants/theme";

const LOGIN_BG = require("@/assets/login-bg.png");

export function AuthBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <ImageBackground source={LOGIN_BG} style={styles.background} resizeMode="cover">
        <LinearGradient
          colors={["rgba(6,10,22,0.55)", "rgba(6,10,22,0.78)", "rgba(6,10,22,0.94)"]}
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
  root: {
    flex: 1,
    backgroundColor: AUTH.bg,
  },
  background: {
    flex: 1,
  },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.55,
  },
  glowLeft: {
    top: "18%",
    left: -60,
    backgroundColor: AUTH.glowCyan,
  },
  glowRight: {
    top: "32%",
    right: -80,
    backgroundColor: AUTH.glowBlue,
  },
});
