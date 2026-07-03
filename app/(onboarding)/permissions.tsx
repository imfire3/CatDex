import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, MapPin } from "lucide-react-native";
import { FloatingButton } from "@/components/game/FloatingButton";
import { GlassCard } from "@/components/game/GlassCard";
import { ProgressDots } from "@/components/game/ProgressDots";
import { GAME, GRADIENTS } from "@/constants/game";
import { authService } from "@/services/auth.service";

const PERMISSIONS = [
  {
    icon: MapPin,
    title: "Localisation",
    description: "Pour découvrir les chats à proximité dans ton quartier.",
    color: GAME.sky,
  },
  {
    icon: Camera,
    title: "Caméra",
    description: "Pour photographier et documenter chaque rencontre féline.",
    color: GAME.pink,
  },
];

export default function PermissionsScreen() {
  const router = useRouter();

  const grantAll = async () => {
    await authService.requestLocationPermission();
    await authService.requestCameraPermission();
    router.push("/(onboarding)/introduction");
  };

  const skip = () => {
    router.push("/(onboarding)/introduction");
  };

  return (
    <LinearGradient colors={[...GRADIENTS.welcome]} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ProgressDots total={4} current={0} />

        <Animated.Text entering={FadeInUp.delay(200).springify()} style={styles.title}>
          Autorisations
        </Animated.Text>
        <Animated.Text entering={FadeInUp.delay(350).springify()} style={styles.subtitle}>
          CatDex a besoin de quelques accès pour une expérience complète.
        </Animated.Text>

        <View style={styles.list}>
          {PERMISSIONS.map((item, i) => (
            <Animated.View key={item.title} entering={FadeInDown.delay(450 + i * 120).springify()}>
              <GlassCard style={styles.card}>
                <View style={[styles.iconWrap, { backgroundColor: `${item.color}22` }]}>
                  <item.icon color={item.color} size={28} strokeWidth={2.2} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc}>{item.description}</Text>
                </View>
              </GlassCard>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(900).springify()} style={styles.footer}>
          <FloatingButton label="Autoriser et continuer" onPress={grantAll} />
          <Pressable onPress={skip} accessibilityRole="button" accessibilityLabel="Configurer plus tard">
            <Text style={styles.skip}>Configurer plus tard</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: GAME.space.lg,
    paddingTop: GAME.space.lg,
    justifyContent: "space-between",
    paddingBottom: GAME.space.lg,
  },
  title: {
    color: GAME.text,
    fontSize: GAME.type.title,
    fontWeight: "900",
    textAlign: "center",
    marginTop: GAME.space.xl,
  },
  subtitle: {
    color: GAME.textMuted,
    fontSize: GAME.type.body,
    textAlign: "center",
    lineHeight: 24,
    marginTop: GAME.space.sm,
    marginBottom: GAME.space.lg,
    paddingHorizontal: GAME.space.md,
  },
  list: { gap: GAME.space.md, flex: 1, justifyContent: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: GAME.space.md,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1 },
  cardTitle: { color: GAME.text, fontSize: GAME.type.subtitle, fontWeight: "800" },
  cardDesc: { color: GAME.textMuted, fontSize: GAME.type.caption, marginTop: 4, lineHeight: 18 },
  footer: { gap: GAME.space.md, alignItems: "center" },
  skip: { color: GAME.textDim, fontSize: GAME.type.body, fontWeight: "600" },
});
