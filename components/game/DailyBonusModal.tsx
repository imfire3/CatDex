import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { Gift, Star } from "lucide-react-native";
import { FloatingButton } from "@/components/game/FloatingButton";
import { GAME, GRADIENTS, ELEVATION } from "@/constants/game";
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
          <LinearGradient colors={[...GRADIENTS.primary]} style={styles.header}>
            <Animated.View entering={FadeIn.delay(150)} style={styles.iconWrap}>
              <Gift color={GAME.gold} size={40} />
            </Animated.View>
            <Text style={styles.eyebrow}>RÉCOMPENSE QUOTIDIENNE</Text>
            <Text style={styles.title}>Bonus du jour</Text>
          </LinearGradient>

          <View style={styles.body}>
            <Text style={styles.subtitle}>
              {streakLabel(streak)} · Série de {streak} jour{streak > 1 ? "s" : ""}
            </Text>

            <View style={styles.rewardBox}>
              <Star color={GAME.gold} size={22} fill={GAME.gold} />
              <Text style={styles.rewardXp}>+{xp} XP</Text>
            </View>

            <Text style={styles.tip}>Reviens demain pour faire grimper ta série 🔥</Text>

            <FloatingButton label="Récupérer" onPress={onClaim} style={styles.claimBtn} />
            <Pressable
              onPress={onDismiss}
              style={styles.skip}
              accessibilityRole="button"
              accessibilityLabel="Plus tard"
            >
              <Text style={styles.skipText}>Plus tard</Text>
            </Pressable>
          </View>
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
  card: {
    width: "100%",
    maxWidth: 340,
    borderRadius: GAME.radius.lg,
    overflow: "hidden",
    backgroundColor: GAME.surface.card,
    ...ELEVATION.lg,
  },
  header: {
    alignItems: "center",
    paddingTop: GAME.space.lg,
    paddingBottom: GAME.space.md,
    paddingHorizontal: GAME.space.lg,
    gap: GAME.space.xs,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: GAME.space.xs,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.9)",
    fontSize: GAME.type.micro,
    fontWeight: GAME.weight.black,
    letterSpacing: GAME.letterSpacing.caps,
  },
  title: { color: GAME.text, fontSize: GAME.type.title, fontWeight: GAME.weight.black },
  body: {
    padding: GAME.space.lg,
    alignItems: "center",
    gap: GAME.space.sm,
    backgroundColor: GAME.surface.light,
  },
  subtitle: {
    color: GAME.surface.lightTextMuted,
    fontWeight: GAME.weight.semibold,
    textAlign: "center",
    fontSize: GAME.type.body,
  },
  rewardBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: GAME.space.xs,
    backgroundColor: GAME.surface.card,
    paddingHorizontal: GAME.space.lg,
    paddingVertical: GAME.space.md,
    borderRadius: GAME.radius.full,
    borderWidth: 1,
    borderColor: GAME.surface.lightMuted,
    marginVertical: GAME.space.sm,
    ...ELEVATION.sm,
  },
  rewardXp: { color: GAME.goldDark, fontSize: GAME.type.hero, fontWeight: GAME.weight.black },
  tip: {
    color: GAME.surface.lightTextMuted,
    fontSize: GAME.type.caption,
    textAlign: "center",
    marginBottom: GAME.space.sm,
  },
  claimBtn: { alignSelf: "stretch" },
  skip: { marginTop: GAME.space.xs, padding: GAME.space.sm, minHeight: GAME.touch.min },
  skipText: { color: GAME.surface.lightTextMuted, fontWeight: GAME.weight.semibold },
});
