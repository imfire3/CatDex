import { StyleSheet, Text, type TextProps } from "react-native";
import { TEXT } from "@/constants/game";

export function SectionLabel({ style, ...props }: TextProps) {
  return <Text style={[styles.label, style]} {...props} />;
}

const styles = StyleSheet.create({
  label: { ...TEXT.label },
});
