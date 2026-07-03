import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInRight, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useEffect } from "react";
import { Camera, ChevronRight, Target } from "lucide-react-native";
import { GlassCard } from "@/components/game/GlassCard";
import { GAME } from "@/constants/game";

type DailyGoalsCardProps = {
  unclaimedMissions: number;
  undiscoveredNearby: number;
  firstDiscoveryBonus: boolean;
  onCapture: () => void;
  onMissions: () => void;
};

export function DailyGoalsCard({
  unclaimedMissions,
  undiscoveredNearby,
  firstDiscoveryBonus,
  onCapture,
  onMissions,
}: DailyGoalsCardProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (undiscoveredNearby > 0) {
      pulse.value = withRepeat(withTiming(1.03, { duration: 1200 }), -1, true);
    }
  }, [undiscoveredNearby, pulse]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const goals = [
    firstDiscoveryBonus
      ? { icon: "✨", text: "Première découverte du jour : +100 XP bonus", done: false }
      : null,
    undiscoveredNearby > 0
      ? { icon: "🐱", text: `${undiscoveredNearby} chat${undiscoveredNearby > 1 ? "s" : ""} à photographier`, done: false }
      : null,
    unclaimedMissions > 0
      ? { icon: "🎁", text: `${unclaimedMissions} mission${unclaimedMissions > 1 ? "s" : ""} à réclamer`, done: false }
      : null,
  ].filter(Boolean) as { icon: string; text: string; done: boolean }[];

  if (goals.length === 0) return null;

  return (
    <Animated.View entering={FadeInRight.springify()} style={animStyle}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <Target color={GAME.sky} size={16} />
          <Text style={styles.headerText}>Objectifs du jour</Text>
        </View>
        {goals.map((g) => (
          <Text key={g.text} style={styles.goalLine}>
            {g.icon} {g.text}
          </Text>
        ))}
        <View style={styles.actions}>
          {undiscoveredNearby > 0 ? (
            <Pressable style={styles.cta} onPress={onCapture} accessibilityRole="button" accessibilityLabel="Photographier un chat">
              <Camera color={GAME.navy} size={16} />
              <Text style={styles.ctaText}>Photographier</Text>
            </Pressable>
          ) : null}
          {unclaimedMissions > 0 ? (
            <Pressable style={[styles.cta, styles.ctaSecondary]} onPress={onMissions} accessibilityRole="button" accessibilityLabel="Réclamer les missions">
              <Text style={styles.ctaTextSecondary}>Réclamer</Text>
              <ChevronRight color={GAME.sky} size={16} />
            </Pressable>
          ) : null}
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { gap: GAME.space.xs },
  header: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  headerText: { color: GAME.text, fontWeight: "900", fontSize: GAME.type.caption },
  goalLine: { color: GAME.textMuted, fontSize: GAME.type.caption, fontWeight: "600", lineHeight: 20 },
  actions: { flexDirection: "row", gap: GAME.space.sm, marginTop: GAME.space.sm },
  cta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: GAME.gold,
    paddingVertical: GAME.space.sm,
    borderRadius: GAME.radius.full,
  },
  ctaSecondary: {
    backgroundColor: "rgba(90,200,250,0.15)",
    borderWidth: 1,
    borderColor: GAME.sky,
  },
  ctaText: { color: GAME.navy, fontWeight: "900", fontSize: GAME.type.caption },
  ctaTextSecondary: { color: GAME.sky, fontWeight: "800", fontSize: GAME.type.caption },
});
