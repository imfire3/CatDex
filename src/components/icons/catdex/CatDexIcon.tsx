import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type CatDexIconName =
  | 'paw'
  | 'camera'
  | 'spark'
  | 'xp'
  | 'badge'
  | 'book'
  | 'map'
  | 'coat'
  | 'breed'
  | 'heart';

/** Filled CatDex glyph set — game language, not outline chrome. */
export function CatDexIcon({
  name,
  color,
  size = 20,
}: {
  name: CatDexIconName;
  color: string;
  size?: number;
}) {
  if (name === 'paw') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 18.5c-2.6 0-4.7-1.4-4.7-2.8 0-.8.9-1.2 1.8-.9.6.2 1.4.4 2.9.4s2.3-.2 2.9-.4c.9-.3 1.8.1 1.8.9 0 1.4-2.1 2.8-4.7 2.8Z"
          fill={color}
        />
        <Circle cx="7.2" cy="11.2" r="1.9" fill={color} />
        <Circle cx="16.8" cy="11.2" r="1.9" fill={color} />
        <Circle cx="9.4" cy="7.4" r="1.7" fill={color} />
        <Circle cx="14.6" cy="7.4" r="1.7" fill={color} />
      </Svg>
    );
  }

  if (name === 'camera') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2.1l1.2-1.8A1.5 1.5 0 0 1 11.05 3.5h1.9a1.5 1.5 0 0 1 1.25.7L15.4 6h2.1A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
          fill={color}
          opacity={0.2}
        />
        <Path
          d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2.1l1.2-1.8A1.5 1.5 0 0 1 11.05 3.5h1.9a1.5 1.5 0 0 1 1.25.7L15.4 6h2.1A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Circle cx="12" cy="12.5" r="3.2" fill={color} />
      </Svg>
    );
  }

  if (name === 'spark') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2.5 13.6 8.4 19.5 10 13.6 11.6 12 17.5 10.4 11.6 4.5 10 10.4 8.4 12 2.5Z"
          fill={color}
        />
        <Path d="M18 14.5 18.7 16.8 21 17.5 18.7 18.2 18 20.5 17.3 18.2 15 17.5 17.3 16.8 18 14.5Z" fill={color} />
      </Svg>
    );
  }

  if (name === 'xp') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 3 14.2 9.2 21 10.1 15.8 14.4 17.4 21 12 17.8 6.6 21 8.2 14.4 3 10.1 9.8 9.2 12 3Z" fill={color} />
      </Svg>
    );
  }

  if (name === 'badge') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2.5 14.2 8.2 20 9 15.6 13 17 19 12 15.8 7 19 8.4 13 4 9 9.8 8.2 12 2.5Z" fill={color} />
      </Svg>
    );
  }

  if (name === 'book') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M5 4.5h11.5A2.5 2.5 0 0 1 19 7v12.5H7.5A2.5 2.5 0 0 0 5 22V4.5Z"
          fill={color}
          opacity={0.25}
        />
        <Path
          d="M5 4.5h11.5A2.5 2.5 0 0 1 19 7v12.5H7.5A2.5 2.5 0 0 0 5 22V4.5Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Path d="M8 8h7.5M8 11.5h6" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === 'map') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"
          fill={color}
          opacity={0.25}
        />
        <Path
          d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Circle cx="12" cy="10" r="2.5" fill={color} />
      </Svg>
    );
  }

  if (name === 'coat') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="8" fill={color} opacity={0.25} />
        <Circle cx="12" cy="12" r="5.5" fill={color} />
        <Rect x="10.5" y="4" width="3" height="4" rx="1" fill={color} />
      </Svg>
    );
  }

  if (name === 'breed') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 20c-4 0-7-2.8-7-6.2 0-2.4 1.7-4.2 3.6-5.1.4-1.8 1.8-3.2 3.4-3.2s3 1.4 3.4 3.2c1.9.9 3.6 2.7 3.6 5.1C19 17.2 16 20 12 20Z"
          fill={color}
        />
      </Svg>
    );
  }

  // heart
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20s-7-4.2-7-9.2A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7 3.6C19 15.8 12 20 12 20Z"
        fill={color}
      />
    </Svg>
  );
}
