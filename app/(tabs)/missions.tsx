import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMissionsStore } from '@/store/missions';
import { useTheme } from '@/theme/ThemeProvider';

export default function MissionsScreen() {
  const { colors, fonts, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const missions = useMissionsStore((state) => state.missions);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.display }]}>
          Missions
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted, fontFamily: fonts.body }]}>
          Objectifs simples pour démarrer ton exploration.
        </Text>
      </View>

      <View style={{ paddingHorizontal: spacing.md, gap: 12 }}>
        {missions.map((mission) => (
          <View
            key={mission.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: mission.completed ? colors.success : colors.border,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fonts.bodySemi }]}>
              {mission.title}
            </Text>
            <Text style={[styles.cardBody, { color: colors.textMuted, fontFamily: fonts.body }]}>
              {mission.description}
            </Text>
            <Text
              style={[
                styles.status,
                {
                  color: mission.completed ? colors.success : colors.accent,
                  fontFamily: fonts.bodyMedium,
                },
              ]}
            >
              {mission.completed ? 'Terminée' : 'En cours'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    letterSpacing: -0.8,
  },
  sub: {
    marginTop: 6,
    fontSize: 14,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  cardTitle: {
    fontSize: 17,
  },
  cardBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  status: {
    marginTop: 14,
    fontSize: 13,
  },
});
