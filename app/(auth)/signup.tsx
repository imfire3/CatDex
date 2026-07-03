import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { AuthOrDivider, SocialAuthRow } from "@/components/auth/SocialAuthRow";
import { GradientButton } from "@/components/auth/GradientButton";
import { GameTextField } from "@/components/ui/GameTextField";
import { IconButton } from "@/components/ui/IconButton";
import { GAME } from "@/constants/game";
import { signUpWithEmail } from "@/lib/auth";
import { formatAuthError } from "@/lib/auth-errors";
import { authModeStore } from "@/lib/auth-mode";
import {
  validateSignupEmail,
  validateSignupPassword,
  validateSignupUsername,
} from "@/lib/validation";

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const usernameError = validateSignupUsername(username);
    if (usernameError) {
      Alert.alert("Pseudo invalide", usernameError);
      return;
    }

    const emailError = validateSignupEmail(email);
    if (emailError) {
      Alert.alert("Email invalide", emailError);
      return;
    }

    const passwordError = validateSignupPassword(password);
    if (passwordError) {
      Alert.alert("Mot de passe invalide", passwordError);
      return;
    }

    try {
      setLoading(true);
      await signUpWithEmail(email, password, username.trim());
      authModeStore.clear();
      router.replace("/");
    } catch (error) {
      Alert.alert("Inscription impossible", formatAuthError(error));
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
            <View style={styles.top}>
              <IconButton
                icon={ChevronLeft}
                onPress={() => router.back()}
                accessibilityLabel="Retour"
                style={styles.backButton}
              />

              <Text style={styles.title}>Créer un compte</Text>
              <Text style={styles.subtitle}>Rejoins la chasse aux chats de rue.</Text>

              <SocialAuthRow
                onGoogle={() => Alert.alert("Bientôt", "Inscription Google à venir.")}
                onApple={() => Alert.alert("Bientôt", "Inscription Apple à venir.")}
                disabled={loading}
              />

              <AuthOrDivider />

              <View style={styles.form}>
                <GameTextField
                  label="Pseudo"
                  value={username}
                  onChangeText={setUsername}
                  placeholder="ex: cat_hunter42"
                  autoCapitalize="none"
                />
                <GameTextField
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="prenom.nom@gmail.com"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                />
                <GameTextField
                  label="Mot de passe"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Ton mot de passe"
                  secureTextEntry
                />
              </View>
            </View>

            <View style={[styles.stickyBottom, { paddingBottom: Math.max(insets.bottom, GAME.space.sm) }]}>
              <View style={styles.stickyInner}>
                <GradientButton
                  label={loading ? "Création..." : "Créer mon compte"}
                  onPress={handleSignup}
                  disabled={loading}
                  loading={loading}
                />

                <Link href="/(auth)/login" asChild>
                  <Pressable style={styles.linkWrap} hitSlop={GAME.space.xs}>
                    <Text style={styles.linkTertiary}>
                      Déjà un compte ?{"\n"}
                      <Text style={styles.linkTertiaryAction}>Se connecter</Text>
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
  top: {
    paddingHorizontal: GAME.space.md,
    paddingTop: GAME.space.xs,
    gap: GAME.space.sm,
  },
  backButton: { alignSelf: "flex-start" },
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
  form: { gap: GAME.space.sm },
  stickyBottom: {
    backgroundColor: "rgba(13,27,42,0.92)",
    borderTopWidth: GAME.border.hairline,
    borderTopColor: GAME.glassBorder,
    paddingTop: GAME.space.sm,
  },
  stickyInner: { paddingHorizontal: GAME.space.md, gap: GAME.space.sm },
  linkWrap: {
    alignItems: "center",
    minHeight: GAME.touch.min,
    justifyContent: "center",
    paddingVertical: GAME.space.xs,
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
