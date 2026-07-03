import { useMemo } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight } from "lucide-react-native";
import { CatDexTile } from "@/components/game/CatDexTile";
import { GlassCard } from "@/components/game/GlassCard";
import { ChatDexToolbar } from "@/components/chatdex/ChatDexToolbar";
import { EmptyState, ErrorState, LoadingView, SkeletonCard } from "@/components/feedback";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { GAME, TEXT } from "@/constants/game";
import { useChatDex, useNearbyCats } from "@/hooks/useGameData";
import { useLiveLocation } from "@/providers/LocationProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useAppStore } from "@/stores";
import { getCollectionNudge } from "@/gameplay/retention/collection-nudges";

export default function ChatDexScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { allCats, discoveredCats, isLoading, isError, refetch } = useChatDex(session?.user.id);
  const { searchQuery, chatdexFilter } = useAppStore();
  const { location } = useLiveLocation();
  const { nearby } = useNearbyCats(location.latitude, location.longitude, session?.user.id);

  const cats = useMemo(() => {
    let list = chatdexFilter === "discovered" ? discoveredCats : allCats;
    if (chatdexFilter === "favorites") {
      list = allCats.filter((c) => c.favorite);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.breed.toLowerCase().includes(q) ||
          c.zone.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allCats, discoveredCats, chatdexFilter, searchQuery]);

  const discovered = discoveredCats.length;
  const total = allCats.length;
  const completion = total ? Math.round((discovered / total) * 100) : 0;
  const undiscoveredNearby = nearby.filter((c) => !c.discovered);
  const nudge = getCollectionNudge(discovered, total, undiscoveredNearby);

  if (isLoading && allCats.length === 0) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.safe}>
          <LoadingView label="Chargement du ChatDex…" />
          <View style={styles.skeletonGrid}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (isError && allCats.length === 0) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.safe}>
          <ErrorState
            title="ChatDex indisponible"
            message="Impossible de charger ta collection. Vérifie ta connexion."
            onRetry={() => refetch()}
          />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <Text style={styles.title}>ChatDex</Text>
          <Text style={styles.subtitle}>
            {discovered}/{total} · {completion}% complété
          </Text>
          <ProgressBar progress={completion} variant="gold" style={styles.progress} />
        </Animated.View>

        <ChatDexToolbar />

        {nudge ? (
          <Pressable
            style={styles.nudgeWrap}
            onPress={() =>
              nudge.urgency === "high" ? router.push("/capture") : router.push("/(tabs)/map")
            }
          >
            <GlassCard style={[styles.nudge, nudge.urgency === "high" && styles.nudgeHigh]}>
              <Text style={styles.nudgeEmoji}>{nudge.emoji}</Text>
              <View style={styles.nudgeBody}>
                <Text style={styles.nudgeMessage}>{nudge.message}</Text>
                {nudge.subtext ? <Text style={styles.nudgeSub}>{nudge.subtext}</Text> : null}
              </View>
              <ChevronRight color={GAME.sky} size={18} />
            </GlassCard>
          </Pressable>
        ) : null}

        <FlatList
          data={cats}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => refetch()}
              tintColor={GAME.sky}
            />
          }
          ListEmptyComponent={
            <EmptyState
              emoji={chatdexFilter === "favorites" ? "♥" : "🔍"}
              title={
                searchQuery
                  ? "Aucun résultat"
                  : chatdexFilter === "favorites"
                    ? "Aucun favori"
                    : "Collection vide"
              }
              description={
                searchQuery
                  ? "Essaie un autre nom, race ou zone."
                  : "Explore la carte et photographie des chats pour remplir ton ChatDex."
              }
              actionLabel={searchQuery ? undefined : "Ouvrir la carte"}
              onAction={searchQuery ? undefined : () => router.push("/(tabs)/map")}
            />
          }
          renderItem={({ item, index }) => (
            <CatDexTile
              cat={item}
              index={index + 1}
              onPress={() => router.push(`/cat/${item.id}`)}
            />
          )}
        />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: GAME.space.lg,
    paddingTop: GAME.space.md,
    paddingBottom: GAME.space.sm,
    gap: GAME.space.xs,
  },
  title: { ...TEXT.hero, color: GAME.gold, letterSpacing: 1 },
  subtitle: { ...TEXT.caption },
  progress: { marginTop: GAME.space.xs },
  nudgeWrap: { paddingHorizontal: GAME.space.lg, marginVertical: GAME.space.sm },
  nudge: { flexDirection: "row", alignItems: "center", gap: GAME.space.sm },
  nudgeHigh: { borderColor: "rgba(255,204,0,0.45)", borderWidth: 1 },
  nudgeEmoji: { fontSize: 24 },
  nudgeBody: { flex: 1 },
  nudgeMessage: { ...TEXT.bodyStrong, fontSize: GAME.type.caption },
  nudgeSub: { ...TEXT.micro, marginTop: 2 },
  list: {
    paddingHorizontal: GAME.space.md,
    paddingBottom: GAME.layout.tabScrollPadding,
    gap: GAME.space.md,
    flexGrow: 1,
  },
  row: { gap: GAME.space.md },
  skeletonGrid: { padding: GAME.space.lg, gap: GAME.space.md },
});
