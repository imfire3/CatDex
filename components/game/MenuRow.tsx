import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { ChevronRight } from "lucide-react-native";
import { GlassCard } from "@/components/game/GlassCard";
import { GAME } from "@/constants/game";

type MenuRowProps = {
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  color?: string;
  onPress: () => void;
};

export function MenuRow({ icon: Icon, label, subtitle, color = GAME.sky, onPress }: MenuRowProps) {
  return (
    <Pressable onPress={onPress}>
      <GlassCard style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: `${color}22` }]}>
          <Icon color={color} size={22} strokeWidth={2.2} />
        </View>
        <View style={styles.body}>
          <Text style={styles.label}>{label}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <ChevronRight color={GAME.textDim} size={20} />
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: GAME.space.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1 },
  label: { color: GAME.text, fontSize: GAME.type.body, fontWeight: "800" },
  subtitle: { color: GAME.textMuted, fontSize: GAME.type.caption, marginTop: 2 },
});
