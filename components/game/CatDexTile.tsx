import { memo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CatAvatar3D } from "@/components/game/CatAvatar3D";
import { GAME, RARITY_COLORS } from "@/constants/game";
import type { MockCat } from "@/data/mock";

type CatDexTileProps = {
  cat: MockCat;
  index: number;
  onPress: () => void;
};

function CatDexTileComponent({ cat, index, onPress }: CatDexTileProps) {
  const rarityColor = RARITY_COLORS[cat.rarity];

  return (
    <Pressable
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={cat.discovered ? `Chat ${cat.name}, ${cat.zone}` : "Chat inconnu"}
    >
      <LinearGradient
        colors={cat.discovered ? [GAME.navyLight, GAME.navy] : ["#1a1a2e", "#0d1b2a"]}
        style={[styles.gradient, cat.discovered && { borderColor: `${rarityColor}55` }]}
      >
        <Text style={styles.index}>#{String(index).padStart(2, "0")}</Text>
        {cat.discovered ? (
          <View style={styles.discovered}>
            <View style={[styles.avatarRing, { borderColor: rarityColor }]}>
              <CatAvatar3D modelId={cat.modelId} emoji={cat.avatar} size={52} />
            </View>
            <Image source={{ uri: cat.heroImage }} style={styles.photoThumb} />
          </View>
        ) : (
          <View style={styles.unknown}>
            <Text style={styles.unknownIcon}>?</Text>
            <Text style={styles.unknownHint}>À découvrir</Text>
          </View>
        )}
        <Text style={styles.name} numberOfLines={1}>
          {cat.discovered ? cat.name : "???"}
        </Text>
        <Text style={styles.zone} numberOfLines={1}>
          {cat.discovered ? cat.zone : "—"}
        </Text>
        {cat.discovered ? (
          <View style={[styles.rarityPill, { backgroundColor: `${rarityColor}33` }]}>
            <Text style={[styles.rarityText, { color: rarityColor }]}>{cat.rarity}</Text>
          </View>
        ) : null}
      </LinearGradient>
    </Pressable>
  );
}

export const CatDexTile = memo(CatDexTileComponent);

const styles = StyleSheet.create({
  tile: {
    width: "100%",
    borderRadius: GAME.radius.md,
    overflow: "hidden",
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  gradient: {
    padding: GAME.space.md,
    minHeight: 192,
    gap: GAME.space.xs,
    alignItems: "center",
    borderWidth: 1,
    borderColor: GAME.glassBorder,
    borderRadius: GAME.radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  index: {
    alignSelf: "flex-start",
    color: GAME.textDim,
    fontSize: GAME.type.micro,
    fontWeight: GAME.weight.black,
  },
  discovered: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 96,
    marginVertical: GAME.space.xs,
  },
  avatarRing: {
    borderWidth: 2,
    borderRadius: GAME.radius.md,
    padding: GAME.space.xs,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  photoThumb: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: GAME.glassBorder,
    opacity: 0.9,
  },
  unknown: {
    width: "100%",
    height: 96,
    borderRadius: GAME.radius.sm,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: GAME.space.xs,
    borderWidth: 1,
    borderColor: GAME.glassBorder,
    borderStyle: "dashed",
    gap: GAME.space.xs,
  },
  unknownIcon: {
    color: GAME.textDim,
    fontSize: 28,
    fontWeight: GAME.weight.black,
  },
  unknownHint: {
    color: GAME.textDim,
    fontSize: GAME.type.micro,
    fontWeight: GAME.weight.bold,
  },
  name: {
    color: GAME.text,
    fontSize: GAME.type.body,
    fontWeight: GAME.weight.black,
    textAlign: "center",
    width: "100%",
  },
  zone: {
    color: GAME.textMuted,
    fontSize: GAME.type.caption,
    fontWeight: GAME.weight.semibold,
    textAlign: "center",
    width: "100%",
  },
  rarityPill: {
    alignSelf: "center",
    paddingHorizontal: GAME.space.xs,
    paddingVertical: GAME.space.xs,
    borderRadius: GAME.radius.full,
    marginTop: GAME.space.xs,
  },
  rarityText: {
    fontSize: GAME.type.micro,
    fontWeight: GAME.weight.black,
    textTransform: "capitalize",
  },
});
