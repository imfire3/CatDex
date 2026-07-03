import { memo, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { GAME, RARITY_COLORS } from "@/constants/game";
import type { MockCat } from "@/data/mock";

type MapCatMarkerProps = {
  cat: MockCat;
  onPress: () => void;
};

function MapCatMarkerComponent({ cat, onPress }: MapCatMarkerProps) {
  const rarityColor = RARITY_COLORS[cat.rarity];
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (cat.recentlyObserved && !cat.discovered) {
      pulse.value = withRepeat(withTiming(1.12, { duration: 1000 }), -1, true);
    }
  }, [cat.recentlyObserved, cat.discovered, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: cat.recentlyObserved && !cat.discovered ? 2 - pulse.value : 1,
  }));

  return (
    <Pressable
      onPress={onPress}
      style={styles.wrap}
      accessibilityLabel={cat.discovered ? `Chat ${cat.name}` : "Chat mystérieux"}
      accessibilityRole="button"
    >
      {cat.discovered ? (
        <View style={styles.discoveredWrap}>
          {cat.isPopular ? <View style={styles.goldenAura} /> : null}
          {cat.favorite ? (
            <View style={styles.favBadge}>
              <Text style={styles.favIcon}>♥</Text>
            </View>
          ) : null}
          <View style={[styles.avatarRing, { borderColor: cat.isPopular ? GAME.gold : rarityColor }]}>
            <Text style={styles.avatarEmoji}>{cat.avatar}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.silhouetteWrap}>
          <Animated.View style={[styles.silhouettePulse, pulseStyle]} />
          <View style={styles.silhouette}>
            <Text style={styles.silhouetteIcon}>🐱</Text>
          </View>
        </View>
      )}
      <View style={[styles.label, { backgroundColor: cat.discovered ? rarityColor : GAME.navyLight }]}>
        <Text style={styles.labelText} numberOfLines={1}>
          {cat.discovered ? cat.name : "???"}
        </Text>
      </View>
    </Pressable>
  );
}

export const MapCatMarker = memo(MapCatMarkerComponent);

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  discoveredWrap: { alignItems: "center", justifyContent: "center" },
  goldenAura: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,204,0,0.22)",
    borderWidth: 2,
    borderColor: "rgba(255,204,0,0.55)",
  },
  favBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    zIndex: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: GAME.pink,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: GAME.text,
  },
  favIcon: { color: GAME.text, fontSize: 10, fontWeight: "900" },
  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    backgroundColor: GAME.navy,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  avatarEmoji: { fontSize: 26 },
  silhouetteWrap: { alignItems: "center", justifyContent: "center" },
  silhouette: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(13,27,42,0.9)",
    borderWidth: 2,
    borderColor: "rgba(90,200,250,0.5)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  silhouetteIcon: { fontSize: 22, opacity: 0.5 },
  silhouettePulse: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "rgba(90,200,250,0.45)",
  },
  label: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    maxWidth: 88,
  },
  labelText: {
    color: GAME.text,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },
});
