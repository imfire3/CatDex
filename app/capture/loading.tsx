import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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
import { ErrorState } from "@/components/feedback";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { GAME, TEXT } from "@/constants/game";
import { gameplayService } from "@/services/gameplay.service";
import { useCaptureStore } from "@/stores";
import { useReduceMotion } from "@/hooks/useReduceMotion";

const STEPS = [
  "Analyse de l'image...",
  "Détection féline...",
  "Identification de la race...",
  "Analyse des traits...",
];

export default function LoadingScreen() {
  const router = useRouter();
  const reduceMotion = useReduceMotion();
  const rotation = useSharedValue(0);
  const [failed, setFailed] = useState(false);
  const { compressedUri, setAnalysis } = useCaptureStore();

  useEffect(() => {
    if (reduceMotion) return;
    rotation.value = withRepeat(withTiming(360, { duration: 2000, easing: Easing.linear }), -1);
  }, [rotation, reduceMotion]);

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
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [compressedUri, router, setAnalysis]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (failed) {
    return (
      <ScreenBackground variant="capture">
        <SafeAreaView style={styles.safe}>
          <ErrorState
            title="Analyse impossible"
            message="L'IA n'a pas pu analyser cette photo. Réessaie avec une image plus nette."
            onRetry={() => router.replace("/capture")}
          />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground variant="capture">
      <SafeAreaView style={styles.safe}>
        <Animated.View entering={FadeIn} style={styles.center}>
          <Animated.View style={[styles.ring, !reduceMotion && spinStyle]}>
            <View style={styles.ringInner} />
          </Animated.View>
          <View style={styles.iconCenter}>
            <Sparkles color={GAME.gold} size={36} strokeWidth={2} />
          </View>
          <Text style={styles.title}>Analyse IA</Text>
          <Text style={styles.subtitle}>Identification du chat en cours</Text>

          <ProgressBar progress={85} variant="sky" style={styles.progress} />

          <View style={styles.steps}>
            {STEPS.map((step, i) => (
              <Animated.Text key={step} entering={FadeIn.delay(400 + i * 400)} style={styles.step}>
                {step}
              </Animated.Text>
            ))}
          </View>
        </Animated.View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, justifyContent: "center" },
  center: { alignItems: "center", paddingHorizontal: GAME.space.xl },
  ring: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: GAME.sky,
    borderTopColor: GAME.purple,
    padding: 4,
  },
  ringInner: { flex: 1, borderRadius: 56, backgroundColor: "transparent" },
  iconCenter: { position: "absolute", top: 42, alignSelf: "center" },
  title: { ...TEXT.title, marginTop: GAME.space.xl, textAlign: "center" },
  subtitle: { ...TEXT.caption, marginTop: GAME.space.sm, marginBottom: GAME.space.xl, textAlign: "center" },
  progress: { width: "100%", marginBottom: GAME.space.xl },
  steps: { gap: GAME.space.sm, alignSelf: "stretch" },
  step: { ...TEXT.caption, textAlign: "center" },
});
