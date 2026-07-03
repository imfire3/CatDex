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
import { TextField } from "@/components/ui";
import { AUTH, BORDER, POGO, RADIUS, SPACE, TYPE } from "@/constants/theme";
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
                  <TextField
                    label="Identifiant"
                    variant="glass"
                    value={identifier}
                    onChangeText={setIdentifier}
                    placeholder="ex: admin"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                  <TextField
                    label="Mot de passe"
                    variant="glass"
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

            <View
              style={[
                styles.stickyBottom,
                { paddingBottom: Math.max(insets.bottom, SPACE.sm) },
              ]}
            >
              <View style={styles.stickyInner}>
                <GradientButton
                  label={loading ? "Connexion..." : "Se connecter"}
                  onPress={handleLogin}
                  disabled={loading}
                  loading={loading}
                />

                <Pressable
                  style={styles.linkWrap}
                  hitSlop={SPACE.xs}
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
                  <Pressable style={styles.linkWrap} hitSlop={SPACE.xs}>
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
  layout: {
    flex: 1,
    justifyContent: "space-between",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACE.sm,
    paddingTop: SPACE.lg,
    paddingBottom: SPACE.sm,
    gap: SPACE.sm,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACE.xs,
  },
  brandEmoji: {
    fontSize: TYPE.title + 4,
  },
  brand: {
    color: POGO.sky,
    fontSize: TYPE.display,
    fontWeight: "900",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  title: {
    color: AUTH.text,
    fontSize: TYPE.display - 4,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  subtitle: {
    color: AUTH.textMuted,
    fontSize: TYPE.body - 2,
    textAlign: "center",
    marginBottom: SPACE.xs,
  },
  card: {
    backgroundColor: AUTH.card,
    borderRadius: RADIUS.lg,
    borderWidth: BORDER.hairline,
    borderColor: AUTH.glassBorder,
    padding: SPACE.sm,
    gap: SPACE.sm,
  },
  form: {
    gap: SPACE.sm,
  },
  stickyBottom: {
    backgroundColor: AUTH.overlayBottom,
    borderTopWidth: BORDER.hairline,
    borderTopColor: AUTH.glassBorder,
    paddingTop: SPACE.md,
  },
  stickyInner: {
    paddingHorizontal: SPACE.sm,
    gap: SPACE.sm,
  },
  linkWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACE.xs,
    minHeight: SPACE.lg,
  },
  linkTertiary: {
    color: AUTH.textMuted,
    fontSize: TYPE.caption + 1,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: SPACE.md - 4,
  },
  linkTertiaryAction: {
    color: POGO.sky,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});
