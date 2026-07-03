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
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { AuthOrDivider, SocialAuthRow } from "@/components/auth/SocialAuthRow";
import { GradientButton } from "@/components/auth/GradientButton";
import { TextField } from "@/components/ui";
import { AUTH, POGO, RADIUS, SPACE, TYPE } from "@/constants/theme";
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
              <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={SPACE.xs}>
                <Ionicons name="chevron-back" size={22} color={POGO.white} />
              </Pressable>

              <Text style={styles.title}>Créer un compte</Text>
              <Text style={styles.subtitle}>Rejoins la chasse aux chats de rue.</Text>

              <SocialAuthRow
                onGoogle={() => Alert.alert("Bientôt", "Inscription Google à venir.")}
                onApple={() => Alert.alert("Bientôt", "Inscription Apple à venir.")}
                disabled={loading}
              />

              <AuthOrDivider />

              <View style={styles.form}>
                <TextField
                  label="Pseudo"
                  variant="glass"
                  value={username}
                  onChangeText={setUsername}
                  placeholder="ex: cat_hunter42"
                  autoCapitalize="none"
                />
                <TextField
                  label="Email"
                  variant="glass"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="prenom.nom@gmail.com"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                />
                <TextField
                  label="Mot de passe"
                  variant="glass"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Ton mot de passe"
                  secureTextEntry
                />
              </View>
            </View>

            <View
              style={[styles.stickyBottom, { paddingBottom: Math.max(insets.bottom, SPACE.sm) }]}
            >
              <View style={styles.stickyInner}>
                <GradientButton
                  label={loading ? "Création..." : "Créer mon compte"}
                  onPress={handleSignup}
                  disabled={loading}
                  loading={loading}
                />

                <Link href="/(auth)/login" asChild>
                  <Pressable style={styles.linkWrap} hitSlop={SPACE.xs}>
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
  layout: {
    flex: 1,
    justifyContent: "space-between",
  },
  top: {
    paddingHorizontal: SPACE.sm,
    paddingTop: SPACE.xs,
    gap: SPACE.sm,
  },
  backButton: {
    width: SPACE.xxl,
    height: SPACE.xxl,
    borderRadius: RADIUS.full,
    backgroundColor: AUTH.glass,
    borderWidth: 1,
    borderColor: AUTH.glassBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: AUTH.text,
    fontSize: TYPE.display - 4,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: AUTH.textMuted,
    fontSize: TYPE.body - 2,
    textAlign: "center",
    marginBottom: SPACE.xs,
  },
  form: {
    gap: SPACE.sm,
  },
  stickyBottom: {
    backgroundColor: AUTH.overlayBottom,
    borderTopWidth: 1,
    borderTopColor: AUTH.glassBorder,
    paddingTop: SPACE.sm,
  },
  stickyInner: {
    paddingHorizontal: SPACE.sm,
    gap: SPACE.sm,
  },
  linkWrap: {
    alignItems: "center",
    minHeight: SPACE.xxl,
    justifyContent: "center",
    paddingVertical: SPACE.xs,
  },
  linkTertiary: {
    color: AUTH.textMuted,
    fontSize: TYPE.caption + 1,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: SPACE.md - 4,
  },
  linkTertiaryAction: {
    color: AUTH.textMuted,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
