import { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Map, Grid3X3, User, Camera } from "lucide-react-native";
import { GAME, ELEVATION, MOTION } from "@/constants/game";
import { useRetention } from "@/hooks/useRetention";
import { useReduceMotion } from "@/hooks/useReduceMotion";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CaptureTabButton() {
  const router = useRouter();
  const { unclaimedMissions } = useRetention();
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);
  const glow = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    glow.value = withRepeat(withTiming(1.08, { duration: 1400 }), -1, true);
  }, [reduceMotion, glow]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glow.value }],
    opacity: 0.85 + (glow.value - 1) * 2,
  }));

  return (
    <View style={styles.captureWrap}>
      <AnimatedPressable
        style={[styles.captureOuter, animStyle]}
        onPress={() => router.push("/capture")}
        onPressIn={() => {
          scale.value = withSpring(0.92, MOTION.spring);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 300 });
        }}
        accessibilityLabel="Photographier un chat"
        accessibilityRole="button"
      >
        <Animated.View style={[styles.captureRing, ringStyle]}>
          <View style={styles.captureInner}>
            <Camera color={GAME.text} size={32} strokeWidth={2.5} />
          </View>
        </Animated.View>
      </AnimatedPressable>
      <Text style={styles.captureLabel}>Capturer</Text>
      {unclaimedMissions > 0 ? (
        <View style={styles.missionBadge}>
          <Text style={styles.missionBadgeText}>{unclaimedMissions}</Text>
        </View>
      ) : null}
    </View>
  );
}

function TabIcon({
  icon: Icon,
  color,
  focused,
}: {
  icon: typeof Map;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
      <Icon color={color} size={22} strokeWidth={focused ? 2.8 : 2} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GAME.sky,
        tabBarInactiveTintColor: GAME.textDim,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, styles.tabBarBg]} />
        ),
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: "Carte",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Map} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="capture-tab"
        options={{
          title: "",
          tabBarButton: () => <CaptureTabButton />,
        }}
        listeners={{ tabPress: (e) => e.preventDefault() }}
      />
      <Tabs.Screen
        name="chatdex"
        options={{
          title: "ChatDex",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Grid3X3} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={User} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBg: {
    backgroundColor: "rgba(13,27,42,0.92)",
    borderTopWidth: 1,
    borderTopColor: GAME.glassBorder,
  },
  tabBar: {
    position: "absolute",
    backgroundColor: "transparent",
    borderTopWidth: 0,
    height: GAME.layout.tabBarHeight,
    paddingTop: 10,
    paddingBottom: 28,
    ...ELEVATION.lg,
  },
  tabLabel: {
    fontWeight: "800",
    fontSize: 11,
    marginTop: 2,
  },
  tabIconWrap: {
    width: 36,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  tabIconWrapActive: {
    backgroundColor: "rgba(90,200,250,0.15)",
  },
  captureWrap: {
    top: -32,
    alignItems: "center",
    justifyContent: "center",
    width: 88,
  },
  captureOuter: {
    alignItems: "center",
    justifyContent: "center",
  },
  captureRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,59,48,0.25)",
    alignItems: "center",
    justifyContent: "center",
    ...ELEVATION.glow,
    shadowColor: GAME.capture,
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GAME.capture,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.95)",
  },
  captureLabel: {
    marginTop: 6,
    color: GAME.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  missionBadge: {
    position: "absolute",
    top: 0,
    right: 6,
    backgroundColor: GAME.gold,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: GAME.navy,
  },
  missionBadgeText: { color: GAME.navy, fontWeight: "900", fontSize: 11 },
});
