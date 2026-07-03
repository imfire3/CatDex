import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sparkles } from "lucide-react-native";
import { FloatingButton } from "@/components/game/FloatingButton";
import { GlassCard } from "@/components/game/GlassCard";
import { ProgressDots } from "@/components/game/ProgressDots";
import { GAME, GRADIENTS } from "@/constants/game";
import { validateSignupUsername } from "@/lib/validation";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/providers/AuthProvider";
import { useUI } from "@/providers/UIProvider";

const SUGGESTIONS = ["cat_hunter", "patte_agile", "miaou_pro", "felins_paris"];

export default function UsernameScreen() {
  const router = useRouter();
  const { username, setUsername, avatar, completeOnboarding } = useUI();
  const { session, refreshProfile } = useAuth();
  const [value, setValue] = useState(username || "");
  const [saving, setSaving] = useState(false);

  const canContinue = value.trim().length >= 3 && !saving;

  const finish = async () => {
    const name = value.trim();
    const usernameError = validateSignupUsername(name);
    if (usernameError) {
      Alert.alert("Pseudo invalide", usernameError);
      return;
    }

    setSaving(true);
    try {
      if (session?.user.id) {
        await authService.syncOnboarding(session.user.id, name, avatar);
        await refreshProfile();
      }
      setUsername(name);
      completeOnboarding();
      router.replace("/(tabs)/map");
    } catch (error) {
      Alert.alert(
        "Profil non enregistré",
        (error as Error).message.includes("avatar_emoji")
          ? "La base de données doit être mise à jour. Lance npm run db:setup puis réessaie."
          : (error as Error).message || "Réessaie dans un instant."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={[...GRADIENTS.welcome]} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ProgressDots total={4} current={3} />

        <Animated.Text entering={FadeInDown.delay(200).springify()} style={styles.title}>
          Ton pseudo
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(300).springify()} style={styles.subtitle}>
          Lettres, chiffres et _ uniquement — visible dans le classement.
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(450).springify()}>
          <GlassCard style={styles.card}>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarEmoji}>{avatar}</Text>
            </View>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              placeholder="ex: cat_hunter"
              placeholderTextColor={GAME.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={24}
            />
            <Text style={styles.hint}>{value.length}/24 · a-z, 0-9, _</Text>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.suggestions}>
          <Text style={styles.suggestLabel}>Suggestions</Text>
          <View style={styles.chips}>
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                style={styles.chip}
                onPress={() => setValue(s)}
                accessibilityRole="button"
                accessibilityLabel={`Utiliser le pseudo ${s}`}
              >
                <Text style={styles.chipText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(750).springify()} style={styles.footer}>
          <FloatingButton
            label={saving ? "Création…" : "Entrer dans CatDex"}
            icon={Sparkles}
            onPress={finish}
            disabled={!canContinue}
            style={{ opacity: canContinue ? 1 : 0.45 }}
          />
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: GAME.space.lg,
    paddingTop: GAME.space.lg,
    paddingBottom: GAME.space.lg,
    justifyContent: "space-between",
  },
  title: {
    color: GAME.text,
    fontSize: GAME.type.title,
    fontWeight: "900",
    textAlign: "center",
    marginTop: GAME.space.xl,
  },
  subtitle: {
    color: GAME.textMuted,
    fontSize: GAME.type.body,
    textAlign: "center",
    marginTop: GAME.space.sm,
    marginBottom: GAME.space.xl,
    lineHeight: 22,
  },
  card: { gap: GAME.space.md },
  avatarBadge: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(90,200,250,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: GAME.sky,
  },
  avatarEmoji: { fontSize: 32 },
  input: {
    color: GAME.text,
    fontSize: GAME.type.subtitle,
    fontWeight: "800",
    textAlign: "center",
    paddingVertical: GAME.space.md,
    borderBottomWidth: 2,
    borderBottomColor: GAME.glassBorder,
  },
  hint: {
    color: GAME.textDim,
    fontSize: GAME.type.caption,
    textAlign: "center",
    fontWeight: "600",
  },
  suggestions: { gap: GAME.space.sm },
  suggestLabel: {
    color: GAME.textMuted,
    fontSize: GAME.type.caption,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: GAME.space.sm },
  chip: {
    backgroundColor: "rgba(90,200,250,0.15)",
    paddingHorizontal: GAME.space.md,
    paddingVertical: GAME.space.sm,
    borderRadius: GAME.radius.full,
    overflow: "hidden",
  },
  chipText: {
    color: GAME.sky,
    fontWeight: "700",
    fontSize: GAME.type.caption,
  },
  footer: {},
});
