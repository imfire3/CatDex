import { StyleSheet, Text, View } from "react-native";
import { GAME } from "@/constants/game";
import type { GameMapProps } from "./GameMap.types";

/** Web fallback — CatDex map requires native modules (react-native-maps / Mapbox). */
export function GameMapWeb({ markers }: GameMapProps) {
  return (
    <View style={styles.root}>
      <View style={styles.grid}>
        {Array.from({ length: 48 }).map((_, i) => (
          <View key={i} style={styles.cell} />
        ))}
      </View>
      <View style={styles.overlay}>
        <Text style={styles.emoji}>🗺️</Text>
        <Text style={styles.title}>Carte disponible sur mobile</Text>
        <Text style={styles.subtitle}>
          Scanne le QR code Expo Go sur ton téléphone pour utiliser la carte.
        </Text>
        {markers.length > 0 ? (
          <Text style={styles.count}>
            {markers.length} chat{markers.length > 1 ? "s" : ""} à proximité
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: GAME.navyLight,
    overflow: "hidden",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    opacity: 0.35,
  },
  cell: {
    width: "12.5%",
    aspectRatio: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(90,200,250,0.15)",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: GAME.space.xl,
    gap: GAME.space.sm,
    backgroundColor: "rgba(13,27,42,0.55)",
  },
  emoji: { fontSize: 48 },
  title: {
    color: GAME.text,
    fontSize: GAME.type.subtitle,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: GAME.textMuted,
    fontSize: GAME.type.body,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
  count: {
    color: GAME.sky,
    fontWeight: "800",
    fontSize: GAME.type.caption,
    marginTop: GAME.space.sm,
  },
});
