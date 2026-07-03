import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/game/ScreenHeader";
import { GlassCard } from "@/components/game/GlassCard";
import { GAME } from "@/constants/game";
import { signOut } from "@/lib/auth";
import { authModeStore } from "@/lib/auth-mode";
import { useAuth } from "@/providers/AuthProvider";

export default function SettingsScreen() {
  const router = useRouter();
  const { session, profile } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      authModeStore.clear();
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    }
  };

  return (
    <LinearGradient colors={[GAME.navy, GAME.navyLight]} style={styles.screen}>
      <ScreenHeader title="Paramètres" subtitle="Personnalise ton expérience" />
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.springify()}>
            <Text style={styles.section}>Compte</Text>
            <GlassCard style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pseudo</Text>
                <Text style={styles.infoValue}>{profile?.display_name ?? profile?.username ?? "—"}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{session?.user.email ?? "—"}</Text>
              </View>
            </GlassCard>
            <Pressable
              style={styles.logoutBtn}
              onPress={handleLogout}
              accessibilityRole="button"
              accessibilityLabel="Se déconnecter"
            >
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <Text style={styles.section}>Préférences</Text>
            <GlassCard>
              <Text style={styles.prefsNote}>
                Les réglages de notifications, vibrations et confidentialité arriveront dans une prochaine version.
              </Text>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Text style={styles.section}>À propos</Text>
            <GlassCard>
              <Text style={styles.aboutText}>
                CatDex v1.0.0{"\n"}
                Découvre et documente les chats de ta ville.{"\n"}
                Fait avec 🐱 pour les amoureux des félins.
              </Text>
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: GAME.space.lg, gap: GAME.space.lg, paddingBottom: GAME.space.xxl },
  section: {
    color: GAME.textMuted,
    fontSize: GAME.type.caption,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: GAME.space.sm,
  },
  infoCard: { gap: 0 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: GAME.space.sm,
  },
  infoLabel: { color: GAME.textMuted, fontWeight: "600" },
  infoValue: { color: GAME.text, fontWeight: "800", flexShrink: 1, textAlign: "right" },
  divider: { height: 1, backgroundColor: GAME.glassBorder },
  logoutBtn: {
    marginTop: GAME.space.sm,
    alignItems: "center",
    paddingVertical: GAME.space.md,
    borderRadius: GAME.radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,59,48,0.4)",
    backgroundColor: "rgba(255,59,48,0.1)",
  },
  logoutText: { color: GAME.capture, fontWeight: "800" },
  prefsNote: { color: GAME.textMuted, lineHeight: 22, fontSize: GAME.type.body },
  aboutText: { color: GAME.textMuted, lineHeight: 24, fontSize: GAME.type.body },
});
