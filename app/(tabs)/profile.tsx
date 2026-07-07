import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Award, Gift, Settings, Target, Trophy, Users } from "lucide-react-native";
import { LinkRow } from "@/components/ui/LinkRow";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { RewardToast, StatCard } from "@/components/ui/GamePrimitives";
import { GlassCard } from "@/components/game/GlassCard";
import { StreakWeek } from "@/components/game/StreakWeek";
import { StreakPill } from "@/components/game/StreakPill";
import { XpBar } from "@/components/game/StatBar";
import { LoadingView, ErrorState } from "@/components/feedback";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { GAME, TEXT } from "@/constants/game";
import { xpToNextLevel } from "@/gameplay/xp/xp-rules";
import { useBadges, useCaptures, useFriends, useProfileStats } from "@/hooks/useGameData";
import { useRetention } from "@/hooks/useRetention";
import { useAuth } from "@/providers/AuthProvider";
import { gameplayService } from "@/services/gameplay.service";
import { queryClient } from "@/providers/QueryProvider";
import { queryKeys } from "@/constants/queryKeys";

const STATS_KEYS = [
  { key: "total_captures" as const, label: "Captures" },
  { key: "uniqueCats" as const, label: "Uniques" },
  { key: "zones_explored" as const, label: "Zones" },
  { key: "streak" as const, label: "Série" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [claimedBonus, setClaimedBonus] = useState<number | null>(null);
  const { data: profile, isLoading, isError, refetch } = useProfileStats(session?.user.id);
  const { data: captures = [] } = useCaptures(session?.user.id);
  const { data: badges = [] } = useBadges(session?.user.id);
  const { data: friends = [] } = useFriends(session?.user.id);
  const retention = useRetention();
  const unlockedBadges = badges.filter((b) => b.unlocked).length;
  const uniqueCats = new Set(captures.map((c) => c.cat_id)).size;

  const stats = STATS_KEYS.map((s) => {
    if (!profile) return { label: s.label, value: "—" };
    if (s.key === "uniqueCats") return { label: s.label, value: uniqueCats };
    if (s.key === "streak") return { label: s.label, value: `${profile.streak}j` };
    return { label: s.label, value: profile[s.key] };
  });

  const xpMax = profile ? xpToNextLevel(profile.xp) : 250;

  const claimDailyBonus = async () => {
    if (!session?.user.id || !profile) return;
    const xp = await gameplayService.claimDailyBonus(session.user.id, profile.streak);
    if (!xp) return;
    setClaimedBonus(xp);
    retention.refresh();
    queryClient.invalidateQueries({ queryKey: queryKeys.profile(session.user.id) });
    setTimeout(() => setClaimedBonus(null), 2000);
  };

  if (isLoading && !profile) {
    return (
      <ScreenBackground variant="profile">
        <LoadingView label="Chargement du profil…" fullScreen />
      </ScreenBackground>
    );
  }

  if (isError && !profile) {
    return (
      <ScreenBackground variant="profile">
        <ErrorState
          title="Profil indisponible"
          message="Impossible de charger ton profil. Réessaie dans un instant."
          onRetry={() => refetch()}
        />
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground variant="profile">
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {claimedBonus ? <RewardToast xp={claimedBonus} label="Bonus quotidien" /> : null}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.springify()} style={styles.hero}>
            <LinearGradient colors={[GAME.sky, GAME.indigo]} style={styles.avatarRing}>
              <Text style={styles.avatar}>{profile?.avatar_emoji ?? "😺"}</Text>
            </LinearGradient>
            <Text style={styles.username}>
              {profile?.display_name ?? profile?.username ?? "Chasseur"}
            </Text>
            <View style={styles.levelRow}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Niveau {profile?.level ?? 1}</Text>
              </View>
              <StreakPill streak={profile?.streak ?? 0} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <GlassCard>
              <XpBar current={profile?.xp ?? 0} max={xpMax} label="Progression" />
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).springify()}>
            <GlassCard>
              <StreakWeek streak={profile?.streak ?? 0} />
            </GlassCard>
          </Animated.View>

          {retention.canClaimDailyBonus ? (
            <Animated.View entering={ZoomIn.springify()}>
              <LinkRow
                icon={Gift}
                iconColor={GAME.gold}
                title="Bonus du jour disponible"
                subtitle="Réclame-le maintenant pour garder ta série active"
                highlight
                onPress={claimDailyBonus}
              />
            </Animated.View>
          ) : null}

          <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.statsGrid}>
            {stats.map((s) => (
              <StatCard
                key={s.label}
                label={s.label}
                value={s.value}
                icon={<Text style={styles.statIcon}>{s.label === "Série" ? "🔥" : s.label === "Zones" ? "🗺️" : "🐱"}</Text>}
                accent={s.label === "Série" ? GAME.gold : s.label === "Zones" ? GAME.green : GAME.sky}
                style={styles.statCell}
              />
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.section}>
            <SectionLabel>Objectifs</SectionLabel>
            <LinkRow
              icon={Target}
              iconColor={GAME.green}
              title="Missions"
              subtitle={
                retention.unclaimedMissions > 0
                  ? `${retention.unclaimedMissions} récompense${retention.unclaimedMissions > 1 ? "s" : ""} à réclamer`
                  : "Quotidiennes & hebdomadaires"
              }
              badge={retention.unclaimedMissions > 0 ? retention.unclaimedMissions : undefined}
              onPress={() => router.push("/missions")}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
            <SectionLabel>Succès</SectionLabel>
            <LinkRow
              icon={Award}
              iconColor={GAME.gold}
              title="Badges"
              subtitle={`${unlockedBadges} débloqué${unlockedBadges > 1 ? "s" : ""}${badges.length > 0 ? ` sur ${badges.length}` : ""}`}
              onPress={() => router.push("/badges")}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(450).springify()} style={styles.section}>
            <SectionLabel>Communauté</SectionLabel>
            <View style={styles.linkList}>
              <LinkRow
                icon={Users}
                title="Amis"
                subtitle={`${friends.length} ami${friends.length !== 1 ? "s" : ""}`}
                onPress={() => router.push("/friends")}
              />
              <LinkRow
                icon={Trophy}
                iconColor={GAME.gold}
                title="Classement"
                subtitle={`Niveau ${profile?.level ?? 1}`}
                onPress={() => router.push("/leaderboard")}
              />
              <LinkRow
                icon={Settings}
                title="Paramètres"
                subtitle="Compte & préférences"
                onPress={() => router.push("/settings")}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: GAME.space.lg, paddingBottom: GAME.layout.tabScrollPadding, gap: GAME.space.lg },
  hero: { alignItems: "center", gap: GAME.space.sm },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatar: { fontSize: 48 },
  username: { ...TEXT.title, textAlign: "center" },
  levelRow: { flexDirection: "row", alignItems: "center", gap: GAME.space.sm },
  levelBadge: {
    backgroundColor: GAME.gold,
    paddingHorizontal: GAME.space.md,
    paddingVertical: GAME.space.xs,
    borderRadius: GAME.radius.full,
  },
  levelText: { color: GAME.navy, fontWeight: GAME.weight.black, fontSize: GAME.type.caption },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: GAME.space.md },
  statCell: { width: "47%", flexGrow: 1 },
  statIcon: { fontSize: GAME.icon.md },
  section: { gap: GAME.space.sm },
  linkList: { gap: GAME.space.sm },
});
