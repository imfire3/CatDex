import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";
import { GAME, GRADIENTS } from "@/constants/game";
import { useAuthGate } from "@/hooks/useAuthGate";

export default function SplashScreenRoute() {
  const pulse = useSharedValue(1);
  useAuthGate();

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      true
    );
    SplashScreen.hideAsync().catch(() => undefined);
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <LinearGradient colors={[...GRADIENTS.splash]} style={styles.screen}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
        <Animated.View style={[styles.ring, ringStyle]}>
          <Text style={styles.emoji}>🐱</Text>
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(400).duration(500)} style={styles.title}>
          CatDex
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(600).duration(500)} style={styles.subtitle}>
          Découvre les chats de ta ville
        </Animated.Text>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(1000)} style={styles.footer}>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.dot} />
          ))}
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { alignItems: "center" },
  ring: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 3,
    borderColor: GAME.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: GAME.space.lg,
    shadowColor: GAME.sky,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
  },
  emoji: { fontSize: 56 },
  title: {
    color: GAME.text,
    fontSize: GAME.type.display,
    fontWeight: "900",
    letterSpacing: 2,
  },
  subtitle: {
    color: GAME.textMuted,
    fontSize: GAME.type.body,
    fontWeight: "600",
    marginTop: GAME.space.sm,
    textAlign: "center",
  },
  footer: { position: "absolute", bottom: 60 },
  dots: { flexDirection: "row", gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
});
