import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Menu } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { GameMap } from "@/components/map/GameMap";
import { regionFromCoords } from "@/components/map/GameMap.types";
import { MapControls } from "@/components/map/MapControls";
import { MapBottomSheet } from "@/components/map/MapBottomSheet";
import { StreakPill } from "@/components/game/StreakPill";
import { DailyBonusModal } from "@/components/game/DailyBonusModal";
import { DailyGoalsCard } from "@/components/game/DailyGoalsCard";
import { GAME, GRADIENTS } from "@/constants/game";
import { useNearbyCats, useCaptures, useProfileStats, useZones } from "@/hooks/useGameData";
import { useLiveLocation } from "@/providers/LocationProvider";
import { useRetention } from "@/hooks/useRetention";
import { useAuth } from "@/providers/AuthProvider";
import { gameplayService } from "@/services/gameplay.service";
import { queryClient } from "@/providers/QueryProvider";
import { queryKeys } from "@/constants/queryKeys";
import { MAP_DISCOVERY_RADIUS_M } from "@/services/map.service";
import { retentionStore } from "@/gameplay/retention/retention-store";
import { distanceInMeters, findNearestZone } from "@/lib/zones";
import type { Zone } from "@/types/database";

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { location, recenter } = useLiveLocation();
  const { data: zones = [] } = useZones();
  const { data: profile } = useProfileStats(session?.user.id);
  const { data: captures = [] } = useCaptures(session?.user.id);
  const retention = useRetention();
  const [showBonus, setShowBonus] = useState(false);
  const [recenterToken, setRecenterToken] = useState(0);

  const lat = location.latitude;
  const lng = location.longitude;
  const { nearby } = useNearbyCats(lat, lng, session?.user.id);

  const activeZone = useMemo(
    () => findNearestZone(zones, lat, lng),
    [zones, lat, lng]
  );

  const nearbyZones = useMemo(() => {
    return [...zones]
      .map((zone) => ({
        zone,
        distance: distanceInMeters(lat, lng, zone.center_lat, zone.center_lng),
      }))
      .filter((item) => item.distance <= MAP_DISCOVERY_RADIUS_M * 1.2)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4);
  }, [zones, lat, lng]);

  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const userPickedZone = useRef(false);

  useEffect(() => {
    if (activeZone && !userPickedZone.current) {
      setSelectedZone(activeZone);
    }
  }, [activeZone]);

  const uniqueCats = useMemo(() => new Set(captures.map((c) => c.cat_id)).size, [captures]);

  const discovered = uniqueCats;
  const undiscoveredNearby = nearby.filter((c) => !c.discovered);
  const nearbyCount = undiscoveredNearby.length;
  const favoritesNearby = nearby.filter((c) => c.favorite).length;

  const mapCats = useMemo(() => {
    if (!selectedZone) return nearby;
    return nearby.filter((cat) => cat.zone === selectedZone.name);
  }, [nearby, selectedZone]);

  useEffect(() => {
    if (retention.canClaimDailyBonus && profile && retention.shouldShowDailyBonusPrompt) {
      const timer = setTimeout(() => setShowBonus(true), 600);
      return () => clearTimeout(timer);
    }
  }, [retention.canClaimDailyBonus, retention.shouldShowDailyBonusPrompt, profile]);

  const claimDailyBonus = async () => {
    if (!session?.user.id || !profile) return;
    await gameplayService.claimDailyBonus(session.user.id, profile.streak);
    setShowBonus(false);
    retention.refresh();
    queryClient.invalidateQueries({ queryKey: queryKeys.profile(session.user.id) });
  };

  const mapRegion = useMemo(() => regionFromCoords(lat, lng), [lat, lng]);

  const markers = useMemo(
    () =>
      mapCats.map((cat) => ({
        cat,
        onPress: () => router.push(`/cat/${cat.id}`),
      })),
    [mapCats, router]
  );

  const handleRecenter = useCallback(async () => {
    await recenter();
    setRecenterToken((t) => t + 1);
  }, [recenter]);

  const selectZone = useCallback((zone: Zone) => {
    userPickedZone.current = true;
    setSelectedZone(zone);
  }, []);

  const zoneLabel = selectedZone?.name ?? activeZone?.name ?? "—";
  const zoneCity = selectedZone?.city ?? activeZone?.city ?? "";

  return (
    <View style={styles.root}>
      <GameMap
        region={mapRegion}
        markers={markers}
        recenterToken={recenterToken}
        showUserLocation={location.permission === "granted"}
      />

      <LinearGradient colors={[...GRADIENTS.map]} style={styles.bottomFade} pointerEvents="none" />

      {location.permission === "denied" ? (
        <View style={[styles.permissionBanner, { top: insets.top + 8 }]}>
          <Text style={styles.permissionText}>
            Localisation désactivée — position approximative affichée
          </Text>
        </View>
      ) : null}

      <View style={[styles.topBar, { paddingTop: insets.top + GAME.space.sm }]}>
        <Pressable
          style={styles.profileChip}
          onPress={() => router.push("/(tabs)/profile")}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir le profil"
        >
          <Text style={styles.profileEmoji}>{profile?.avatar_emoji ?? "😺"}</Text>
          <View>
            <Text style={styles.profileName}>
              {profile?.display_name ?? profile?.username ?? "Chasseur"}
            </Text>
            <Text style={styles.profileLevel}>
              Niv. {profile?.level ?? 1} · {discovered} chats
            </Text>
          </View>
        </Pressable>
        <View style={styles.topRight}>
          <StreakPill streak={profile?.streak ?? 0} compact onPress={() => router.push("/missions")} />
          <Pressable
            style={styles.menuBtn}
            onPress={() => router.push("/menu")}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir le menu"
          >
            <Menu color={GAME.text} size={22} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={[styles.goalsCard, { top: insets.top + 76 }]}
      >
        <DailyGoalsCard
          unclaimedMissions={retention.unclaimedMissions}
          undiscoveredNearby={nearbyCount}
          firstDiscoveryBonus={retention.isFirstDiscoveryToday}
          onCapture={() => router.push("/capture")}
          onMissions={() => router.push("/missions")}
        />
      </Animated.View>


      <View style={[styles.mapControls, { bottom: insets.bottom + 200 }]}>
        <MapControls onRecenter={handleRecenter} />
      </View>

      <MapBottomSheet
        zoneLabel={zoneLabel}
        zoneCity={zoneCity}
        catCount={mapCats.length}
        favoritesCount={favoritesNearby}
        nearbyCount={nearbyCount}
        discoveryRadiusKm={MAP_DISCOVERY_RADIUS_M / 1000}
        nearbyZones={nearbyZones}
        selectedZoneId={selectedZone?.id}
        onSelectZone={selectZone}
        onCapture={() => router.push("/capture")}
        bottomInset={insets.bottom}
      />

      <DailyBonusModal
        visible={showBonus}
        streak={profile?.streak ?? 1}
        onClaim={claimDailyBonus}
        onDismiss={() => {
          retentionStore.dismissDailyBonusPrompt();
          setShowBonus(false);
          retention.refresh();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GAME.navy },
  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 280,
  },
  permissionBanner: {
    position: "absolute",
    left: GAME.space.md,
    right: GAME.space.md,
    backgroundColor: "rgba(255,149,0,0.9)",
    borderRadius: GAME.radius.sm,
    padding: GAME.space.sm,
    zIndex: 20,
  },
  permissionText: {
    color: GAME.navy,
    fontWeight: "800",
    fontSize: GAME.type.caption,
    textAlign: "center",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: GAME.space.md,
  },
  topRight: { flexDirection: "row", alignItems: "center", gap: GAME.space.sm },
  profileChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: GAME.space.sm,
    backgroundColor: GAME.glass,
    borderRadius: GAME.radius.full,
    paddingVertical: GAME.space.sm,
    paddingHorizontal: GAME.space.md,
    borderWidth: 1,
    borderColor: GAME.glassBorder,
    flex: 1,
    marginRight: GAME.space.sm,
  },
  profileEmoji: { fontSize: 24 },
  profileName: { color: GAME.text, fontWeight: "800", fontSize: GAME.type.body },
  profileLevel: { color: GAME.textMuted, fontSize: GAME.type.caption, fontWeight: "600" },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GAME.glass,
    borderWidth: 1,
    borderColor: GAME.glassBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  goalsCard: { position: "absolute", left: GAME.space.md, right: GAME.space.md },
  mapControls: { position: "absolute", right: 0 },
});
