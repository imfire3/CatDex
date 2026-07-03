import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Award,
  Grid3X3,
  Map,
  Settings,
  Target,
  Trophy,
  User,
  Users,
} from "lucide-react-native";
import { ScreenHeader } from "@/components/game/ScreenHeader";
import { MenuRow } from "@/components/game/MenuRow";
import { GAME } from "@/constants/game";
import { useProfileStats } from "@/hooks/useGameData";
import { useAuth } from "@/providers/AuthProvider";

export default function MenuScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { data: profile } = useProfileStats(session?.user.id);

  const displayName = profile?.display_name ?? profile?.username ?? "Chasseur";
  const avatar = profile?.avatar_emoji ?? "😺";
  const level = profile?.level ?? 1;

  const items = [
    { icon: Map, label: "Carte", subtitle: "Explorer les chats à proximité", route: "/(tabs)/map", color: GAME.sky },
    { icon: Grid3X3, label: "ChatDex", subtitle: "Ta collection de chats", route: "/(tabs)/chatdex", color: GAME.gold },
    { icon: User, label: "Profil", subtitle: displayName, route: "/(tabs)/profile", color: GAME.purple },
    { icon: Award, label: "Badges", subtitle: "Succès débloqués", route: "/badges", color: GAME.gold },
    { icon: Target, label: "Missions", subtitle: "Défis quotidiens & saisons", route: "/missions", color: GAME.green },
    { icon: Users, label: "Amis", subtitle: "Communauté de chasseurs", route: "/friends", color: GAME.green },
    { icon: Trophy, label: "Classement", subtitle: "Top chasseurs", route: "/leaderboard", color: GAME.pink },
    { icon: Settings, label: "Paramètres", subtitle: "Compte & préférences", route: "/settings", color: GAME.textMuted },
  ];

  return (
    <LinearGradient colors={[GAME.navy, GAME.navyLight]} style={styles.screen}>
      <ScreenHeader title="Menu" showBack />
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <Animated.View entering={FadeInDown.springify()} style={styles.profileBanner}>
          <Text style={styles.bannerAvatar}>{avatar}</Text>
          <View>
            <Text style={styles.bannerName}>{displayName}</Text>
            <Text style={styles.bannerLevel}>
              Niveau {level} · {profile?.total_captures ?? 0} captures
            </Text>
          </View>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {items.map((item, i) => (
            <Animated.View key={item.route} entering={FadeInDown.delay(100 + i * 60).springify()}>
              <MenuRow
                icon={item.icon}
                label={item.label}
                subtitle={item.subtitle}
                color={item.color}
                onPress={() => router.push(item.route as never)}
              />
            </Animated.View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  profileBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: GAME.space.md,
    marginHorizontal: GAME.space.lg,
    marginBottom: GAME.space.lg,
    padding: GAME.space.md,
    backgroundColor: GAME.glass,
    borderRadius: GAME.radius.lg,
    borderWidth: 1,
    borderColor: GAME.glassBorder,
  },
  bannerAvatar: { fontSize: 40 },
  bannerName: { color: GAME.text, fontSize: GAME.type.subtitle, fontWeight: "900" },
  bannerLevel: { color: GAME.textMuted, fontSize: GAME.type.caption, fontWeight: "600", marginTop: 2 },
  scroll: { paddingHorizontal: GAME.space.lg, gap: GAME.space.sm, paddingBottom: GAME.space.xxl },
});
