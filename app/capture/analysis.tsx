import { useEffect } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2 } from "lucide-react-native";
import { FloatingButton } from "@/components/game/FloatingButton";
import { GlassCard } from "@/components/game/GlassCard";
import { GAME } from "@/constants/game";
import { useCaptureStore } from "@/stores";

export default function AnalysisScreen() {
  const router = useRouter();
  const { compressedUri, analysis } = useCaptureStore();

  useEffect(() => {
    if (!analysis) {
      router.replace("/capture");
    }
  }, [analysis, router]);

  if (!analysis) return null;

  const confidence = Math.round((analysis.confidence <= 1 ? analysis.confidence * 100 : analysis.confidence));

  return (
    <LinearGradient colors={[GAME.navy, "#0a1628"]} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInUp.springify()} style={styles.header}>
            <CheckCircle2 color={GAME.green} size={32} />
            <Text style={styles.title}>Chat détecté !</Text>
            <Text style={styles.confidence}>Confiance : {confidence}%</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()}>
            {compressedUri ? (
              <Image source={{ uri: compressedUri }} style={styles.photo} />
            ) : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.grid}>
            {[
              { label: "Race", value: analysis.breed },
              { label: "Couleur", value: analysis.color },
              { label: "Âge estimé", value: analysis.estimatedAge ?? "adulte" },
              { label: "Fourrure", value: analysis.furLength ?? "court" },
              { label: "Motif", value: analysis.pattern },
              { label: "Humeur", value: analysis.mood ?? "curieux" },
            ].map((item) => (
              <GlassCard key={item.label} style={styles.cell} padding={GAME.space.md}>
                <Text style={styles.cellLabel}>{item.label}</Text>
                <Text style={styles.cellValue}>{item.value}</Text>
              </GlassCard>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <GlassCard>
              <Text style={styles.traitsTitle}>Traits identifiés</Text>
              <View style={styles.traits}>
                {(analysis.traits ?? []).map((t) => (
                  <View key={t} style={styles.traitChip}>
                    <Text style={styles.traitText}>{t}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(650).springify()}>
            <FloatingButton
              label="Confirmer l'analyse"
              onPress={() => router.push("/capture/confirm")}
            />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: GAME.space.lg, paddingBottom: GAME.space.xxl, gap: GAME.space.lg },
  header: { alignItems: "center", gap: GAME.space.sm },
  title: { color: GAME.text, fontSize: GAME.type.title, fontWeight: "900" },
  confidence: { color: GAME.green, fontWeight: "800", fontSize: GAME.type.body },
  photo: {
    width: "100%",
    height: 240,
    borderRadius: GAME.radius.lg,
    borderWidth: 3,
    borderColor: GAME.sky,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GAME.space.sm },
  cell: { width: "47%", flexGrow: 1 },
  cellLabel: { color: GAME.textMuted, fontSize: GAME.type.caption, fontWeight: "700" },
  cellValue: { color: GAME.text, fontSize: GAME.type.body, fontWeight: "800", marginTop: 4 },
  traitsTitle: { color: GAME.textMuted, fontSize: GAME.type.caption, fontWeight: "800", marginBottom: GAME.space.sm },
  traits: { flexDirection: "row", flexWrap: "wrap", gap: GAME.space.sm },
  traitChip: {
    backgroundColor: "rgba(90,200,250,0.15)",
    paddingHorizontal: GAME.space.md,
    paddingVertical: GAME.space.xs,
    borderRadius: GAME.radius.full,
    borderWidth: 1,
    borderColor: GAME.sky,
  },
  traitText: { color: GAME.sky, fontWeight: "700", fontSize: GAME.type.caption },
});
