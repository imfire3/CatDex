import { Pressable, StyleSheet, Text, View } from "react-native";
import { Camera, MapPin } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { GlassCard } from "@/components/game/GlassCard";
import { Chip } from "@/components/ui/Chip";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GAME } from "@/constants/game";
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
      style={[styles.wrap, { bottom: bottomInset + 88 }]}
    >
      <GlassCard style={styles.sheet} padding={GAME.space.md}>
        <View style={styles.handle} accessibilityElementsHidden />

        {nearbyCount > 0 ? (
          <Pressable
            style={styles.captureCta}
            onPress={onCapture}
            accessibilityRole="button"
            accessibilityLabel={`Photographier, ${nearbyCount} chat${nearbyCount > 1 ? "s" : ""} à retrouver`}
          >
            <View style={styles.captureIcon}>
              <Camera color={GAME.text} size={20} strokeWidth={2.5} />
            </View>
            <View style={styles.captureBody}>
              <Text style={styles.captureTitle}>
                {nearbyCount} chat{nearbyCount > 1 ? "s" : ""} à retrouver
              </Text>
              <Text style={styles.captureSub}>Photographier sur place →</Text>
            </View>
            <MapPin color={GAME.gold} size={18} />
          </Pressable>
        ) : null}

        <View style={styles.header}>
          <View style={styles.headerText}>
            <SectionLabel>Repérages à proximité</SectionLabel>
            <Text style={styles.zoneName}>
              {zoneLabel}
              {zoneCity ? ` · ${zoneCity}` : ""}
            </Text>
          </View>
          <View style={styles.stats}>
            <Text style={styles.count}>{catCount}</Text>
            {favoritesCount > 0 ? (
              <Text style={styles.fav}>♥ {favoritesCount}</Text>
            ) : null}
          </View>
        </View>

        {catCount === 0 ? (
          <Text style={styles.empty}>
            Aucun chat documenté dans {discoveryRadiusKm} km. Sois le premier à en photographier un !
          </Text>
        ) : (
          <Text style={styles.hint}>
            Les marqueurs indiquent où ces chats ont été vus — va sur place pour les retrouver.
          </Text>
        )}

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
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: GAME.space.md,
    right: GAME.space.md,
  },
  sheet: { gap: GAME.space.sm },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginBottom: GAME.space.xs,
  },
  captureCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: GAME.space.sm,
    backgroundColor: "rgba(255,204,0,0.12)",
    borderRadius: GAME.radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,204,0,0.45)",
    padding: GAME.space.sm,
    marginBottom: GAME.space.xs,
  },
  captureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GAME.capture,
    alignItems: "center",
    justifyContent: "center",
  },
  captureBody: { flex: 1 },
  captureTitle: { color: GAME.text, fontWeight: GAME.weight.black, fontSize: GAME.type.body },
  captureSub: { color: GAME.gold, fontWeight: GAME.weight.bold, fontSize: GAME.type.caption, marginTop: 2 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: GAME.space.sm,
  },
  headerText: { flex: 1, gap: 4 },
  zoneName: { color: GAME.text, fontSize: GAME.type.subtitle, fontWeight: GAME.weight.black },
  stats: { alignItems: "flex-end", gap: 2 },
  count: {
    color: GAME.sky,
    fontWeight: GAME.weight.black,
    fontSize: GAME.type.title,
    lineHeight: 32,
  },
  fav: { color: GAME.pink, fontWeight: GAME.weight.bold, fontSize: GAME.type.caption },
  hint: {
    color: GAME.textMuted,
    fontSize: GAME.type.caption,
    lineHeight: 18,
    fontWeight: GAME.weight.medium,
  },
  empty: {
    color: GAME.textMuted,
    fontSize: GAME.type.caption,
    lineHeight: 18,
    fontWeight: GAME.weight.medium,
  },
  chips: { flexDirection: "row", gap: GAME.space.sm, flexWrap: "wrap" },
});
