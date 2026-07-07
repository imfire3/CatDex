import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, Vibration, View, type PressableProps, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ELEVATION, GAME, GRADIENTS, TEXT } from "@/constants/game";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type GameButtonProps = PressableProps & {
  label: string;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "capture" | "ghost";
};

export function GameButton({
  label,
  icon: Icon,
  variant = "primary",
  disabled,
  style,
  onPressIn,
  onPressOut,
  accessibilityLabel,
  ...props
}: GameButtonProps) {
  const scale = useSharedValue(1);
  const colors =
    variant === "secondary"
      ? GRADIENTS.gold
      : variant === "capture"
        ? GRADIENTS.captureAction
        : GRADIENTS.primary;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn: PressableProps["onPressIn"] = (event) => {
    if (!disabled) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 380 });
      Vibration.vibrate(8);
    }
    onPressIn?.(event);
  };

  const handlePressOut: PressableProps["onPressOut"] = (event) => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    onPressOut?.(event);
  };

  const content = (
    <View style={styles.buttonContent}>
      {Icon ? <Icon color={variant === "secondary" ? GAME.navy : GAME.text} size={20} strokeWidth={2.5} /> : null}
      <Text style={[styles.buttonText, variant === "secondary" && styles.buttonTextDark]}>{label}</Text>
    </View>
  );

  return (
    <AnimatedPressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.buttonShell,
        animStyle,
        disabled && styles.disabled,
        typeof style === "function" ? style({ pressed: false, hovered: false } as any) : style,
      ]}
      {...props}
    >
      {variant === "ghost" ? (
        <View style={styles.ghostButton}>{content}</View>
      ) : (
        <LinearGradient colors={[...colors]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientButton}>
          {content}
        </LinearGradient>
      )}
    </AnimatedPressable>
  );
}

export function StatCard({
  label,
  value,
  caption,
  icon,
  accent = GAME.sky,
  progress,
  style,
}: {
  label: string;
  value: string | number;
  caption?: string;
  icon?: ReactNode;
  accent?: string;
  progress?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.statCard, { borderColor: `${accent}55` }, style]}>
      <View style={[styles.statIcon, { backgroundColor: `${accent}24` }]}>{icon ?? <Text style={styles.statDot}>•</Text>}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {caption ? <Text style={styles.statCaption}>{caption}</Text> : null}
      {progress !== undefined ? <ProgressBar progress={progress} height={8} variant="gold" style={styles.statProgress} /> : null}
    </View>
  );
}

export function RewardToast({ xp, label = "Récompense récupérée" }: { xp: number; label?: string }) {
  return (
    <View style={styles.rewardToast} accessibilityLiveRegion="polite">
      <Text style={styles.rewardEmoji}>✨</Text>
      <View>
        <Text style={styles.rewardTitle}>{label}</Text>
        <Text style={styles.rewardXp}>+{xp} XP</Text>
      </View>
    </View>
  );
}

export function MissionCard({
  emoji,
  title,
  description,
  current,
  target,
  xpReward,
  completed,
  claimed,
  onClaim,
}: {
  emoji: string;
  title: string;
  description: string;
  current: number;
  target: number;
  xpReward: number;
  completed: boolean;
  claimed: boolean;
  onClaim: () => void;
}) {
  const progress = Math.min((current / target) * 100, 100);
  const ready = completed && !claimed;

  return (
    <View style={[styles.missionCard, ready && styles.missionReady]}>
      <View style={styles.missionHeader}>
        <View style={[styles.missionEmojiWrap, ready && styles.missionEmojiReady]}>
          <Text style={styles.missionEmoji}>{emoji}</Text>
        </View>
        <View style={styles.missionBody}>
          <Text style={styles.missionTitle}>{title}</Text>
          <Text style={styles.missionDesc}>{description}</Text>
        </View>
        <View style={[styles.xpPill, ready && styles.xpPillReady]}>
          <Text style={[styles.xpPillText, ready && styles.xpPillTextReady]}>+{xpReward}</Text>
        </View>
      </View>
      <ProgressBar progress={progress} variant={ready ? "gold" : "sky"} label={`${current}/${target}`} />
      <View style={styles.missionFooter}>
        <Text style={styles.missionState}>
          {claimed ? "Réclamé" : ready ? "Prêt à récupérer" : "En cours"}
        </Text>
        {ready ? <GameButton label="Réclamer" variant="secondary" onPress={onClaim} style={styles.claimButton} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonShell: {
    minHeight: GAME.touch.button,
    borderRadius: GAME.radius.full,
    overflow: "hidden",
    ...ELEVATION.md,
  },
  disabled: { opacity: GAME.opacity.disabled },
  gradientButton: {
    minHeight: GAME.touch.button,
    borderRadius: GAME.radius.full,
    justifyContent: "center",
    paddingHorizontal: GAME.space.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  ghostButton: {
    minHeight: GAME.touch.button,
    borderRadius: GAME.radius.full,
    justifyContent: "center",
    paddingHorizontal: GAME.space.lg,
    backgroundColor: GAME.glassToken.default,
    borderWidth: 1,
    borderColor: GAME.glassBorder,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: GAME.space.xs,
  },
  buttonText: { color: GAME.text, fontSize: GAME.type.body, fontWeight: GAME.weight.black },
  buttonTextDark: { color: GAME.navy },
  statCard: {
    flex: 1,
    minWidth: 136,
    borderRadius: GAME.radius.lg,
    backgroundColor: GAME.glassToken.default,
    borderWidth: 1,
    padding: GAME.space.md,
    gap: GAME.space.xs,
    ...ELEVATION.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: GAME.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  statDot: { color: GAME.sky, fontSize: GAME.icon.md },
  statValue: { ...TEXT.title },
  statLabel: { ...TEXT.label },
  statCaption: { ...TEXT.micro, color: GAME.textMuted },
  statProgress: { marginTop: GAME.space.xs },
  rewardToast: {
    position: "absolute",
    top: 96,
    alignSelf: "center",
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: GAME.space.sm,
    backgroundColor: GAME.glassToken.premium,
    borderColor: "rgba(255,204,0,0.5)",
    borderWidth: 1,
    paddingHorizontal: GAME.space.lg,
    paddingVertical: GAME.space.sm,
    borderRadius: GAME.radius.full,
    ...ELEVATION.glow,
  },
  rewardEmoji: { fontSize: GAME.icon.md },
  rewardTitle: { color: GAME.text, fontWeight: GAME.weight.black, fontSize: GAME.type.caption },
  rewardXp: { color: GAME.gold, fontWeight: GAME.weight.black, fontSize: GAME.type.caption },
  missionCard: {
    gap: GAME.space.md,
    borderRadius: GAME.radius.lg,
    backgroundColor: GAME.glassToken.default,
    borderWidth: 1,
    borderColor: GAME.glassBorder,
    padding: GAME.space.md,
    ...ELEVATION.sm,
  },
  missionReady: {
    borderColor: "rgba(255,204,0,0.65)",
    backgroundColor: "rgba(255,204,0,0.12)",
  },
  missionHeader: { flexDirection: "row", alignItems: "center", gap: GAME.space.sm },
  missionEmojiWrap: {
    width: 48,
    height: 48,
    borderRadius: GAME.radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GAME.glassToken.strong,
  },
  missionEmojiReady: { backgroundColor: "rgba(255,204,0,0.22)" },
  missionEmoji: { fontSize: GAME.icon.md },
  missionBody: { flex: 1, gap: GAME.space.xs },
  missionTitle: { color: GAME.text, fontSize: GAME.type.body, fontWeight: GAME.weight.black },
  missionDesc: { ...TEXT.caption },
  xpPill: {
    paddingHorizontal: GAME.space.sm,
    paddingVertical: GAME.space.xs,
    borderRadius: GAME.radius.full,
    backgroundColor: GAME.glassToken.subtle,
  },
  xpPillReady: { backgroundColor: GAME.gold },
  xpPillText: { color: GAME.textMuted, fontWeight: GAME.weight.black, fontSize: GAME.type.caption },
  xpPillTextReady: { color: GAME.navy },
  missionFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: GAME.space.md },
  missionState: { ...TEXT.caption, color: GAME.textMuted },
  claimButton: { minWidth: 128, elevation: 0 },
});
