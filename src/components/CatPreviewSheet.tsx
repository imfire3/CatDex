import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatCaptureTime } from '@/lib/constants';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  cat: Cat | null;
  visible: boolean;
  onClose: () => void;
  onOpenDetails: (cat: Cat) => void;
};

export function CatPreviewSheet({ cat, visible, onClose, onOpenDetails }: Props) {
  const { colors, fonts, radii, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  if (!cat) return null;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            paddingBottom: Math.max(insets.bottom, spacing.md),
            borderTopLeftRadius: radii.lg,
            borderTopRightRadius: radii.lg,
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Image source={{ uri: cat.photoUri }} style={styles.photo} />
          <View style={styles.meta}>
            <Text style={[styles.name, { color: colors.text, fontFamily: fonts.display }]}>
              {cat.name}
            </Text>
            <Text style={[styles.sub, { color: colors.textMuted, fontFamily: fonts.body }]}>
              {cat.analysis.breed} · {formatCaptureTime(cat.discoveredAt)}
            </Text>
            <Text
              numberOfLines={2}
              style={[styles.desc, { color: colors.textMuted, fontFamily: fonts.body }]}
            >
              {cat.analysis.description}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => onOpenDetails(cat)}
          style={[styles.cta, { backgroundColor: colors.accent }]}
        >
          <Text style={[styles.ctaText, { fontFamily: fonts.bodySemi }]}>Voir la fiche</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  photo: {
    width: 88,
    height: 88,
    borderRadius: 16,
  },
  meta: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 22,
    letterSpacing: -0.4,
  },
  sub: {
    marginTop: 4,
    fontSize: 13,
  },
  desc: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  cta: {
    marginTop: 18,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFF',
    fontSize: 16,
  },
});
