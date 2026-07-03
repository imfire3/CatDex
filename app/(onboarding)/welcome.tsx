import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sparkles } from "lucide-react-native";
import { FloatingButton } from "@/components/game/FloatingButton";
import { GAME, GRADIENTS } from "@/constants/game";
import { signInAnonymously } from "@/lib/auth";
import { authModeStore } from "@/lib/auth-mode";
import { supabase } from "@/lib/supabase";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = async () => {
    authModeStore.setGuest(true);
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      await signInAnonymously();
    }
    router.push("/(onboarding)/permissions");
  };

  return (
    <LinearGradient colors={[...GRADIENTS.welcome]} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.glow} />
          <Animated.Text entering={FadeInUp.delay(300).springify()} style={styles.emoji}>
            🐱
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(500).springify()} style={styles.title}>
            Bienvenue dans{"\n"}CatDex
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(650).springify()} style={styles.body}>
            Explore ta ville, photographie les chats de rue et construis la collection la plus complète de ton quartier.
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(800).springify()} style={styles.features}>
            {[
              { icon: "📍", text: "Découvre des chats à proximité" },
              { icon: "📸", text: "Capture et documente chaque rencontre" },
              { icon: "🏆", text: "Monte en niveau et débloque des badges" },
            ].map((f) => (
              <View key={f.text} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </Animated.View>
        </View>
        <Animated.View entering={FadeInDown.delay(1000).springify()} style={styles.footer}>
          <FloatingButton
            label="Commencer l'aventure"
            icon={Sparkles}
            onPress={handleStart}
          />
          <Pressable style={styles.loginLink} onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginLinkText}>
              J'ai déjà un compte · <Text style={styles.loginLinkAction}>Se connecter</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: GAME.space.lg, justifyContent: "space-between" },
  hero: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: GAME.space.xxl },
  glow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(90,200,250,0.25)",
    top: "20%",
  },
  emoji: { fontSize: 80, marginBottom: GAME.space.lg },
  title: {
    color: GAME.text,
    fontSize: GAME.type.hero,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 48,
    marginBottom: GAME.space.md,
  },
  body: {
    color: GAME.textMuted,
    fontSize: GAME.type.body,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: GAME.space.md,
    marginBottom: GAME.space.xl,
  },
  features: { gap: GAME.space.md, alignSelf: "stretch" },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: GAME.space.md,
    backgroundColor: GAME.glass,
    borderRadius: GAME.radius.md,
    padding: GAME.space.md,
    borderWidth: 1,
    borderColor: GAME.glassBorder,
  },
  featureIcon: { fontSize: 24 },
  featureText: { color: GAME.text, fontSize: GAME.type.body, fontWeight: "600", flex: 1 },
  footer: { paddingBottom: GAME.space.lg, gap: GAME.space.md },
  loginLink: { alignItems: "center", paddingVertical: GAME.space.sm },
  loginLinkText: { color: GAME.textMuted, fontSize: GAME.type.caption, fontWeight: "600" },
  loginLinkAction: { color: GAME.sky, fontWeight: "800", textDecorationLine: "underline" },
});
