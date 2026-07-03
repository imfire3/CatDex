import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AUTH, BORDER, POGO, RADIUS, SPACE, TOUCH, TYPE } from "@/constants/theme";

type SocialAuthRowProps = {
  onGoogle: () => void;
  onApple: () => void;
  disabled?: boolean;
};

export function SocialAuthRow({ onGoogle, onApple, disabled }: SocialAuthRowProps) {
  return (
    <View style={styles.row} testID="social-auth-row">
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          pressed && styles.btnPressed,
          disabled && styles.btnDisabled,
        ]}
        onPress={onGoogle}
        disabled={disabled}
        testID="google-auth-btn"
      >
        <View style={styles.btnInner}>
          <Ionicons name="logo-google" size={20} color={POGO.white} />
          <Text style={styles.btnText}>Google</Text>
        </View>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          pressed && styles.btnPressed,
          disabled && styles.btnDisabled,
        ]}
        onPress={onApple}
        disabled={disabled}
        testID="apple-auth-btn"
      >
        <View style={styles.btnInner}>
          <Ionicons name="logo-apple" size={22} color={POGO.white} />
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
  row: {
    flexDirection: "row",
    gap: SPACE.xs,
  },
  btn: {
    flex: 1,
    minHeight: TOUCH.button,
    backgroundColor: AUTH.glass,
    borderRadius: RADIUS.md,
    borderWidth: BORDER.default,
    borderColor: AUTH.glassBorder,
  },
  btnInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACE.xs,
    paddingVertical: SPACE.xs,
    paddingHorizontal: SPACE.xs,
  },
  btnPressed: {
    opacity: 0.88,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: AUTH.text,
    fontWeight: "800",
    fontSize: TYPE.body - 2,
  },
  dividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    paddingVertical: SPACE.xs / 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AUTH.divider,
  },
  dividerText: {
    color: AUTH.textMuted,
    fontWeight: "700",
    fontSize: TYPE.caption,
  },
});
