import { useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Flashlight,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react-native";
import { FloatingButton } from "@/components/game/FloatingButton";
import { Camera } from "lucide-react-native";
import { GAME } from "@/constants/game";
import { cameraService } from "@/services/camera.service";
import { catsService } from "@/services/cats.service";
import { useCaptureStore } from "@/stores";
import { gameplayService } from "@/services/gameplay.service";
import { useLiveLocation } from "@/providers/LocationProvider";

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { location } = useLiveLocation();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const { setPhoto, setCompressed, setLocation, reset } = useCaptureStore();

  if (!permission?.granted) {
    return (
      <View style={styles.permission}>
        <Text style={styles.permissionText}>Autorise la caméra pour capturer un chat.</Text>
        <Pressable style={styles.permissionBtn} onPress={requestPermission} accessibilityRole="button" accessibilityLabel="Autoriser la caméra">
          <Text style={styles.permissionBtnText}>Autoriser</Text>
        </Pressable>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current || capturing) return;
    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) return;
      const compressed = await cameraService.compressImage(photo.uri);
      setPreviewUri(compressed);
    } finally {
      setCapturing(false);
    }
  };

  const confirmPhoto = async () => {
    if (!previewUri) return;
    reset();
    setPhoto(previewUri);
    setCompressed(previewUri);

    try {
      const coords =
        location.permission === "granted"
          ? { latitude: location.latitude, longitude: location.longitude }
          : null;
      if (coords) {
        const zones = await catsService.fetchZones();
        const zone = await catsService.resolveZoneForLocation(
          zones,
          coords.latitude,
          coords.longitude
        );
        if (zone) {
          setLocation(coords.latitude, coords.longitude, zone.id);
        }
      }
    } catch {
      // Location optional for preview flow
    }

    router.push("/capture/loading");
  };

  if (previewUri) {
    return (
      <View style={styles.root}>
        <Image source={{ uri: previewUri }} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.75)"]} style={styles.previewOverlay} />
        <View style={[styles.previewActions, { paddingBottom: insets.bottom + GAME.space.lg }]}>
          <Pressable style={styles.iconBtn} onPress={() => setPreviewUri(null)}>
            <Text style={styles.retryText}>Reprendre</Text>
          </Pressable>
          <FloatingButton label="Utiliser la photo" onPress={confirmPhoto} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flash ? "on" : "off"}
        zoom={zoom}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.7)"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + GAME.space.sm }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Fermer la caméra">
          <X color={GAME.text} size={24} strokeWidth={2.5} />
        </Pressable>
        <View style={styles.topRight}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => setFlash(!flash)}
            accessibilityRole="button"
            accessibilityLabel={flash ? "Désactiver le flash" : "Activer le flash"}
          >
            <Flashlight color={flash ? GAME.gold : GAME.text} size={22} />
          </Pressable>
        </View>
      </View>

      <Animated.View entering={FadeIn.delay(300)} style={styles.viewfinder}>
        <View style={styles.cornerTL} />
        <View style={styles.cornerTR} />
        <View style={styles.cornerBL} />
        <View style={styles.cornerBR} />
        <Text style={styles.hint}>Cadre le chat dans la zone</Text>
      </Animated.View>

      {gameplayService.isFirstDiscoveryToday() ? (
        <Animated.View entering={FadeIn.delay(500)} style={[styles.bonusBanner, { top: insets.top + 120 }]}>
          <Text style={styles.bonusText}>✨ Première découverte du jour : +100 XP bonus</Text>
        </Animated.View>
      ) : null}

      <View style={[styles.zoomRow, { top: insets.top + 70 }]}>
        <Pressable
          style={styles.zoomBtn}
          onPress={() => setZoom(Math.max(0, zoom - 0.1))}
          accessibilityRole="button"
          accessibilityLabel="Zoom arrière"
        >
          <ZoomOut color={GAME.text} size={20} />
        </Pressable>
        <Text style={styles.zoomLabel}>{(1 + zoom * 2).toFixed(1)}x</Text>
        <Pressable
          style={styles.zoomBtn}
          onPress={() => setZoom(Math.min(1, zoom + 0.1))}
          accessibilityRole="button"
          accessibilityLabel="Zoom avant"
        >
          <ZoomIn color={GAME.text} size={20} />
        </Pressable>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + GAME.space.lg }]}>
        <View style={styles.gallerySpacer} />
        <FloatingButton
          variant="capture"
          icon={Camera}
          size="xl"
          onPress={takePhoto}
          accessibilityLabel="Prendre une photo"
        />
        <View style={styles.gallerySpacer} />
      </View>
    </View>
  );
}

const corner = {
  position: "absolute" as const,
  width: 28,
  height: 28,
  borderColor: GAME.sky,
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  permission: { flex: 1, backgroundColor: GAME.navy, alignItems: "center", justifyContent: "center", padding: GAME.space.lg, gap: GAME.space.md },
  permissionText: { color: GAME.text, textAlign: "center", fontWeight: "700" },
  permissionBtn: { backgroundColor: GAME.sky, paddingHorizontal: GAME.space.lg, paddingVertical: GAME.space.md, borderRadius: GAME.radius.full },
  permissionBtnText: { color: GAME.navy, fontWeight: "900" },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: GAME.space.md,
    zIndex: 10,
  },
  topRight: { flexDirection: "row", gap: GAME.space.sm },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  viewfinder: {
    position: "absolute",
    top: "22%",
    left: "10%",
    right: "10%",
    height: "42%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: GAME.space.md,
  },
  cornerTL: { ...corner, top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { ...corner, top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { ...corner, bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { ...corner, bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  hint: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "700",
    fontSize: GAME.type.caption,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: GAME.space.md,
    paddingVertical: GAME.space.xs,
    borderRadius: GAME.radius.full,
  },
  bonusBanner: {
    position: "absolute",
    left: GAME.space.md,
    right: GAME.space.md,
    alignItems: "center",
  },
  bonusText: {
    color: GAME.gold,
    fontWeight: "800",
    fontSize: GAME.type.caption,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: GAME.space.md,
    paddingVertical: GAME.space.sm,
    borderRadius: GAME.radius.full,
    borderWidth: 1,
    borderColor: "rgba(255,204,0,0.4)",
    overflow: "hidden",
  },
  zoomRow: {
    position: "absolute",
    right: GAME.space.md,
    alignItems: "center",
    gap: GAME.space.sm,
  },
  zoomBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  zoomLabel: { color: GAME.text, fontWeight: "800", fontSize: GAME.type.caption },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: GAME.space.xl,
  },
  gallerySpacer: { width: 64 },
  previewOverlay: { ...StyleSheet.absoluteFillObject, top: "55%" },
  previewActions: { position: "absolute", bottom: 0, left: 0, right: 0, padding: GAME.space.lg, gap: GAME.space.md },
  retryText: { color: GAME.text, fontWeight: "800", textAlign: "center" },
});
