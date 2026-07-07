import { ScrollView, Share, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/game/ScreenHeader";
import { GlassCard } from "@/components/game/GlassCard";
import { EmptyState, ErrorState, LoadingView } from "@/components/feedback";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { GAME } from "@/constants/game";
import { useFriends } from "@/hooks/useGameData";
import { useAuth } from "@/providers/AuthProvider";

export default function FriendsScreen() {
  const { session } = useAuth();
  const { data: friends = [], isLoading, isError, refetch } = useFriends(session?.user.id);

  return (
    <ScreenBackground>
      <ScreenHeader title="Amis" subtitle={`${friends.length} chasseur${friends.length !== 1 ? "s" : ""}`} />
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {isLoading ? (
          <LoadingView label="Chargement des amis…" />
        ) : isError ? (
          <ErrorState
            title="Impossible de charger"
            message="Vérifie ta connexion et réessaie."
            onRetry={() => refetch()}
          />
        ) : friends.length === 0 ? (
          <EmptyState
            emoji="👋"
            title="Aucun ami pour l'instant"
            description="Invite un chasseur pour comparer vos captures, séries et badges."
            actionLabel="Inviter un ami"
            onAction={() => Share.share({ message: "Rejoins-moi sur CatDex pour capturer les chats du quartier !" })}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {friends.map((friend, i) => (
              <Animated.View key={friend.id} entering={FadeInDown.delay(i * 80).springify()}>
                <GlassCard style={styles.row}>
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatar}>{friend.avatar}</Text>
                  </View>
                  <View style={styles.body}>
                    <Text style={styles.name}>{friend.username}</Text>
                    <Text style={styles.meta}>
                      Niv. {friend.level} · {friend.captures} captures
                    </Text>
                  </View>
                  <View style={styles.status}>
                    <Text style={styles.statusText}>{friend.online ? "En chasse" : "Vu récemment"}</Text>
                  </View>
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
  scroll: { padding: GAME.space.lg, gap: GAME.space.sm, paddingBottom: GAME.space.xxl },
  row: { flexDirection: "row", alignItems: "center", gap: GAME.space.md },
  avatarWrap: { position: "relative" },
  avatar: { fontSize: 32 },
  body: { flex: 1 },
  name: { color: GAME.text, fontSize: GAME.type.body, fontWeight: "800" },
  meta: { color: GAME.textMuted, fontSize: GAME.type.caption, marginTop: 2 },
  status: {
    paddingHorizontal: GAME.space.sm,
    paddingVertical: 4,
    borderRadius: GAME.radius.full,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  statusText: { color: GAME.textMuted, fontSize: 11, fontWeight: "700" },
});
