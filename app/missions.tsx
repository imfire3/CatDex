import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/game/ScreenHeader";
import { GlassCard } from "@/components/game/GlassCard";
import { MissionCard, RewardToast } from "@/components/ui/GamePrimitives";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { GAME, TEXT } from "@/constants/game";
import { useMissions } from "@/hooks/useMissions";
import { useAuth } from "@/providers/AuthProvider";
import { gameplayService } from "@/services/gameplay.service";
import { queryClient } from "@/providers/QueryProvider";
import { queryKeys } from "@/constants/queryKeys";

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
    <ScreenBackground>
      <ScreenHeader title="Missions" subtitle="Objectifs quotidiens & hebdo" showBack />
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {claimedXp ? (
          <Animated.View entering={ZoomIn.springify()} style={styles.toast}>
            <RewardToast xp={claimedXp} label="Mission accomplie" />
          </Animated.View>
        ) : null}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Défi du mois · {season.month}</Text>
          <GlassCard variant="elevated" style={styles.seasonCard}>
            <View style={styles.seasonTop}>
              <Text style={styles.seasonEmoji}>🏆</Text>
              <View style={styles.seasonBody}>
                <Text style={styles.seasonTitle}>{season.title}</Text>
                <Text style={styles.seasonDesc}>{season.description}</Text>
              </View>
            </View>
            <ProgressBar
              progress={Math.min((season.current / season.target) * 100, 100)}
              variant="gold"
              label={`${season.current}/${season.target}`}
              showPercent
            />
          </GlassCard>

          <Text style={styles.sectionTitle}>Quotidiennes</Text>
          {daily.map((m, i) => (
            <Animated.View key={m.id} entering={FadeInDown.delay(100 + i * 80).springify()}>
              <MissionCard
                emoji={m.emoji}
                title={m.title}
                description={m.description}
                current={m.current}
                target={m.target}
                xpReward={m.xpReward}
                completed={m.completed}
                claimed={m.claimed}
                onClaim={() => handleClaim(m.id)}
              />
            </Animated.View>
          ))}

          <Text style={styles.sectionTitle}>Hebdomadaires</Text>
          {weekly.map((m, i) => (
            <Animated.View key={m.id} entering={FadeInDown.delay(400 + i * 80).springify()}>
              <MissionCard
                emoji={m.emoji}
                title={m.title}
                description={m.description}
                current={m.current}
                target={m.target}
                xpReward={m.xpReward}
                completed={m.completed}
                claimed={m.claimed}
                onClaim={() => handleClaim(m.id)}
              />
            </Animated.View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  toast: { zIndex: 100 },
  scroll: { padding: GAME.space.lg, gap: GAME.space.md, paddingBottom: GAME.space.xxl },
  sectionTitle: {
    ...TEXT.subtitle,
    marginTop: GAME.space.md,
  },
  seasonCard: { gap: GAME.space.md },
  seasonTop: { flexDirection: "row", gap: GAME.space.md, alignItems: "center" },
  seasonEmoji: { fontSize: GAME.icon.lg },
  seasonBody: { flex: 1, gap: GAME.space.xs },
  seasonTitle: { ...TEXT.bodyStrong },
  seasonDesc: { ...TEXT.caption },
});
