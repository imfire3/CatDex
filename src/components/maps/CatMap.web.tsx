import { createElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CatSprite } from '@/components/CatSprite';
import { Text } from '@/components/Text';
import { PARIS_20E } from '@/lib/constants';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  cats: Cat[];
  scheme: 'light' | 'dark';
  selectedCatId?: string | null;
  onSelectCat: (cat: Cat) => void;
  focusCoordinate?: { latitude: number; longitude: number } | null;
};

function project(lat: number, lng: number) {
  const { bounds } = PARIS_20E;
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
  return {
    left: `${Math.min(92, Math.max(4, x))}%`,
    top: `${Math.min(92, Math.max(4, y))}%`,
  };
}

export function CatMap({ cats, selectedCatId, onSelectCat }: Props) {
  const { colors, spacing, shadow } = useTheme();

  const mapUrl =
    'https://www.openstreetmap.org/export/embed.html?bbox=2.376%2C48.848%2C2.412%2C48.875&layer=mapnik&marker=48.8635%2C2.3985';

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceSecondary }]}>
      {createElement('iframe', {
        title: 'Carte CatDex',
        src: mapUrl,
        style: {
          border: 0,
          width: '100%',
          height: '100%',
        },
      })}
      <View pointerEvents="box-none" style={styles.overlay}>
        {cats.map((cat) => {
          const pos = project(cat.latitude, cat.longitude);
          const selected = cat.id === selectedCatId;
          const size = selected ? spacing[64] : spacing[48];

          return (
            <Pressable
              key={cat.id}
              accessibilityRole="button"
              accessibilityLabel={`${cat.name}, marqueur carte`}
              onPress={() => onSelectCat(cat)}
              style={[
                styles.pin,
                {
                  left: pos.left as unknown as number,
                  top: pos.top as unknown as number,
                  width: size,
                  height: size,
                  marginLeft: -size / 2,
                  marginTop: -size / 2,
                  borderRadius: size / 2,
                  borderWidth: selected ? 3 : 2,
                  borderColor: colors.surface,
                  backgroundColor: colors.accentSoft,
                },
                selected ? shadow.medium : shadow.low,
              ]}
            >
              <CatSprite
                colorLabel={cat.analysis.color}
                seed={cat.number}
                size={size - 8}
                faceOnly
              />
            </Pressable>
          );
        })}
      </View>
      <View
        style={[
          styles.hint,
          {
            backgroundColor: colors.surface,
            borderRadius: spacing[16],
            paddingHorizontal: spacing[8],
            paddingVertical: spacing[4],
            bottom: spacing[96],
            right: spacing[16],
          },
        ]}
      >
        <Text variant="caption" color="textSecondary">
          Carte web · Paris 20e
        </Text>
      </View>
    </View>
  );
}

export function MiniMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const { spacing } = useTheme();
  const delta = 0.008;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - delta}%2C${latitude - delta}%2C${longitude + delta}%2C${latitude + delta}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <View style={styles.miniWrap}>
      {createElement('iframe', {
        title: 'Lieu approximatif',
        src: mapUrl,
        style: {
          border: 0,
          width: '100%',
          height: 150,
        },
      })}
      <Text
        variant="caption"
        color="textSecondary"
        style={{ paddingHorizontal: spacing[16], paddingTop: spacing[8] }}
      >
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  pin: {
    position: 'absolute',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    position: 'absolute',
  },
  miniWrap: {
    height: 180,
  },
});
