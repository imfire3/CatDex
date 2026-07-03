import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, MapPin, Sparkles } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Chip } from "@/components/ui/Chip";
import { GAME, GRADIENTS, ELEVATION } from "@/constants/game";
import type { Zone } from "@/types/database";

type MapBottomSheetProps = {
  zoneLabel: string;
  zoneCity: string;
  catCount: number;
  favoritesCount: number;
  nearbyCount: number;
  discoveryRadiusKm: number;
  nearbyZones: { zone: Zone }[];
  selectedZoneId?: string;
  onSelectZone: (zone: Zone) => void;
  onCapture: () => void;
  bottomInset: number;
};

export function MapBottomSheet({
  zoneLabel,
  zoneCity,
  catCount,
  favoritesCount,
  nearbyCount,
  discoveryRadiusKm,
  nearbyZones,
  selectedZoneId,
  onSelectZone,
  onCapture,
  bottomInset,
}: MapBottomSheetProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(400).springify()}
      style={[styles.wrap, { bottom: bottomInset + GAME.layout.sheetBottomOffset }]}
    >
      <View style={styles.card}>
        <LinearGradient colors={[...GRADIENTS.primary]} style={styles.headerBand}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <View style={styles.headerIcon}>
              <MapPin color={GAME.text} size={18} strokeWidth={2.5} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerEyebrow}>ZONE ACTIVE</Text>
              <Text style={styles.zoneName}>
                {zoneLabel}
                {zoneCity ? ` · ${zoneCity}` : ""}
              </Text>
            </View>
            <View style={styles.statBubble}>
              <Text style={styles.statValue}>{catCount}</Text>
              <Text style={styles.statLabel}>chats</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {nearbyCount > 0 ? (
            <Pressable
              style={styles.captureCta}
              onPress={onCapture}
              accessibilityRole="button"
              accessibilityLabel={`Photographier, ${nearbyCount} chat${nearbyCount > 1 ? "s" : ""} à retrouver`}
            >
              <LinearGradient colors={[GAME.capture, "#FF6B5A"]} style={styles.captureGradient}>
                <View style={styles.captureIcon}>
                  <Camera color={GAME.text} size={22} strokeWidth={2.5} />
                </View>
                <View style={styles.captureBody}>
                  <Text style={styles.captureTitle}>
                    {nearbyCount} chat{nearbyCount > 1 ? "s" : ""} à retrouver
                  </Text>
                  <Text style={styles.captureSub}>Appuie pour photographier →</Text>
                </View>
                <Sparkles color="#FFE08A" size={18} />
              </LinearGradient>
            </Pressable>
          ) : null}

          {catCount === 0 ? (
            <Text style={styles.empty}>
              Aucun chat documenté dans {discoveryRadiusKm} km. Sois le premier à en photographier un !
            </Text>
          ) : (
            <Text style={styles.hint}>
              Les marqueurs indiquent où ces chats ont été vus — va sur place pour les retrouver.
            </Text>
          )}

          {favoritesCount > 0 ? (
            <View style={styles.favRow}>
              <Text style={styles.favLabel}>Favoris</Text>
              <Text style={styles.favValue}>♥ {favoritesCount}</Text>
            </View>
          ) : null}

          {nearbyZones.length > 0 ? (
            <View style={styles.chips}>
              {nearbyZones.map(({ zone }) => (
                <Chip
                  key={zone.id}
                  label={zone.name}
                  selected={selectedZoneId === zone.id}
                  onPress={() => onSelectZone(zone)}
                />
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: GAME.space.md,
    right: GAME.space.md,
  },
  card: {
    borderRadius: GAME.radius.lg,
    overflow: "hidden",
    backgroundColor: GAME.surface.light,
    ...ELEVATION.lg,
    borderWidth: 1,
    borderColor: GAME.surface.card,
  },
  headerBand: {
    paddingTop: GAME.space.sm,
    paddingBottom: GAME.space.md,
    paddingHorizontal: GAME.space.md,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.45)",
    marginBottom: GAME.space.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: GAME.space.sm,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1, gap: 2 },
  headerEyebrow: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  zoneName: {
    color: GAME.text,
    fontSize: GAME.type.subtitle,
    fontWeight: GAME.weight.black,
  },
  statBubble: {
    minWidth: 52,
    paddingHorizontal: GAME.space.sm,
    paddingVertical: GAME.space.xs,
    borderRadius: GAME.radius.full,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
  },
  statValue: { color: GAME.text, fontWeight: GAME.weight.black, fontSize: GAME.type.subtitle, lineHeight: 24 },
  statLabel: { color: "rgba(255,255,255,0.85)", fontSize: 10, fontWeight: "800" },
  body: {
    padding: GAME.space.md,
    gap: GAME.space.sm,
    backgroundColor: GAME.surface.light,
  },
  captureCta: { borderRadius: GAME.radius.md, overflow: "hidden" },
  captureGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: GAME.space.sm,
    padding: GAME.space.sm,
  },
  captureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureBody: { flex: 1 },
  captureTitle: { color: GAME.text, fontWeight: GAME.weight.black, fontSize: GAME.type.body },
  captureSub: { color: "rgba(255,255,255,0.9)", fontWeight: GAME.weight.semibold, fontSize: GAME.type.caption, marginTop: 2 },
  hint: {
    color: GAME.surface.lightTextMuted,
    fontSize: GAME.type.caption,
    lineHeight: 18,
    fontWeight: GAME.weight.medium,
  },
  empty: {
    color: GAME.surface.lightTextMuted,
    fontSize: GAME.type.caption,
    lineHeight: 18,
    fontWeight: GAME.weight.medium,
  },
  favRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: GAME.surface.card,
    borderRadius: GAME.radius.sm,
    paddingHorizontal: GAME.space.sm,
    paddingVertical: GAME.space.xs,
    borderWidth: 1,
    borderColor: GAME.surface.lightMuted,
  },
  favLabel: { color: GAME.surface.lightTextMuted, fontWeight: GAME.weight.semibold, fontSize: GAME.type.caption },
  favValue: { color: GAME.pink, fontWeight: GAME.weight.black, fontSize: GAME.type.body },
  chips: { flexDirection: "row", gap: GAME.space.sm, flexWrap: "wrap" },
});
