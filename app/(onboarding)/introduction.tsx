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
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FloatingButton } from "@/components/game/FloatingButton";
import { GlassCard } from "@/components/game/GlassCard";
import { ProgressDots } from "@/components/game/ProgressDots";
import { GAME, GRADIENTS } from "@/constants/game";

const MOUSTACHE_LINES = [
  "Salut, je suis Moustache ! 🐱",
  "Je garde les chats du Marais depuis des années.",
  "Je vais t'apprendre à les observer sans les déranger.",
  "Prêt à devenir un vrai chasseur de chats ?",
];

export default function IntroductionScreen() {
  const router = useRouter();
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(withTiming(-8, { duration: 600 }), withTiming(0, { duration: 600 })),
      -1,
      true
    );
  }, [bounce]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <LinearGradient colors={[...GRADIENTS.welcome]} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ProgressDots total={4} current={1} />

        <View style={styles.hero}>
          <Animated.View entering={FadeIn.delay(200)} style={styles.glow} />
          <Animated.Text style={[styles.mascot, mascotStyle]}>😺</Animated.Text>
          <Animated.Text entering={FadeInDown.delay(400).springify()} style={styles.mascotName}>
            Moustache
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(500).springify()} style={styles.mascotRole}>
            Gardien du Marais · Chat légendaire
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(650).springify()} style={styles.speechWrap}>
            <GlassCard padding={GAME.space.lg}>
              {MOUSTACHE_LINES.map((line, i) => (
                <Text key={line} style={[styles.speechLine, i > 0 && styles.speechGap]}>
                  {line}
                </Text>
              ))}
            </GlassCard>
            <View style={styles.speechTail} />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(900).springify()} style={styles.footer}>
          <FloatingButton
            label="Enchanté, Moustache !"
            onPress={() => router.push("/(onboarding)/avatar")}
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
    justifyContent: "space-between",
    paddingBottom: GAME.space.lg,
  },
  hero: { flex: 1, alignItems: "center", justifyContent: "center" },
  glow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,204,0,0.2)",
    top: "8%",
  },
  mascot: { fontSize: 96 },
  mascotName: {
    color: GAME.gold,
    fontSize: GAME.type.title,
    fontWeight: "900",
    marginTop: GAME.space.sm,
  },
  mascotRole: {
    color: GAME.textMuted,
    fontSize: GAME.type.caption,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: GAME.space.lg,
  },
  speechWrap: { alignSelf: "stretch", position: "relative" },
  speechLine: {
    color: GAME.text,
    fontSize: GAME.type.body,
    lineHeight: 24,
    fontWeight: "600",
  },
  speechGap: { marginTop: GAME.space.sm },
  speechTail: {
    position: "absolute",
    top: -10,
    left: "50%",
    marginLeft: -10,
    width: 20,
    height: 20,
    backgroundColor: GAME.glass,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: GAME.glassBorder,
    transform: [{ rotate: "45deg" }],
  },
  footer: { paddingTop: GAME.space.md },
});
