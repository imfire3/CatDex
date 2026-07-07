import { Pressable, StyleSheet, Text, Vibration, View, type PressableProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";
import { GAME, GRADIENTS } from "@/constants/game";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type FloatingButtonProps = PressableProps & {
  label?: string;
  icon?: LucideIcon;
  variant?: "primary" | "capture" | "ghost" | "glass";
  size?: "md" | "lg" | "xl";
};

const SIZES = {
  md: { height: 52, fontSize: GAME.type.body, icon: 20, padH: GAME.space.lg },
  lg: { height: 60, fontSize: GAME.type.subtitle, icon: 24, padH: GAME.space.xl },
  xl: { height: 72, fontSize: GAME.type.title, icon: 28, padH: GAME.space.xl },
};

export function FloatingButton({
  label,
  icon: Icon,
  variant = "primary",
  size = "lg",
  style,
  onPressIn,
  onPressOut,
  accessibilityLabel,
  ...props
}: FloatingButtonProps) {
  const scale = useSharedValue(1);
  const s = SIZES[size];

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const content = (
    <View style={[styles.row, { paddingHorizontal: s.padH, minHeight: s.height }]}>
      {Icon ? <Icon color={GAME.text} size={s.icon} strokeWidth={2.5} /> : null}
      {label ? <Text style={[styles.label, { fontSize: s.fontSize }]}>{label}</Text> : null}
    </View>
  );

  const handlePressIn: PressableProps["onPressIn"] = (e) => {
    scale.value = withSpring(0.94, { damping: 15, stiffness: 400 });
    if (!props.disabled) Vibration.vibrate(8);
    onPressIn?.(e);
  };

  const handlePressOut: PressableProps["onPressOut"] = (e) => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    onPressOut?.(e);
  };

  const a11yLabel = accessibilityLabel ?? label ?? (Icon ? "Action" : undefined);
  const a11yProps = {
    accessibilityRole: "button" as const,
    ...(a11yLabel ? { accessibilityLabel: a11yLabel } : {}),
  };

  if (variant === "primary") {
    return (
      <AnimatedPressable
        style={[styles.shadow, animStyle, style]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...a11yProps}
        {...props}
      >
        <LinearGradient
          colors={[...GRADIENTS.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.btn, { borderRadius: s.height / 2 }]}
        >
          {content}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  if (variant === "capture") {
    return (
      <AnimatedPressable
        style={[styles.captureShadow, animStyle, style]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...a11yProps}
        {...props}
      >
        <LinearGradient
          colors={[...GRADIENTS.captureAction]}
          style={[styles.captureBtn, { width: s.height + 16, height: s.height + 16, borderRadius: (s.height + 16) / 2 }]}
        >
          {Icon ? <Icon color={GAME.text} size={s.icon + 8} strokeWidth={2} /> : null}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  const bgStyle =
    variant === "glass"
      ? { backgroundColor: GAME.glass, borderColor: GAME.glassBorder, borderWidth: 1 }
      : { backgroundColor: "transparent" };

  return (
    <AnimatedPressable
      style={[styles.shadow, animStyle, styles.btn, { borderRadius: s.height / 2 }, bgStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...a11yProps}
      {...props}
    >
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: GAME.space.sm,
  },
  label: {
    color: GAME.text,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  shadow: {
    shadowColor: GAME.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  captureBtn: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.9)",
  },
  captureShadow: {
    shadowColor: GAME.captureGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
});
