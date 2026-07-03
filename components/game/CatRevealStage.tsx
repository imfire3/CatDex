import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { CatAvatar3D } from "@/components/game/CatAvatar3D";
import { GAME } from "@/constants/game";
import type { CatModelId } from "@/gameplay/types";

type CatRevealStageProps = {
  modelId: CatModelId;
  photoUri?: string | null;
  size?: number;
};

export function CatRevealStage({ modelId, photoUri, size = 160 }: CatRevealStageProps) {
  const ring = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    ring.value = withRepeat(withTiming(1, { duration: 2800 }), -1, false);
    float.value = withRepeat(withTiming(1, { duration: 2200 }), -1, true);
  }, [ring, float]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.92 + ring.value * 0.12 }, { rotate: `${ring.value * 360}deg` }],
    opacity: 0.35 + ring.value * 0.25,
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value * -6 }],
  }));

  return (
    <Animated.View entering={FadeIn.springify()} style={styles.stage}>
      <LinearGradient
        colors={["rgba(90,200,250,0.18)", "rgba(13,27,42,0.05)", "rgba(255,204,0,0.12)"]}
        style={styles.backdrop}
      />

      <Animated.View style={[styles.orbitRing, ringStyle]}>
        <View style={styles.orbitDash} />
        <View style={[styles.orbitDash, styles.orbitDashB]} />
        <View style={[styles.orbitDash, styles.orbitDashC]} />
        <View style={[styles.orbitDash, styles.orbitDashD]} />
      </Animated.View>

      <LinearGradient colors={["#4A90D9", "#2E5FA8"]} style={styles.pedestalTop} />
      <View style={styles.pedestalBase} />

      <Animated.View style={[styles.modelWrap, floatStyle]}>
        <CatAvatar3D modelId={modelId} size={size} />
      </Animated.View>

      {photoUri ? (
        <View style={styles.photoThumb}>
          <Image source={{ uri: photoUri }} style={styles.photoImage} />
          <View style={styles.photoBadge} />
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stage: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: GAME.space.sm,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: GAME.radius.lg,
    borderWidth: 2,
    borderColor: "rgba(90,200,250,0.35)",
  },
  orbitRing: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: "rgba(90,200,250,0.45)",
    borderStyle: "dashed",
  },
  orbitDash: {
    position: "absolute",
    top: -4,
    left: "50%",
    marginLeft: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GAME.sky,
  },
  orbitDashB: { top: "50%", left: -4, marginTop: -4, marginLeft: 0 },
  orbitDashC: { top: "auto", bottom: -4, left: "50%", marginLeft: -4 },
  orbitDashD: { top: "50%", right: -4, left: "auto", marginTop: -4 },
  pedestalTop: {
    position: "absolute",
    bottom: 28,
    width: 180,
    height: 28,
    borderRadius: 14,
    opacity: 0.9,
  },
  pedestalBase: {
    position: "absolute",
    bottom: 16,
    width: 220,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  modelWrap: {
    marginBottom: 36,
    zIndex: 2,
  },
  photoThumb: {
    position: "absolute",
    right: GAME.space.md,
    bottom: GAME.space.md,
    width: 56,
    height: 56,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: GAME.gold,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  photoImage: { width: "100%", height: "100%" },
  photoBadge: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 12,
  },
});
