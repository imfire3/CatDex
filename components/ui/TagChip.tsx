import { StyleSheet, Text, View } from "react-native";
import { GAME } from "@/constants/game";

type TagChipProps = {
  label: string;
  color?: string;
};

export function TagChip({ label, color = GAME.sky }: TagChipProps) {
  return (
    <View style={[styles.chip, { backgroundColor: `${color}1F`, borderColor: `${color}66` }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: GAME.space.md,
    paddingVertical: GAME.space.xs,
    borderRadius: GAME.radius.full,
    borderWidth: 1,
  },
  text: { fontWeight: GAME.weight.bold, fontSize: GAME.type.caption },
});
