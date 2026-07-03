import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/game/ScreenHeader";
import { GlassCard } from "@/components/game/GlassCard";
import { GAME } from "@/constants/game";
import { useMissions } from "@/hooks/useMissions";
import { useAuth } from "@/providers/AuthProvider";
import { gameplayService } from "@/services/gameplay.service";
import { queryClient } from "@/providers/QueryProvider";
import { queryKeys } from "@/constants/queryKeys";

function MissionCard({
  id,
  emoji,
  title,
  description,
  current,
  target,
  xpReward,
  completed,
  claimed,
  delay,
  onClaim,
}: {
  id: string;
  emoji: string;
  title: string;
  description: string;
  current: number;
  target: number;
  xpReward: number;
  completed: boolean;
  claimed: boolean;
  delay: number;
  onClaim: (id: string) => void;
}) {
  const progress = Math.min(current / target, 1);
  const ready = completed && !claimed;

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <GlassCard style={[styles.missionCard, ready && styles.missionReady]}>
        <View style={styles.missionHeader}>
          <Text style={styles.missionEmoji}>{emoji}</Text>
          <View style={styles.missionInfo}>
            <Text style={styles.missionTitle}>{title}</Text>
            <Text style={styles.missionDesc}>{description}</Text>
          </View>
          <Text style={[styles.missionXp, ready && styles.missionXpReady]}>+{xpReward}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }, ready && styles.progressReady]} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.progressText}>
            {current}/{target}
          </Text>
          {ready ? (
            <Pressable style={styles.claimBtn} onPress={() => onClaim(id)}>
              <Text style={styles.claimText}>Réclamer 🎁</Text>
            </Pressable>
          ) : claimed ? (
            <Text style={styles.claimedText}>✓ Réclamé</Text>
          ) : null}
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export default function MissionsScreen() {
  const { session } = useAuth();
  const { daily, weekly, season, refresh } = useMissions();
  const [claimedXp, setClaimedXp] = useState<number | null>(null);

  const handleClaim = async (missionId: string) => {
    if (!session?.user.id) return;
    const xp = await gameplayService.claimMission(session.user.id, missionId);
    if (xp) {
      setClaimedXp(xp);
      refresh();
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(session.user.id) });
      setTimeout(() => setClaimedXp(null), 2000);
    }
  };

  return (
    <LinearGradient colors={[GAME.navy, GAME.navyLight]} style={styles.screen}>
      <ScreenHeader title="Missions" subtitle="Objectifs quotidiens & hebdo" showBack />
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {claimedXp ? (
          <Animated.View entering={ZoomIn.springify()} style={styles.toast}>
            <Text style={styles.toastText}>+{claimedXp} XP récupérés !</Text>
          </Animated.View>
        ) : null}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Défi du mois · {season.month}</Text>
          <GlassCard>
            <Text style={styles.seasonTitle}>{season.title}</Text>
            <Text style={styles.seasonDesc}>{season.description}</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(season.current / season.target, 1) * 100}%`, backgroundColor: GAME.gold },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {season.current}/{season.target}
            </Text>
          </GlassCard>

          <Text style={styles.sectionTitle}>Quotidiennes</Text>
          {daily.map((m, i) => (
            <MissionCard
              key={m.id}
              id={m.id}
              emoji={m.emoji}
              title={m.title}
              description={m.description}
              current={m.current}
              target={m.target}
              xpReward={m.xpReward}
              completed={m.completed}
              claimed={m.claimed}
              delay={100 + i * 80}
              onClaim={handleClaim}
            />
          ))}

          <Text style={styles.sectionTitle}>Hebdomadaires</Text>
          {weekly.map((m, i) => (
            <MissionCard
              key={m.id}
              id={m.id}
              emoji={m.emoji}
              title={m.title}
              description={m.description}
              current={m.current}
              target={m.target}
              xpReward={m.xpReward}
              completed={m.completed}
              claimed={m.claimed}
              delay={400 + i * 80}
              onClaim={handleClaim}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  toast: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    zIndex: 100,
    backgroundColor: GAME.gold,
    paddingHorizontal: GAME.space.lg,
    paddingVertical: GAME.space.sm,
    borderRadius: GAME.radius.full,
  },
  toastText: { color: GAME.navy, fontWeight: "900" },
  scroll: { padding: GAME.space.lg, gap: GAME.space.md, paddingBottom: GAME.space.xxl },
  sectionTitle: {
    color: GAME.text,
    fontSize: GAME.type.subtitle,
    fontWeight: "900",
    marginTop: GAME.space.sm,
  },
  seasonTitle: { color: GAME.text, fontWeight: "900", fontSize: GAME.type.body },
  seasonDesc: { color: GAME.textMuted, marginTop: 4, marginBottom: GAME.space.sm },
  missionCard: { gap: GAME.space.sm },
  missionReady: { borderColor: "rgba(255,204,0,0.5)", borderWidth: 1 },
  missionHeader: { flexDirection: "row", alignItems: "center", gap: GAME.space.sm },
  missionEmoji: { fontSize: 28 },
  missionInfo: { flex: 1 },
  missionTitle: { color: GAME.text, fontWeight: "800" },
  missionDesc: { color: GAME.textMuted, fontSize: GAME.type.caption },
  missionXp: { color: GAME.textDim, fontWeight: "900" },
  missionXpReady: { color: GAME.gold },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: GAME.sky, borderRadius: 3 },
  progressReady: { backgroundColor: GAME.gold },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressText: { color: GAME.textMuted, fontSize: 11, fontWeight: "700" },
  claimBtn: {
    backgroundColor: GAME.gold,
    paddingHorizontal: GAME.space.md,
    paddingVertical: 6,
    borderRadius: GAME.radius.full,
  },
  claimText: { color: GAME.navy, fontWeight: "900", fontSize: GAME.type.caption },
  claimedText: { color: GAME.green, fontWeight: "800", fontSize: GAME.type.caption },
});
