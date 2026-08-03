import { useEffect, useState } from 'react';
import { Circle } from 'react-native-maps';

import { DISCOVERY_RADIUS_M } from '@/lib/mapExplore';
import { useTheme } from '@/theme';

type Props = {
  coordinate: { latitude: number; longitude: number };
};

/** Translucent discovery zone with a soft breathing fill. */
export function DiscoveryRadius({ coordinate }: Props) {
  const { colors } = useTheme();
  const [fillAlpha, setFillAlpha] = useState(0.1);

  useEffect(() => {
    const id = setInterval(() => {
      setFillAlpha((value) => (value < 0.14 ? 0.18 : 0.1));
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <Circle
        center={coordinate}
        radius={DISCOVERY_RADIUS_M}
        fillColor={`rgba(106, 105, 248, ${fillAlpha})`}
        strokeColor="rgba(106, 105, 248, 0.32)"
        strokeWidth={2}
        zIndex={1}
      />
      <Circle
        center={coordinate}
        radius={DISCOVERY_RADIUS_M * 0.72}
        fillColor="rgba(106, 105, 248, 0.06)"
        strokeColor="transparent"
        zIndex={1}
      />
    </>
  );
}
