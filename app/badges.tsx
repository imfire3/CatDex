import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/game/ScreenHeader";
import { GlassCard } from "@/components/game/GlassCard";
import { EmptyState, ErrorState, LoadingView } from "@/components/feedback";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { GAME } from "@/constants/game";
import { useBadges } from "@/hooks/useGameData";
import { useAuth } from "@/providers/AuthProvider";

export default function BadgesScreen() {
  const { session } = useAuth();
  const { data: badges = [], isLoading, isError, refetch } = useBadges(session?.user.id);
  const unlocked = badges.filter((b) => b.unlocked).length;

  return (
    <ScreenBackground>
      <ScreenHeader
        title="Badges"
        subtitle={badges.length > 0 ? `${unlocked}/${badges.length} débloqués` : "Aucun badge"}
      />
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {isLoading ? (
          <LoadingView label="Chargement des badges…" />
        ) : isError ? (
          <ErrorState
            title="Impossible de charger"
            message="Vérifie ta connexion et réessaie."
            onRetry={() => refetch()}
          />
        ) : badges.length === 0 ? (
          <EmptyState
            emoji="🏅"
            title="Aucun badge"
            description="Capture des chats pour débloquer tes premiers badges."
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {badges.map((badge, i) => (
              <Animated.View key={badge.id} entering={FadeInDown.delay(i * 80).springify()}>
                <GlassCard style={[styles.card, !badge.unlocked && styles.cardLocked]}>
                  <Text style={[styles.emoji, !badge.unlocked && styles.emojiLocked]}>
                    {badge.emoji}
                  </Text>
                  <View style={styles.body}>
                    <Text style={[styles.title, !badge.unlocked && styles.titleLocked]}>
                      {badge.title}
                    </Text>
                    <Text style={styles.desc}>{badge.description}</Text>
                    {badge.progress !== undefined && !badge.unlocked ? (
                      <ProgressBar progress={badge.progress} height={8} variant="sky" style={styles.progress} />
                    ) : null}
                  </View>
                  {badge.unlocked ? (
                    <View style={styles.unlockedBadge}>
                      <Text style={styles.unlockedText}>✓</Text>
                    </View>
                  ) : null}
                </GlassCard>
              </Animated.View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: GAME.space.lg, gap: GAME.space.md, paddingBottom: GAME.space.xxl },
  card: { flexDirection: "row", alignItems: "center", gap: GAME.space.md },
  cardLocked: { opacity: 0.55 },
  emoji: { fontSize: 36 },
  emojiLocked: { opacity: 0.4 },
  body: { flex: 1, gap: 4 },
  title: { color: GAME.text, fontSize: GAME.type.body, fontWeight: "900" },
  titleLocked: { color: GAME.textMuted },
  desc: { color: GAME.textMuted, fontSize: GAME.type.caption, lineHeight: 18 },
  progress: { marginTop: GAME.space.sm },
  unlockedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GAME.green,
    alignItems: "center",
    justifyContent: "center",
  },
  unlockedText: { color: GAME.text, fontWeight: "900", fontSize: 14 },
});
