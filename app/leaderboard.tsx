import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Crown, Medal, Trophy } from "lucide-react-native";
import { ScreenHeader } from "@/components/game/ScreenHeader";
import { GlassCard } from "@/components/game/GlassCard";
import { EmptyState, ErrorState, LoadingView } from "@/components/feedback";
import { GAME } from "@/constants/game";
import { useLeaderboard } from "@/hooks/useGameData";
import { useAuth } from "@/providers/AuthProvider";

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown color={GAME.gold} size={22} fill={GAME.gold} />;
  if (rank === 2) return <Medal color="#C0C0C0" size={22} />;
  if (rank === 3) return <Medal color="#CD7F32" size={22} />;
  return <Text style={styles.rankNum}>{rank}</Text>;
}

export default function LeaderboardScreen() {
  const { session } = useAuth();
  const { data: entries = [], isLoading, isError, refetch } = useLeaderboard(session?.user.id);

  return (
    <LinearGradient colors={[GAME.navy, GAME.navyLight]} style={styles.screen}>
      <ScreenHeader title="Classement" subtitle="Top chasseurs de Paris" />
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {isLoading ? (
          <LoadingView label="Chargement du classement…" />
        ) : isError ? (
          <ErrorState
            title="Impossible de charger"
            message="Vérifie ta connexion et réessaie."
            onRetry={() => refetch()}
          />
        ) : entries.length === 0 ? (
          <EmptyState
            emoji="🏆"
            title="Classement vide"
            description="Sois le premier à capturer des chats et grimpe au sommet."
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {entries.map((entry, i) => (
              <Animated.View key={entry.rank} entering={FadeInDown.delay(i * 70).springify()}>
                <GlassCard
                  style={[styles.row, entry.isMe && styles.rowMe]}
                  padding={GAME.space.md}
                >
                  <View style={styles.rankWrap}>
                    <RankIcon rank={entry.rank} />
                  </View>
                  <Text style={styles.avatar}>{entry.avatar}</Text>
                  <View style={styles.body}>
                    <Text style={[styles.name, entry.isMe && styles.nameMe]}>
                      {entry.username}
                      {entry.isMe ? " (toi)" : ""}
                    </Text>
                    <Text style={styles.meta}>
                      Niv. {entry.level} · {entry.captures} captures
                    </Text>
                  </View>
                  <View style={styles.xpWrap}>
                    <Trophy color={GAME.gold} size={14} />
                    <Text style={styles.xp}>{entry.xp.toLocaleString()}</Text>
                  </View>
                </GlassCard>
              </Animated.View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: GAME.space.lg, gap: GAME.space.sm, paddingBottom: GAME.space.xxl },
  row: { flexDirection: "row", alignItems: "center", gap: GAME.space.md },
  rowMe: { borderColor: GAME.sky, borderWidth: 2 },
  rankWrap: { width: 32, alignItems: "center" },
  rankNum: { color: GAME.textMuted, fontWeight: "900", fontSize: GAME.type.body },
  avatar: { fontSize: 28 },
  body: { flex: 1 },
  name: { color: GAME.text, fontSize: GAME.type.body, fontWeight: "800" },
  nameMe: { color: GAME.sky },
  meta: { color: GAME.textMuted, fontSize: GAME.type.caption, marginTop: 2 },
  xpWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  xp: { color: GAME.gold, fontWeight: "900", fontSize: GAME.type.caption },
});
