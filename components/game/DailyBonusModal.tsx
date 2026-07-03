import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { Gift, Star } from "lucide-react-native";
import { FloatingButton } from "@/components/game/FloatingButton";
import { GAME, GRADIENTS } from "@/constants/game";
import { dailyBonusXp, streakLabel } from "@/gameplay/retention/daily-bonus";

type DailyBonusModalProps = {
  visible: boolean;
  streak: number;
  onClaim: () => void;
  onDismiss: () => void;
};

export function DailyBonusModal({ visible, streak, onClaim, onDismiss }: DailyBonusModalProps) {
  const xp = dailyBonusXp(streak);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Animated.View entering={ZoomIn.springify()} style={styles.card}>
          <LinearGradient colors={[...GRADIENTS.celebration]} style={styles.gradient}>
            <Animated.View entering={FadeIn.delay(200)} style={styles.iconWrap}>
              <Gift color={GAME.gold} size={48} />
            </Animated.View>
            <Text style={styles.title}>Bonus du jour</Text>
            <Text style={styles.subtitle}>{streakLabel(streak)} · Série de {streak} jour{streak > 1 ? "s" : ""}</Text>

            <View style={styles.rewardBox}>
              <Star color={GAME.gold} size={20} fill={GAME.gold} />
              <Text style={styles.rewardXp}>+{xp} XP</Text>
            </View>

            <Text style={styles.tip}>Reviens demain pour faire grimper ta série 🔥</Text>

            <FloatingButton label="Récupérer" onPress={onClaim} style={styles.claimBtn} />
            <Pressable onPress={onDismiss} style={styles.skip}>
              <Text style={styles.skipText}>Plus tard</Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: GAME.space.lg,
  },
  card: { width: "100%", maxWidth: 340, borderRadius: GAME.radius.lg, overflow: "hidden" },
  gradient: { padding: GAME.space.xl, alignItems: "center", gap: GAME.space.sm },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: GAME.space.sm,
  },
  title: { color: GAME.text, fontSize: GAME.type.title, fontWeight: "900" },
  subtitle: { color: "rgba(255,255,255,0.85)", fontWeight: "700", textAlign: "center" },
  rewardBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: GAME.space.lg,
    paddingVertical: GAME.space.md,
    borderRadius: GAME.radius.full,
    marginVertical: GAME.space.md,
  },
  rewardXp: { color: GAME.gold, fontSize: GAME.type.hero, fontWeight: "900" },
  tip: { color: "rgba(255,255,255,0.7)", fontSize: GAME.type.caption, textAlign: "center", marginBottom: GAME.space.md },
  claimBtn: { alignSelf: "stretch" },
  skip: { marginTop: GAME.space.sm, padding: GAME.space.sm },
  skipText: { color: "rgba(255,255,255,0.6)", fontWeight: "700" },
});
