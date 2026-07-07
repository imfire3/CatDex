import { Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";
import { ChevronRight } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { GlassCard } from "@/components/game/GlassCard";
import { GAME } from "@/constants/game";

type LinkRowProps = PressableProps & {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  subtitle?: string;
  badge?: number | string;
  highlight?: boolean;
};

export function LinkRow({
  icon: Icon,
  iconColor = GAME.sky,
  title,
  subtitle,
  badge,
  highlight,
  style,
  ...props
}: LinkRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [pressed && styles.pressed, typeof style === "function" ? style({ pressed, hovered: false } as any) : style]}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      {...props}
    >
      <GlassCard style={[styles.card, highlight && styles.cardHighlight]} padding={GAME.space.md}>
        <View style={[styles.iconWrap, { backgroundColor: `${iconColor}22` }]}>
          <Icon color={iconColor} size={22} strokeWidth={2.2} />
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {badge != null ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : (
          <ChevronRight color={GAME.textDim} size={20} />
        )}
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.92 },
  card: { flexDirection: "row", alignItems: "center", gap: GAME.space.md },
  cardHighlight: { borderColor: "rgba(255,204,0,0.4)", borderWidth: 1 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1 },
  title: { color: GAME.text, fontSize: GAME.type.body, fontWeight: GAME.weight.bold },
  subtitle: { color: GAME.textMuted, fontSize: GAME.type.caption, marginTop: 2, fontWeight: GAME.weight.medium },
  badge: {
    backgroundColor: GAME.capture,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: GAME.text, fontWeight: GAME.weight.black, fontSize: 12 },
});
