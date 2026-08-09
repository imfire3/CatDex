import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type OnboardingGlyph =
  | 'paw'
  | 'capture'
  | 'scan'
  | 'dex'
  | 'eye'
  | 'camera'
  | 'spark'
  | 'xp'
  | 'badge'
  | 'book';

/** Compact SVG icons for immersive onboarding. */
export function Glyph({
  name,
  color,
  size = 20,
}: {
  name: OnboardingGlyph;
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

  if (name === 'capture' || name === 'camera') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2.1l1.2-1.8A1.5 1.5 0 0 1 11.05 3.5h1.9a1.5 1.5 0 0 1 1.25.7L15.4 6h2.1A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Circle cx="12" cy="12.5" r="3.2" stroke={color} strokeWidth={1.8} />
      </Svg>
    );
  }

  if (name === 'scan') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
        <Path d="M3 12h18" stroke={color} strokeWidth={2} />
        <Circle cx="12" cy="12" r="3.2" fill={color} />
      </Svg>
    );
  }

  if (name === 'eye') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Circle cx="12" cy="12" r="2.8" fill={color} />
      </Svg>
    );
  }

  if (name === 'spark') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 3.2 13.9 8.6l5.7.5-4.3 3.7 1.3 5.5L12 15.6 7.4 18.3l1.3-5.5L4.4 9.1l5.7-.5L12 3.2Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'xp') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 3.2 13.9 8.6l5.7.5-4.3 3.7 1.3 5.5L12 15.6 7.4 18.3l1.3-5.5L4.4 9.1l5.7-.5L12 3.2Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'badge') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="10" r="6" stroke={color} strokeWidth={1.8} />
        <Path
          d="M8.5 15.2 7 21l5-2.4L17 21l-1.5-5.8"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Circle cx="12" cy="10" r="2.2" fill={color} />
      </Svg>
    );
  }

  if (name === 'book') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15.5H7.5A2.5 2.5 0 0 0 5 21V5.5Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Path d="M5 18.5h12" stroke={color} strokeWidth={1.8} />
      </Svg>
    );
  }

  // dex
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="5"
        y="3.5"
        width="14"
        height="17"
        rx="2.5"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path d="M8 8h8M8 12h8M8 16h5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
