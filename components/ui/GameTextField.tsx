import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { GAME } from "@/constants/game";

type GameTextFieldProps = TextInputProps & {
  label?: string;
  multiline?: boolean;
};

export function GameTextField({ label, multiline, style, ...props }: GameTextFieldProps) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={GAME.textDim}
        multiline={multiline}
        style={[styles.input, multiline && styles.textarea, style]}
        accessibilityLabel={label ?? props.placeholder}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: GAME.space.xs },
  label: {
    color: GAME.textMuted,
    fontSize: GAME.type.caption,
    fontWeight: GAME.weight.bold,
    textTransform: "uppercase",
    letterSpacing: GAME.letterSpacing.wide,
  },
  input: {
    color: GAME.text,
    fontSize: GAME.type.body,
    fontWeight: GAME.weight.semibold,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: GAME.radius.sm,
    padding: GAME.space.md,
    borderWidth: 1,
    borderColor: GAME.glassBorder,
    minHeight: GAME.touch.min,
  },
  textarea: { minHeight: 96, textAlignVertical: "top", paddingTop: GAME.space.md },
});
