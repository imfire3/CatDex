import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { GAME } from "@/constants/game";
import { getModelPreset } from "@/gameplay/models/cat-model-catalog";
import type { CatModelId } from "@/gameplay/types";

type CatAvatar3DProps = {
  emoji?: string;
  modelId?: CatModelId;
  size?: number;
};

export function CatAvatar3D({ emoji, modelId = "tabby_short", size = 120 }: CatAvatar3DProps) {
  const preset = getModelPreset(modelId);
  const rotate = useSharedValue(0);

  useEffect(() => {
    rotate.value = withRepeat(withTiming(1, { duration: 4000 }), -1, true);
  }, [rotate]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateY: `${rotate.value * 12 - 6}deg` },
      { rotateX: `${rotate.value * 6 - 3}deg` },
    ],
  }));

  const bodySize = size * preset.furScale;
  const displayEmoji = emoji ?? preset.emoji;

  return (
    <Animated.View style={[styles.wrap, { width: size + 40, height: size + 40 }, animStyle]}>
      <LinearGradient
        colors={[`${preset.accentColor}55`, `${preset.bodyColors[0]}33`]}
        style={[styles.glow, { borderRadius: (size + 40) / 2 }]}
      />
      <View style={[styles.body, { width: bodySize, height: bodySize * 0.92, borderRadius: bodySize * 0.45 }]}>
        <LinearGradient
          colors={preset.bodyColors}
          style={[StyleSheet.absoluteFill, { borderRadius: bodySize * 0.45 }]}
        />
        {preset.pattern === "tabby" ? (
          <View style={styles.tabbyStripes}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.stripe,
                  {
                    top: 18 + i * 14,
                    backgroundColor: preset.accentColor,
                    opacity: 0.35,
                  },
                ]}
              />
            ))}
          </View>
        ) : null}
        {preset.pattern === "calico" ? (
          <>
            <View style={[styles.patch, { top: 12, left: 10, backgroundColor: preset.accentColor }]} />
            <View style={[styles.patch, { top: 28, right: 8, backgroundColor: "#e8a0bf" }]} />
          </>
        ) : null}
        {preset.pattern === "tuxedo" ? (
          <View style={[styles.tuxChest, { backgroundColor: preset.accentColor }]} />
        ) : null}
        {preset.pattern === "points" ? (
          <>
            <View style={[styles.point, { left: 8, backgroundColor: preset.earColor }]} />
            <View style={[styles.point, { right: 8, backgroundColor: preset.earColor }]} />
          </>
        ) : null}
        <View style={[styles.ear, styles.earLeft, { borderBottomColor: preset.earColor }]} />
        <View style={[styles.ear, styles.earRight, { borderBottomColor: preset.earColor }]} />
        <View style={styles.face}>
          <View style={[styles.eye, { backgroundColor: preset.eyeColor }]} />
          <View style={[styles.eye, { backgroundColor: preset.eyeColor }]} />
          <Text style={[styles.emojiFace, { fontSize: bodySize * 0.22 }]}>{displayEmoji}</Text>
        </View>
        <View style={[styles.tail, { backgroundColor: preset.bodyColors[1] }]} />
      </View>
      <View style={styles.shadow} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  glow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  body: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.35)",
    overflow: "hidden",
    shadowColor: GAME.sky,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  tabbyStripes: { ...StyleSheet.absoluteFillObject },
  stripe: {
    position: "absolute",
    left: 8,
    right: 8,
    height: 4,
    borderRadius: 2,
  },
  patch: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    opacity: 0.8,
  },
  tuxChest: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  point: {
    position: "absolute",
    top: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    opacity: 0.85,
  },
  ear: {
    position: "absolute",
    top: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 16,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  earLeft: { left: 14 },
  earRight: { right: 14 },
  face: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  eye: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emojiFace: {
    position: "absolute",
    bottom: -4,
    opacity: 0.9,
  },
  tail: {
    position: "absolute",
    right: -10,
    bottom: 12,
    width: 14,
    height: 28,
    borderRadius: 8,
    transform: [{ rotate: "25deg" }],
  },
  shadow: {
    position: "absolute",
    bottom: -8,
    width: 60,
    height: 12,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
});
