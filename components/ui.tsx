import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import type { ReactNode } from "react";
import { BORDER, POGO, RADIUS, SPACE, TOUCH, TYPE, AUTH } from "@/constants/theme";

type ButtonProps = PressableProps & {
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "capture" | "outline" | "outlineLight";
  icon?: ReactNode;
  size?: "default" | "compact";
  fullBleed?: boolean;
  buttonStyle?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = "primary",
  icon,
  size = "default",
  fullBleed = false,
  disabled,
  buttonStyle,
  style,
  ...props
}: ButtonProps) {
  const palette = {
    primary: { bg: POGO.sky, text: POGO.navy, border: POGO.skyDark },
    secondary: { bg: POGO.gold, text: POGO.navy, border: POGO.goldDark },
    capture: { bg: POGO.capture, text: POGO.white, border: POGO.captureDark },
    ghost: { bg: POGO.panel, text: POGO.white, border: POGO.sky },
    outline: { bg: "transparent", text: POGO.white, border: POGO.sky },
    outlineLight: { bg: "transparent", text: AUTH.text, border: POGO.sky },
  }[variant];

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        size === "compact" && styles.buttonCompact,
        fullBleed && styles.buttonFullBleed,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
        buttonStyle,
        typeof style === "function" ? style({ pressed, hovered: false }) : style,
      ]}
      {...props}
    >
      <View style={styles.buttonContent}>
        {icon ? <View style={styles.buttonIcon}>{icon}</View> : null}
        <Text style={[styles.buttonText, { color: palette.text }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

type TextFieldProps = TextInputProps & {
  label?: string;
  variant?: "dark" | "light" | "glass";
};

export function TextField({ label, variant = "dark", style, ...props }: TextFieldProps) {
  const light = variant === "light";
  const glass = variant === "glass";

  return (
    <View style={styles.field}>
      {label ? (
        <Text
          style={[
            styles.fieldLabel,
            light && styles.fieldLabelLight,
            glass && styles.fieldLabelGlass,
          ]}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={glass ? AUTH.textMuted : light ? AUTH.textMuted : POGO.textMuted}
        style={[styles.input, light && styles.inputLight, glass && styles.inputGlass, style]}
        {...props}
      />
    </View>
  );
}

export function ScreenContainer({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function SectionTitle({
  title,
  subtitle,
  light,
}: {
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, light && styles.sectionTitleLight]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.sectionSubtitle, light && styles.sectionSubtitleLight]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export function CatCardPreview({
  name,
  zone,
  color,
  breed,
  pattern,
  photoUrl,
  onPress,
}: {
  name: string;
  zone: string;
  color?: string | null;
  breed?: string | null;
  pattern?: string | null;
  photoUrl?: string | null;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.cardImageWrap, { backgroundColor: `${color ?? POGO.sky}33` }]}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.cardImage} />
        ) : (
          <Text style={styles.cardEmoji}>🐱</Text>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{name}</Text>
        <Text style={styles.cardZone}>{zone}</Text>
        <Text style={styles.cardTraits}>
          {[color, breed, pattern].filter(Boolean).join(" · ")}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: POGO.navy,
    paddingHorizontal: SPACE.sm,
  },
  button: {
    minHeight: TOUCH.button,
    width: "100%",
    borderRadius: RADIUS.button,
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xs,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: BORDER.default,
    overflow: "hidden",
  },
  buttonCompact: {
    minHeight: SPACE.xs + TYPE.body + SPACE.xs,
    paddingVertical: SPACE.xs,
  },
  buttonFullBleed: {
    borderRadius: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACE.xs,
  },
  buttonIcon: {
    width: SPACE.md,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "900",
    fontSize: TYPE.body,
    letterSpacing: 0.3,
  },
  field: {
    gap: SPACE.xs / 2,
  },
  fieldLabel: {
    color: POGO.textMuted,
    fontWeight: "700",
    fontSize: TYPE.caption,
    marginBottom: SPACE.xs / 2,
  },
  fieldLabelGlass: {
    color: AUTH.text,
    fontSize: TYPE.body - 2,
    fontWeight: "700",
  },
  fieldLabelLight: {
    color: AUTH.text,
    fontSize: TYPE.body - 2,
    fontWeight: "800",
  },
  input: {
    minHeight: TOUCH.min,
    backgroundColor: POGO.panel,
    borderRadius: RADIUS.button,
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xs,
    color: POGO.white,
    borderWidth: BORDER.default,
    borderColor: POGO.panelLight,
    fontWeight: "600",
    fontSize: TYPE.body,
  },
  inputLight: {
    backgroundColor: AUTH.input,
    borderColor: AUTH.inputBorder,
    color: AUTH.text,
  },
  inputGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderColor: AUTH.glassBorder,
    color: AUTH.text,
    borderRadius: RADIUS.md,
  },
  section: {
    marginBottom: SPACE.sm,
  },
  sectionTitle: {
    fontSize: TYPE.title,
    fontWeight: "900",
    color: POGO.navy,
  },
  sectionTitleLight: {
    color: POGO.white,
  },
  sectionSubtitle: {
    fontSize: TYPE.caption,
    color: POGO.textMuted,
    marginTop: SPACE.xs / 2,
  },
  sectionSubtitleLight: {
    color: POGO.textMuted,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: POGO.panelLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACE.xs + 4,
    paddingVertical: SPACE.xs / 2,
    borderWidth: BORDER.hairline,
    borderColor: POGO.sky,
  },
  badgeText: {
    color: POGO.sky,
    fontSize: TYPE.caption,
    fontWeight: "800",
  },
  card: {
    borderRadius: RADIUS.md + 2,
    overflow: "hidden",
    backgroundColor: POGO.panel,
    borderWidth: BORDER.default,
    borderColor: POGO.panelLight,
  },
  cardImageWrap: {
    height: SPACE.xxl * 3,
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardEmoji: {
    fontSize: SPACE.xxl - 6,
  },
  cardBody: {
    padding: SPACE.xs + 4,
    gap: SPACE.xs / 4,
  },
  cardName: {
    color: POGO.white,
    fontWeight: "900",
    fontSize: TYPE.body - 1,
  },
  cardZone: {
    color: POGO.textMuted,
    fontSize: TYPE.caption,
  },
  cardTraits: {
    color: POGO.sky,
    fontSize: TYPE.caption - 1,
    fontWeight: "700",
  },
});
