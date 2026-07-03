import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { GAME } from "@/constants/game";

type ScreenHeaderProps = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  transparent?: boolean;
};

export function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  right,
  transparent,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={[
        styles.wrap,
        { paddingTop: insets.top + GAME.space.sm },
        transparent && styles.transparent,
      ]}
    >
      <View style={styles.row}>
        {showBack ? (
          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <ChevronLeft color={GAME.text} size={28} strokeWidth={2.5} />
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <View style={styles.center}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.right}>{right ?? <View style={styles.backPlaceholder} />}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: GAME.space.md,
    paddingBottom: GAME.space.sm,
    zIndex: 10,
  },
  transparent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GAME.glass,
    borderWidth: 1,
    borderColor: GAME.glassBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  backPlaceholder: {
    width: 44,
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    color: GAME.text,
    fontSize: GAME.type.subtitle,
    fontWeight: "800",
  },
  subtitle: {
    color: GAME.textMuted,
    fontSize: GAME.type.caption,
    fontWeight: "600",
    marginTop: 2,
  },
  right: {
    width: 44,
    alignItems: "flex-end",
  },
});
