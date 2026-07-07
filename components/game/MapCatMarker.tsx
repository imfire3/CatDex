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
  const isLegendary = cat.rarity === "légendaire";
  const isRare = cat.rarity === "rare";
  const shouldPulse = cat.recentlyObserved || isLegendary || (!cat.discovered && isRare);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (shouldPulse) {
      pulse.value = withRepeat(withTiming(isLegendary ? 1.22 : 1.12, { duration: isLegendary ? 900 : 1100 }), -1, true);
    }
  }, [shouldPulse, isLegendary, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: shouldPulse ? 2 - pulse.value : 1,
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
          {cat.isPopular || isLegendary ? (
            <Animated.View
              style={[
                styles.goldenAura,
                isLegendary && styles.legendaryAura,
                { borderColor: `${rarityColor}88`, backgroundColor: `${rarityColor}24` },
                pulseStyle,
              ]}
            />
          ) : null}
          {cat.favorite ? (
            <View style={styles.favBadge}>
              <Text style={styles.favIcon}>♥</Text>
            </View>
          ) : null}
          <View style={[styles.avatarRing, isLegendary && styles.avatarLegendary, { borderColor: cat.isPopular ? GAME.gold : rarityColor }]}>
            <Text style={styles.avatarEmoji}>{cat.avatar}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.silhouetteWrap}>
          <Animated.View style={[styles.silhouettePulse, { borderColor: `${rarityColor}88` }, pulseStyle]} />
          <View style={[styles.silhouette, { borderColor: `${rarityColor}AA` }, isLegendary && styles.legendarySilhouette]}>
            <Text style={[styles.silhouetteIcon, isLegendary && styles.legendaryIcon]}>🐱</Text>
          </View>
        </View>
      )}
      <View style={[styles.label, { backgroundColor: cat.discovered ? rarityColor : GAME.navyLight, borderColor: `${rarityColor}88` }]}>
        <Text style={styles.labelText} numberOfLines={1}>
          {cat.discovered ? cat.name : isLegendary ? "LÉGENDE" : "???"}
        </Text>
      </View>
    </Pressable>
  );
}

export const MapCatMarker = memo(MapCatMarkerComponent);

const styles = StyleSheet.create({
  wrap: { alignItems: "center", minWidth: 64, minHeight: 64 },
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
  legendaryAura: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
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
  avatarLegendary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
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
  legendarySilhouette: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(13,27,42,0.96)",
  },
  silhouetteIcon: { fontSize: 22, opacity: 0.5 },
  legendaryIcon: { fontSize: 28, opacity: 0.8 },
  silhouettePulse: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "rgba(90,200,250,0.45)",
  },
  label: {
    marginTop: GAME.space.xs,
    paddingHorizontal: 8,
    paddingVertical: GAME.space.xs,
    borderRadius: GAME.radius.full,
    maxWidth: 96,
    borderWidth: 1,
  },
  labelText: {
    color: GAME.text,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },
});
