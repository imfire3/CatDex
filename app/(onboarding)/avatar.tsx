import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FloatingButton } from "@/components/game/FloatingButton";
import { ProgressDots } from "@/components/game/ProgressDots";
import { GAME, GRADIENTS } from "@/constants/game";
import { AVATAR_OPTIONS } from "@/data/mock";
import { useUI } from "@/providers/UIProvider";

export default function AvatarScreen() {
  const router = useRouter();
  const { avatar, setAvatar } = useUI();
  const [selected, setSelected] = useState(avatar);

  return (
    <LinearGradient colors={[...GRADIENTS.welcome]} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ProgressDots total={4} current={2} />

        <Animated.Text entering={FadeInDown.delay(200).springify()} style={styles.title}>
          Choisis ton avatar
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(300).springify()} style={styles.subtitle}>
          Ton style de chasseur se reflète dans toute la communauté.
        </Animated.Text>

        <Animated.View entering={ZoomIn.delay(400).springify()} style={styles.preview}>
          <LinearGradient colors={[GAME.sky, GAME.indigo]} style={styles.previewRing}>
            <Text style={styles.previewEmoji}>{selected}</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.grid}>
          {AVATAR_OPTIONS.map((emoji) => {
            const active = selected === emoji;
            return (
              <Pressable
                key={emoji}
                style={[styles.cell, active && styles.cellActive]}
                onPress={() => setSelected(emoji)}
              >
                <Text style={styles.cellEmoji}>{emoji}</Text>
              </Pressable>
            );
          })}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.footer}>
          <FloatingButton
            label="Continuer"
            onPress={() => {
              setAvatar(selected);
              router.push("/(onboarding)/username");
            }}
          />
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: GAME.space.lg,
    paddingTop: GAME.space.lg,
    paddingBottom: GAME.space.lg,
  },
  title: {
    color: GAME.text,
    fontSize: GAME.type.title,
    fontWeight: "900",
    textAlign: "center",
    marginTop: GAME.space.xl,
  },
  subtitle: {
    color: GAME.textMuted,
    fontSize: GAME.type.body,
    textAlign: "center",
    marginTop: GAME.space.sm,
    marginBottom: GAME.space.lg,
  },
  preview: { alignItems: "center", marginBottom: GAME.space.xl },
  previewRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.5)",
    shadowColor: GAME.sky,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  previewEmoji: { fontSize: 56 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAME.space.sm,
    justifyContent: "center",
    flex: 1,
    alignContent: "flex-start",
  },
  cell: {
    width: 72,
    height: 72,
    borderRadius: GAME.radius.md,
    backgroundColor: GAME.glass,
    borderWidth: 2,
    borderColor: GAME.glassBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  cellActive: {
    borderColor: GAME.sky,
    backgroundColor: "rgba(90,200,250,0.2)",
    transform: [{ scale: 1.05 }],
  },
  cellEmoji: { fontSize: 32 },
  footer: { marginTop: GAME.space.lg },
});
