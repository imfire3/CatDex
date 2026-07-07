import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Search, X } from "lucide-react-native";
import { Chip } from "@/components/ui/Chip";
import { GAME } from "@/constants/game";
import { useAppStore } from "@/stores";

const FILTERS = [
  { id: "all" as const, label: "Tous" },
  { id: "discovered" as const, label: "Découverts" },
  { id: "favorites" as const, label: "Favoris" },
];

export function ChatDexToolbar() {
  const { searchQuery, chatdexFilter, setSearchQuery, setChatdexFilter } = useAppStore();

  return (
    <View style={styles.wrap}>
      <View style={styles.searchRow}>
        <Search color={GAME.textMuted} size={18} />
        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher un chat, race, zone…"
          placeholderTextColor={GAME.textDim}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          accessibilityLabel="Rechercher dans le ChatDex"
        />
        {searchQuery.length > 0 ? (
          <Pressable
            onPress={() => setSearchQuery("")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Effacer la recherche"
          >
            <X color={GAME.textMuted} size={18} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Chip
            key={f.id}
            label={f.label}
            selected={chatdexFilter === f.id}
            onPress={() => setChatdexFilter(f.id)}
            style={chatdexFilter !== f.id ? styles.filterChip : undefined}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    gap: GAME.space.xs,
    paddingHorizontal: GAME.space.md,
    alignItems: "center",
  },
  searchRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: GAME.space.xs,
    backgroundColor: GAME.glassToken.strong,
    borderRadius: GAME.radius.full,
    borderWidth: 1,
    borderColor: GAME.glassBorder,
    paddingHorizontal: GAME.space.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    color: GAME.text,
    fontSize: GAME.type.body,
    fontWeight: GAME.weight.semibold,
    paddingVertical: GAME.space.xs,
  },
  filters: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: GAME.space.xs,
  },
  filterChip: { backgroundColor: "rgba(255,255,255,0.12)" },
});
