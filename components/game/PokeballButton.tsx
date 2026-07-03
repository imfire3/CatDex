import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { GAME } from "@/constants/game";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PokeballButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  size?: number;
};

export function PokeballButton({ onPress, disabled, size = 80 }: PokeballButtonProps) {
  const scale = useSharedValue(1);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.06, { duration: 1400 }), -1, true);
  }, [pulse]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulse.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.5 + (pulse.value - 1) * 3,
  }));

  const outer = size + 20;
  const inner = size;
  const band = Math.max(6, size * 0.09);
  const button = Math.max(22, size * 0.32);

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.ring,
          ringStyle,
          { width: outer + 16, height: outer + 16, borderRadius: (outer + 16) / 2 },
        ]}
      />
      <AnimatedPressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => {
          scale.value = withSpring(0.9, { damping: 14, stiffness: 380 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 300 });
        }}
        style={[animStyle, styles.pressable]}
        accessibilityRole="button"
        accessibilityLabel="Prendre une photo"
      >
        <View
          style={[
            styles.shell,
            {
              width: inner,
              height: inner,
              borderRadius: inner / 2,
              borderWidth: band * 0.55,
            },
          ]}
        >
          <LinearGradient colors={["#FF5A52", "#E02020"]} style={styles.topHalf} />
          <View style={[styles.midBand, { height: band, marginTop: -band / 2 }]} />
          <LinearGradient colors={["#FFFFFF", "#E8EEF5"]} style={styles.bottomHalf} />
          <View
            style={[
              styles.centerButton,
              {
                width: button,
                height: button,
                borderRadius: button / 2,
                borderWidth: band * 0.45,
                marginTop: -button / 2,
                marginLeft: -button / 2,
              },
            ]}
          >
            <View style={[styles.centerInner, { width: button * 0.42, height: button * 0.42, borderRadius: button * 0.21 }]} />
          </View>
        </View>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  ring: {
    position: "absolute",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.35)",
  },
  pressable: {
    shadowColor: GAME.captureGlow,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  shell: {
    overflow: "hidden",
    borderColor: "#1A1A1A",
    backgroundColor: "#FFF",
  },
  topHalf: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  bottomHalf: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  midBand: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    backgroundColor: "#1A1A1A",
    zIndex: 2,
  },
  centerButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    backgroundColor: "#FFF",
    borderColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  centerInner: {
    backgroundColor: "#D8DEE8",
    borderWidth: 2,
    borderColor: "#A8B0BC",
  },
});
