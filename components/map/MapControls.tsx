import { Pressable, StyleSheet, View } from "react-native";
import { Navigation } from "lucide-react-native";
import { GAME, ELEVATION, DS } from "@/constants/game";

type MapControlsProps = {
  onRecenter: () => void;
};

export function MapControls({ onRecenter }: MapControlsProps) {
  return (
    <View style={styles.wrap}>
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        onPress={onRecenter}
        accessibilityLabel="Recentrer sur ma position"
        accessibilityRole="button"
      >
        <Navigation color={GAME.text} size={22} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 16,
    alignItems: "center",
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DS.colors.surface,
    borderWidth: 1,
    borderColor: GAME.glassBorder,
    alignItems: "center",
    justifyContent: "center",
    ...ELEVATION.sm,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.96 }] },
});
