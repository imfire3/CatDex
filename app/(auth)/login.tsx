import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { AuthOrDivider, SocialAuthRow } from "@/components/auth/SocialAuthRow";
import { GradientButton } from "@/components/auth/GradientButton";
import { GameTextField } from "@/components/ui/GameTextField";
import { GAME } from "@/constants/game";
import {
  signInWithApple,
  signInWithCredentials,
  signInWithGoogle,
} from "@/lib/auth";
import { formatAuthError } from "@/lib/auth-errors";
import { authModeStore } from "@/lib/auth-mode";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert("Champs requis", "Entre ton identifiant et ton mot de passe.");
      return;
    }

    try {
      setLoading(true);
      await signInWithCredentials(identifier.trim(), password);
      authModeStore.clear();
      router.replace("/");
    } catch (error) {
      Alert.alert("Connexion impossible", formatAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    try {
      setLoading(true);
      if (provider === "google") await signInWithGoogle();
      else await signInWithApple();
      authModeStore.clear();
      router.replace("/");
    } catch (error) {
      Alert.alert("Connexion impossible", formatAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        >
          <View style={styles.layout}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.brandRow}>
                <Text style={styles.brandEmoji}>🐱</Text>
                <Text style={styles.brand}>CatDex</Text>
              </View>

              <Text style={styles.title}>Salut !</Text>
              <Text style={styles.subtitle}>Entre tes identifiants pour chasser.</Text>

              <View style={styles.card}>
                <SocialAuthRow
                  onGoogle={() => handleOAuth("google")}
                  onApple={() => handleOAuth("apple")}
                  disabled={loading}
                />

                <AuthOrDivider />

                <View style={styles.form}>
                  <GameTextField
                    label="Identifiant"
                    value={identifier}
                    onChangeText={setIdentifier}
                    placeholder="ex: admin"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                  <GameTextField
                    label="Mot de passe"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Ton mot de passe"
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={[styles.stickyBottom, { paddingBottom: Math.max(insets.bottom, GAME.space.sm) }]}>
              <View style={styles.stickyInner}>
                <GradientButton
                  label={loading ? "Connexion..." : "Se connecter"}
                  onPress={handleLogin}
                  disabled={loading}
                  loading={loading}
                />

                <Pressable
                  style={styles.linkWrap}
                  hitSlop={GAME.space.xs}
                  onPress={() => {
                    authModeStore.setGuest(true);
                    router.push("/(onboarding)/welcome");
                  }}
                  disabled={loading}
                >
                  <Text style={styles.linkTertiary}>
                    <Text style={styles.linkTertiaryAction}>Continuer sans compte</Text>
                  </Text>
                </Pressable>

                <Link href="/(auth)/signup" asChild>
                  <Pressable style={styles.linkWrap} hitSlop={GAME.space.xs}>
                    <Text style={styles.linkTertiary}>
                      Pas encore de compte ?{" "}
                      <Text style={styles.linkTertiaryAction}>Créer un profil</Text>
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  layout: { flex: 1, justifyContent: "space-between" },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: GAME.space.md,
    paddingTop: GAME.space.lg,
    paddingBottom: GAME.space.sm,
    gap: GAME.space.sm,
  },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: GAME.space.xs },
  brandEmoji: { fontSize: GAME.type.title + 4 },
  brand: {
    color: GAME.sky,
    fontSize: GAME.type.display - 8,
    fontWeight: GAME.weight.black,
    letterSpacing: 0.5,
  },
  title: {
    color: GAME.text,
    fontSize: GAME.type.display - 8,
    fontWeight: GAME.weight.black,
    textAlign: "center",
  },
  subtitle: {
    color: GAME.textMuted,
    fontSize: GAME.type.body,
    textAlign: "center",
    marginBottom: GAME.space.xs,
  },
  card: {
    backgroundColor: GAME.surfaceOverlay,
    borderRadius: GAME.radius.lg,
    borderWidth: GAME.border.hairline,
    borderColor: GAME.glassBorder,
    padding: GAME.space.md,
    gap: GAME.space.sm,
  },
  form: { gap: GAME.space.sm },
  stickyBottom: {
    backgroundColor: "rgba(13,27,42,0.92)",
    borderTopWidth: GAME.border.hairline,
    borderTopColor: GAME.glassBorder,
    paddingTop: GAME.space.md,
  },
  stickyInner: { paddingHorizontal: GAME.space.md, gap: GAME.space.sm },
  linkWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: GAME.space.xs,
    minHeight: GAME.touch.min,
  },
  linkTertiary: {
    color: GAME.textMuted,
    fontSize: GAME.type.caption,
    fontWeight: GAME.weight.medium,
    textAlign: "center",
    lineHeight: 20,
  },
  linkTertiaryAction: {
    color: GAME.sky,
    fontWeight: GAME.weight.bold,
    textDecorationLine: "underline",
  },
});
