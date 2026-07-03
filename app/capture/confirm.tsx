import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View, Alert } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/game/ScreenHeader";
import { FloatingButton } from "@/components/game/FloatingButton";
import { GlassCard } from "@/components/game/GlassCard";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { GameTextField } from "@/components/ui/GameTextField";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GAME, TEXT } from "@/constants/game";
import { fetchProfile } from "@/lib/auth";
import { catsService } from "@/services/cats.service";
import { gameplayService } from "@/services/gameplay.service";
import { mapService } from "@/services/map.service";
import { syncService } from "@/services/sync.service";
import { queryClient } from "@/providers/QueryProvider";
import { queryKeys } from "@/constants/queryKeys";
import { useCaptureStore } from "@/stores";
import { useAuth } from "@/providers/AuthProvider";
import { useRetention } from "@/hooks/useRetention";
import type { Profile } from "@/types/database";

export default function ConfirmScreen() {
  const router = useRouter();
  const { session, profile: authProfile, refreshProfile } = useAuth();
  const retention = useRetention();
  const {
    compressedUri,
    analysis,
    catName,
    note,
    setCatName,
    setNote,
    setDiscoveryResult,
    latitude,
    longitude,
    zoneId,
  } = useCaptureStore();
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!session?.user.id || !compressedUri || !analysis || !zoneId || latitude == null || longitude == null) {
      Alert.alert("Données incomplètes", "Reprends la capture depuis la caméra.");
      return;
    }

    setSaving(true);
    try {
      let activeProfile: Profile | null = authProfile;
      if (!activeProfile) {
        await refreshProfile();
        activeProfile = await fetchProfile(session.user.id);
      }
      if (!activeProfile) {
        Alert.alert("Profil indisponible", "Impossible de charger ton profil. Réessaie dans un instant.");
        return;
      }

      const input = {
        name: catName || analysis.suggestedName,
        zoneId,
        color: analysis.color,
        breed: analysis.breed,
        pattern: analysis.pattern,
        photoUri: compressedUri,
        lat: latitude,
        lng: longitude,
        note,
        modelId: analysis.modelId,
        estimatedAge: analysis.estimatedAge,
        furLength: analysis.furLength,
        rarity: analysis.rarity,
      };

      try {
        const cat = await catsService.createFromCapture(input);

        const discovery = await gameplayService.processDiscovery({
          profile: activeProfile,
          zoneId,
          isFirstDiscoverer: true,
          analysis: {
            color: analysis.color,
            breed: analysis.breed,
            pattern: analysis.pattern,
            estimatedAge: (analysis.estimatedAge as "chaton" | "jeune" | "adulte" | "senior") ?? "adulte",
            furLength: (analysis.furLength as "court" | "mi-long" | "long") ?? "court",
            confidence: analysis.confidence,
            suggestedName: analysis.suggestedName,
            mood: analysis.mood ?? "curieux",
            traits: analysis.traits ?? [],
            modelId: (analysis.modelId as import("@/gameplay/types").CatModelId) ?? "tabby_short",
            rarity: (analysis.rarity as import("@/data/mock").CatRarity) ?? "commun",
          },
        });
        setDiscoveryResult(discovery);
        retention.refresh();

        if (note) {
          await catsService.addObservation({
            catId: cat.id,
            userId: session.user.id,
            note,
          });
        }

        mapService.clearCache();
        queryClient.invalidateQueries({ queryKey: queryKeys.cats });
        queryClient.invalidateQueries({ queryKey: queryKeys.captures(session.user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.profile(session.user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.userBadges(session.user.id) });

        router.push({
          pathname: "/capture/celebration",
          params: {
            name: input.name,
            catId: cat.id,
            breed: analysis.breed,
            zone: zoneId,
            rarity: analysis.rarity ?? "commun",
            modelId: analysis.modelId ?? "tabby_short",
            xp: String(discovery.totalXp),
          },
        });
      } catch (error) {
        if ((error as Error).message === "EXISTING_CAT") {
          Alert.alert("Chat déjà connu", "Ce chat existe déjà dans cette zone.");
          return;
        }
        syncService.enqueue({ type: "create_cat", payload: input });
        Alert.alert(
          "Enregistré hors ligne",
          "La photo sera synchronisée dès que la connexion reviendra.",
          [{ text: "OK", onPress: () => router.replace("/(tabs)/map") }]
        );
      }
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!analysis || !compressedUri) {
    return (
      <ScreenBackground variant="capture">
        <ScreenHeader title="Confirmation" />
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <View style={styles.missing}>
            <Text style={styles.missingText}>Données de capture manquantes.</Text>
            <FloatingButton label="Reprendre la capture" onPress={() => router.replace("/capture")} />
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground variant="capture">
      <ScreenHeader title="Confirmation" subtitle="Valide la fiche du chat" />
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.springify()}>
            <Image source={{ uri: compressedUri }} style={styles.photo} accessibilityLabel="Photo capturée" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <GlassCard>
              <GameTextField label="Nom du chat" value={catName} onChangeText={setCatName} />
              <GameTextField
                label="Note d'observation"
                value={note}
                onChangeText={setNote}
                multiline
                placeholder="Comportement, contexte…"
              />
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <GlassCard>
              <SectionLabel>Résumé IA</SectionLabel>
              {[
                { label: "Race", value: analysis.breed },
                { label: "Couleur", value: analysis.color },
                { label: "Âge", value: analysis.estimatedAge ?? "adulte" },
                { label: "Fourrure", value: analysis.furLength ?? "court" },
                { label: "Motif", value: analysis.pattern },
              ].map((row) => (
                <View key={row.label} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{row.label}</Text>
                  <Text style={styles.summaryValue}>{row.value}</Text>
                </View>
              ))}
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(450).springify()}>
            <FloatingButton
              label={saving ? "Enregistrement..." : "Ajouter au ChatDex"}
              onPress={submit}
              disabled={saving}
              accessibilityLabel="Ajouter au ChatDex"
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
  photo: { width: "100%", height: 200, borderRadius: GAME.radius.lg },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: GAME.space.sm,
    borderBottomWidth: 1,
    borderBottomColor: GAME.glassBorder,
  },
  summaryLabel: { ...TEXT.caption, color: GAME.textMuted },
  summaryValue: { ...TEXT.bodyStrong },
  missing: { flex: 1, justifyContent: "center", padding: GAME.space.lg, gap: GAME.space.lg },
  missingText: { ...TEXT.body, textAlign: "center", color: GAME.textMuted },
});
