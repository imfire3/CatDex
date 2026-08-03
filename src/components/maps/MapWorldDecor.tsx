import { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { distanceMeters } from '@/lib/constants';
import { useTheme } from '@/theme';
import type { Cat } from '@/types/cat';

import { MAP_DECOR_SEEDS, type MapDecorKind, type MapDecorSeed } from './mapDecorSeeds';
import { mapPalette } from './mapPalette';

const MIN_DISTANCE_FROM_CAT_M = 45;
/** iOS custom markers stay blank if tracksViewChanges is false from frame 0. */
const DECOR_TRACK_MS = 900;

type Props = {
  cats: Cat[];
};

function DecorGlyph({ kind }: { kind: MapDecorKind }) {
  const { colors } = useTheme();
  const canopy = mapPalette.forest;
  const leaf = mapPalette.park;
  const trunk = colors.textMuted;
  const blossom = colors.accent;

  if (kind === 'tree') {
    return (
      <Svg width={22} height={26} viewBox="0 0 22 26">
        <Path d="M10.5 14v9" stroke={trunk} strokeWidth={2} strokeLinecap="round" />
        <Ellipse cx={11} cy={10} rx={8} ry={7} fill={canopy} opacity={0.92} />
        <Ellipse cx={11} cy={8} rx={5.5} ry={4.5} fill={leaf} opacity={0.85} />
      </Svg>
    );
  }

  if (kind === 'bush') {
    return (
      <Svg width={24} height={16} viewBox="0 0 24 16">
        <Ellipse cx={8} cy={10} rx={6} ry={4.5} fill={leaf} opacity={0.9} />
        <Ellipse cx={15} cy={9} rx={7} ry={5} fill={canopy} opacity={0.88} />
        <Ellipse cx={12} cy={11} rx={5} ry={3.5} fill={leaf} opacity={0.75} />
      </Svg>
    );
  }

  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Circle cx={9} cy={9} r={3.2} fill={blossom} opacity={0.85} />
      <Circle cx={9} cy={4.5} r={2.2} fill={blossom} opacity={0.55} />
      <Circle cx={9} cy={13.5} r={2.2} fill={blossom} opacity={0.55} />
      <Circle cx={4.5} cy={9} r={2.2} fill={blossom} opacity={0.55} />
      <Circle cx={13.5} cy={9} r={2.2} fill={blossom} opacity={0.55} />
      <Circle cx={9} cy={9} r={1.4} fill={colors.surface} opacity={0.9} />
    </Svg>
  );
}

function DecorMarker({ seed }: { seed: MapDecorSeed }) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    const freeze = setTimeout(() => setTracksViewChanges(false), DECOR_TRACK_MS);
    return () => clearTimeout(freeze);
  }, []);

  return (
    <Marker
      coordinate={{ latitude: seed.latitude, longitude: seed.longitude }}
      anchor={{ x: 0.5, y: 0.85 }}
      tracksViewChanges={tracksViewChanges}
      tappable={false}
      zIndex={1}
    >
      <View style={styles.wrap} pointerEvents="none">
        <DecorGlyph kind={seed.kind} />
      </View>
    </Marker>
  );
}

function isFarFromCats(seed: MapDecorSeed, cats: Cat[]) {
  return cats.every(
    (cat) =>
      distanceMeters(seed.latitude, seed.longitude, cat.latitude, cat.longitude) >=
      MIN_DISTANCE_FROM_CAT_M,
  );
}

/**
 * Sparse soft world décor (trees / bushes / flowers) — never the visual focus.
 */
function MapWorldDecorComponent({ cats }: Props) {
  const seeds = useMemo(
    () => MAP_DECOR_SEEDS.filter((seed) => isFarFromCats(seed, cats)).slice(0, 10),
    [cats],
  );

  return (
    <>
      {seeds.map((seed) => (
        <DecorMarker key={seed.id} seed={seed} />
      ))}
    </>
  );
}

export const MapWorldDecor = memo(MapWorldDecorComponent);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    opacity: 0.88,
  },
});
