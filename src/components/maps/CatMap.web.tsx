import { createElement } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { PARIS_20E } from '@/lib/constants';
import { useTheme } from '@/theme/ThemeProvider';
import type { Cat } from '@/types/cat';

type Props = {
  cats: Cat[];
  scheme: 'light' | 'dark';
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

export function CatMap({ cats, onSelectCat }: Props) {
  const { colors, fonts } = useTheme();
  const mapUrl =
    'https://www.openstreetmap.org/export/embed.html?bbox=2.376%2C48.848%2C2.412%2C48.875&layer=mapnik&marker=48.8635%2C2.3985';

  return (
    <View style={styles.root}>
      {createElement('iframe', {
        title: 'CatDex map',
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
          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelectCat(cat)}
              style={[
                styles.pin,
                {
                  left: pos.left as unknown as number,
                  top: pos.top as unknown as number,
                  borderColor: colors.mapPinRing,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              {cat.photoUri ? (
                <Image source={{ uri: cat.photoUri }} style={styles.photo} />
              ) : (
                <Text style={{ fontFamily: fonts.bodySemi, color: colors.accent }}>C</Text>
              )}
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.hint, { backgroundColor: colors.surface }]}>
        <Text style={{ color: colors.textMuted, fontFamily: fonts.body, fontSize: 12 }}>
          Carte web · Paris 20e (aperçu local)
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
  const { colors, fonts } = useTheme();
  const delta = 0.008;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - delta}%2C${latitude - delta}%2C${longitude + delta}%2C${latitude + delta}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <View style={styles.miniWrap}>
      {createElement('iframe', {
        title: "Lieu d'observation",
        src: mapUrl,
        style: {
          border: 0,
          width: '100%',
          height: 150,
        },
      })}
      <Text style={[styles.coords, { color: colors.textMuted, fontFamily: fonts.body }]}>
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#D8D5CF',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  pin: {
    position: 'absolute',
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    borderRadius: 22,
    borderWidth: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  hint: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  miniWrap: {
    height: 180,
  },
  coords: {
    paddingHorizontal: 12,
    paddingTop: 6,
    fontSize: 12,
  },
});
