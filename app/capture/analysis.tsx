import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2 } from "lucide-react-native";
import { CatRevealStage } from "@/components/game/CatRevealStage";
import { FloatingButton } from "@/components/game/FloatingButton";
import { GlassCard } from "@/components/game/GlassCard";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TagChip } from "@/components/ui/TagChip";
import { GAME, TEXT } from "@/constants/game";
import { useCaptureStore } from "@/stores";
import type { CatModelId } from "@/gameplay/types";

export default function AnalysisScreen() {
  const router = useRouter();
  const { compressedUri, analysis } = useCaptureStore();

  useEffect(() => {
    if (!analysis) {
      router.replace("/capture");
    }
  }, [analysis, router]);

  if (!analysis) return null;

  const confidence = Math.round(
    analysis.confidence <= 1 ? analysis.confidence * 100 : analysis.confidence
  );

  return (
    <ScreenBackground variant="capture">
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInUp.springify()} style={styles.header}>
            <CheckCircle2 color={GAME.green} size={32} />
            <Text style={styles.title}>Chat détecté !</Text>
            <Text style={styles.confidence}>Confiance : {confidence}%</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <CatRevealStage
              modelId={(analysis.modelId as CatModelId | undefined) ?? "tabby_short"}
              photoUri={compressedUri}
              size={150}
            />
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
              <SectionLabel>Traits identifiés</SectionLabel>
              <View style={styles.traits}>
                {(analysis.traits ?? []).map((t) => (
                  <TagChip key={t} label={t} />
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
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: GAME.space.lg, paddingBottom: GAME.space.xxl, gap: GAME.space.lg },
  header: { alignItems: "center", gap: GAME.space.sm },
  title: { ...TEXT.title, textAlign: "center" },
  confidence: { color: GAME.green, fontWeight: GAME.weight.bold, fontSize: GAME.type.body },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GAME.space.sm },
  cell: { width: "47%", flexGrow: 1 },
  cellLabel: { ...TEXT.label, textTransform: "none", letterSpacing: 0 },
  cellValue: { ...TEXT.bodyStrong, marginTop: 4 },
  traits: { flexDirection: "row", flexWrap: "wrap", gap: GAME.space.sm, marginTop: GAME.space.sm },
});
