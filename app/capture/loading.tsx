import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sparkles } from "lucide-react-native";
import { GAME } from "@/constants/game";
import { gameplayService } from "@/services/gameplay.service";
import { useCaptureStore } from "@/stores";

const STEPS = [
  "Analyse de l'image...",
  "Détection féline...",
  "Identification de la race...",
  "Analyse des traits...",
];

export default function LoadingScreen() {
  const router = useRouter();
  const rotation = useSharedValue(0);
  const progress = useSharedValue(0);
  const { compressedUri, setAnalysis } = useCaptureStore();

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 2000, easing: Easing.linear }), -1);
    progress.value = withTiming(1, { duration: 2800 });
  }, [rotation, progress]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!compressedUri) {
        if (!cancelled) router.replace("/capture");
        return;
      }

      try {
        const analysis = await gameplayService.analyzePhoto(compressedUri);
        if (cancelled) return;

        setAnalysis({
          color: analysis.color,
          breed: analysis.breed,
          pattern: analysis.pattern,
          confidence: analysis.confidence,
          suggestedName: analysis.suggestedName,
          mood: analysis.mood,
          traits: analysis.traits,
          modelId: analysis.modelId,
          estimatedAge: analysis.estimatedAge,
          furLength: analysis.furLength,
          rarity: analysis.rarity,
        });
        router.replace("/capture/analysis");
      } catch {
        if (!cancelled) {
          router.replace("/capture");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [compressedUri, router, setAnalysis]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <LinearGradient colors={[GAME.navy, GAME.indigo]} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <Animated.View entering={FadeIn} style={styles.center}>
          <Animated.View style={[styles.ring, spinStyle]}>
            <LinearGradient colors={[GAME.sky, GAME.purple]} style={styles.ringGradient} />
          </Animated.View>
          <View style={styles.iconCenter}>
            <Sparkles color={GAME.gold} size={36} strokeWidth={2} />
          </View>
          <Text style={styles.title}>Analyse IA</Text>
          <Text style={styles.subtitle}>Identification du chat en cours</Text>

          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>

          <View style={styles.steps}>
            {STEPS.map((step, i) => (
              <Animated.Text key={step} entering={FadeIn.delay(400 + i * 400)} style={styles.step}>
                {step}
              </Animated.Text>
            ))}
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1, justifyContent: "center" },
  center: { alignItems: "center", paddingHorizontal: GAME.space.xl },
  ring: { width: 120, height: 120, borderRadius: 60, padding: 4 },
  ringGradient: { flex: 1, borderRadius: 56, opacity: 0.8 },
  iconCenter: { position: "absolute", top: 42, alignSelf: "center" },
  title: { color: GAME.text, fontSize: GAME.type.title, fontWeight: "900", marginTop: GAME.space.xl },
  subtitle: { color: GAME.textMuted, fontSize: GAME.type.body, marginTop: GAME.space.sm, marginBottom: GAME.space.xl },
  progressTrack: { width: "100%", height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden", marginBottom: GAME.space.xl },
  progressFill: { height: "100%", backgroundColor: GAME.sky, borderRadius: 3 },
  steps: { gap: GAME.space.sm, alignSelf: "stretch" },
  step: { color: GAME.textMuted, fontSize: GAME.type.caption, fontWeight: "600", textAlign: "center" },
});
