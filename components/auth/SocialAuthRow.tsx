import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GAME } from "@/constants/game";

type SocialAuthRowProps = {
  onGoogle: () => void;
  onApple: () => void;
  disabled?: boolean;
};

export function SocialAuthRow({ onGoogle, onApple, disabled }: SocialAuthRowProps) {
  return (
    <View style={styles.row} testID="social-auth-row">
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed, disabled && styles.btnDisabled]}
        onPress={onGoogle}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Connexion avec Google"
        testID="google-auth-btn"
      >
        <View style={styles.btnInner}>
          <Ionicons name="logo-google" size={20} color={GAME.text} />
          <Text style={styles.btnText}>Google</Text>
        </View>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed, disabled && styles.btnDisabled]}
        onPress={onApple}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Connexion avec Apple"
        testID="apple-auth-btn"
      >
        <View style={styles.btnInner}>
          <Ionicons name="logo-apple" size={22} color={GAME.text} />
          <Text style={styles.btnText}>Apple</Text>
        </View>
      </Pressable>
    </View>
  );
}

export function AuthOrDivider({ label = "Ou" }: { label?: string }) {
  return (
    <View style={styles.dividerWrap}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: GAME.space.xs },
  btn: {
    flex: 1,
    minHeight: GAME.touch.button,
    backgroundColor: GAME.glass,
    borderRadius: GAME.radius.md,
    borderWidth: GAME.border.default,
    borderColor: GAME.glassBorder,
  },
  btnInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: GAME.space.xs,
    paddingVertical: GAME.space.xs,
    paddingHorizontal: GAME.space.xs,
  },
  btnPressed: { opacity: 0.88 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: GAME.text, fontWeight: GAME.weight.bold, fontSize: GAME.type.body },
  dividerWrap: { flexDirection: "row", alignItems: "center", gap: GAME.space.sm, paddingVertical: GAME.space.xs },
  dividerLine: { flex: 1, height: 1, backgroundColor: GAME.glassBorder },
  dividerText: { color: GAME.textMuted, fontWeight: GAME.weight.semibold, fontSize: GAME.type.caption },
});
