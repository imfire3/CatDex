import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Star } from "lucide-react-native";
import { FloatingButton } from "@/components/game/FloatingButton";
import { CatAvatar3D } from "@/components/game/CatAvatar3D";
import { GAME, GRADIENTS, RARITY_COLORS } from "@/constants/game";
import { useCaptureStore } from "@/stores";
import { GAME_BADGES } from "@/gameplay/badges/badge-definitions";
import type { CatModelId } from "@/gameplay/types";
import type { CatRarity } from "@/data/mock";

export default function CelebrationScreen() {
  const router = useRouter();
  const { discoveryResult, reset } = useCaptureStore();
  const params = useLocalSearchParams<{
    name?: string;
    catId?: string;
    breed?: string;
    rarity?: string;
    modelId?: string;
    xp?: string;
  }>();

  const displayName = params.name ?? "Nouveau chat";
  const totalXp = discoveryResult?.totalXp ?? Number(params.xp ?? 100);
  const modelId = (discoveryResult?.modelId ?? params.modelId ?? "tabby_short") as CatModelId;
  const rarity = (discoveryResult?.rarity ?? params.rarity ?? "commun") as CatRarity;
  const rarityColor = RARITY_COLORS[rarity];
  const unlockedBadges = discoveryResult?.unlockedBadges ?? [];
  const grants = discoveryResult?.grants ?? [];

  const scale = useSharedValue(0);
  const xpCount = useSharedValue(0);
  const flash = useSharedValue(0);

  useEffect(() => {
    flash.value = withSequence(
      withTiming(1, { duration: 120 }),
      withTiming(0, { duration: 400 })
    );
    scale.value = withDelay(200, withSpring(1, { damping: 8, stiffness: 120 }));
    xpCount.value = withDelay(500, withTiming(totalXp, { duration: 1200 }));
  }, [scale, xpCount, flash, totalXp]);

  const leave = (path: Href) => {
    reset();
    router.replace(path);
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const xpStyle = useAnimatedStyle(() => ({
    opacity: xpCount.value > 0 ? 1 : 0,
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value * 0.85,
  }));

  return (
    <LinearGradient colors={[...GRADIENTS.celebration]} style={styles.screen}>
      <Animated.View pointerEvents="none" style={[styles.flash, flashStyle]} />
      <SafeAreaView style={styles.safe}>
        {[...Array(20)].map((_, i) => (
          <Animated.Text
            key={i}
            entering={FadeIn.delay(i * 80)}
            style={[styles.confetti, { left: `${(i * 17) % 100}%`, top: `${(i * 23) % 60}%` }]}
          >
            {["✨", "⭐", "🎉", "🐾", "🎊"][i % 5]}
          </Animated.Text>
        ))}

        <View style={styles.content}>
          <Animated.Text entering={FadeInDown.springify()} style={styles.badge}>
            NOUVELLE DÉCOUVERTE
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(200).springify()} style={styles.title}>
            {displayName}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(350).springify()} style={styles.subtitle}>
            {params.breed ?? "Chat de rue"} · +{totalXp} XP
          </Animated.Text>

          <Animated.View style={[styles.cardWrap, cardStyle]}>
            <LinearGradient colors={[GAME.navy, GAME.indigo]} style={styles.card}>
              <CatAvatar3D modelId={modelId} size={100} />
              <Animated.View style={[styles.xpBadge, xpStyle]}>
                <Star color={GAME.gold} size={14} fill={GAME.gold} />
                <Text style={styles.xpText}>+{totalXp} XP</Text>
              </Animated.View>
            </LinearGradient>
          </Animated.View>

          {grants.length > 0 ? (
            <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.grants}>
              {grants.map((grant) => (
                <View key={grant.type} style={styles.grantChip}>
                  <Text style={styles.grantText}>
                    +{grant.amount} {grant.label}
                  </Text>
                </View>
              ))}
            </Animated.View>
          ) : null}

          {unlockedBadges.length > 0 ? (
            <Animated.View entering={ZoomIn.delay(900).springify()} style={styles.badgeUnlock}>
              {unlockedBadges.map((id) => {
                const badge = GAME_BADGES.find((b) => b.id === id);
                return badge ? (
                  <Text key={id} style={styles.badgeUnlockText}>
                    {badge.emoji} Badge débloqué : {badge.title}
                  </Text>
                ) : null;
              })}
            </Animated.View>
          ) : null}

          {discoveryResult?.leveledUp ? (
            <Animated.View entering={ZoomIn.delay(1000).springify()} style={styles.levelUp}>
              <Text style={styles.levelUpText}>Niveau {discoveryResult.newLevel} !</Text>
            </Animated.View>
          ) : null}

          <Animated.View entering={ZoomIn.delay(800).springify()} style={[styles.rarity, { borderColor: rarityColor }]}>
            <Text style={[styles.rarityText, { color: rarityColor }]}>★ {rarity} ★</Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(1000).springify()} style={styles.footer}>
          <FloatingButton
            label="Voir la fiche"
            variant="glass"
            onPress={() =>
              leave(params.catId ? `/cat/${params.catId}` : "/(tabs)/chatdex")
            }
          />
          <FloatingButton
            label="Retour à la carte"
            onPress={() => leave("/(tabs)/map")}
            style={styles.secondaryBtn}
          />
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    zIndex: 10,
  },
  safe: { flex: 1, justifyContent: "space-between", padding: GAME.space.lg },
  confetti: { position: "absolute", fontSize: 24, opacity: 0.7 },
  content: { alignItems: "center", flex: 1, justifyContent: "center", gap: GAME.space.sm },
  badge: {
    color: GAME.navy,
    fontWeight: "900",
    fontSize: GAME.type.caption,
    letterSpacing: 2,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: GAME.space.md,
    paddingVertical: GAME.space.xs,
    borderRadius: GAME.radius.full,
  },
  title: {
    color: GAME.text,
    fontSize: GAME.type.hero,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: { color: "rgba(255,255,255,0.85)", fontSize: GAME.type.body, fontWeight: "700" },
  cardWrap: { marginVertical: GAME.space.lg },
  card: {
    width: 200,
    height: 240,
    borderRadius: GAME.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: GAME.gold,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: GAME.space.md,
    backgroundColor: "rgba(255,204,0,0.2)",
    paddingHorizontal: GAME.space.md,
    paddingVertical: GAME.space.xs,
    borderRadius: GAME.radius.full,
  },
  xpText: { color: GAME.gold, fontWeight: "900", fontSize: GAME.type.caption },
  grants: { flexDirection: "row", flexWrap: "wrap", gap: GAME.space.xs, justifyContent: "center" },
  grantChip: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: GAME.space.sm,
    paddingVertical: 4,
    borderRadius: GAME.radius.full,
  },
  grantText: { color: GAME.text, fontWeight: "700", fontSize: 11 },
  badgeUnlock: { alignItems: "center", gap: 4 },
  badgeUnlockText: { color: GAME.gold, fontWeight: "900", fontSize: GAME.type.caption },
  levelUp: {
    backgroundColor: "rgba(52,199,89,0.25)",
    paddingHorizontal: GAME.space.lg,
    paddingVertical: GAME.space.sm,
    borderRadius: GAME.radius.full,
  },
  levelUpText: { color: GAME.green, fontWeight: "900" },
  rarity: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: GAME.space.lg,
    paddingVertical: GAME.space.sm,
    borderRadius: GAME.radius.full,
    borderWidth: 1,
  },
  rarityText: { fontWeight: "900", fontSize: GAME.type.body, textTransform: "capitalize" },
  footer: { gap: GAME.space.md },
  secondaryBtn: { opacity: 0.9 },
});
