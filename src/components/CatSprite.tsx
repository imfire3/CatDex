import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { themeFromColorLabel } from '@/lib/catTheme';

type Props = {
  colorLabel: string;
  seed?: number;
  size?: number;
  /** Face-only for map pins */
  faceOnly?: boolean;
};

/**
 * Stylized cat sprite tinted by coat theme — used for CatDex gallery & map pins.
 */
export function CatSprite({ colorLabel, seed = 0, size = 120, faceOnly = false }: Props) {
  const theme = themeFromColorLabel(colorLabel, seed);
  const fill = theme.hex;
  const soft = theme.soft;
  const dark = shade(fill, -0.22);
  const light = shade(fill, 0.28);

  if (faceOnly) {
    return (
      <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <Circle cx="32" cy="34" r="22" fill={fill} />
        <Path d="M14 22 8 6l14 10Z" fill={fill} />
        <Path d="M50 22 56 6 42 16Z" fill={fill} />
        <Path d="M14 22 8 6l14 10Z" fill={light} opacity={0.45} />
        <Path d="M50 22 56 6 42 16Z" fill={light} opacity={0.45} />
        <Ellipse cx="24" cy="34" rx="3.2" ry="4" fill={dark} />
        <Ellipse cx="40" cy="34" rx="3.2" ry="4" fill={dark} />
        <Path d="M32 38c1.6 1.4 3.2 1.4 4.8 0" stroke={dark} strokeWidth={1.6} strokeLinecap="round" />
        <Circle cx="32" cy="36" r="1.4" fill={dark} />
        <Ellipse cx="20" cy="42" rx="3" ry="1.6" fill={light} opacity={0.55} />
        <Ellipse cx="44" cy="42" rx="3" ry="1.6" fill={light} opacity={0.55} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Ellipse cx="60" cy="108" rx="28" ry="6" fill={soft} />
      {/* Tail */}
      <Path
        d="M88 72c14 2 22-8 20-22-2 10-10 16-20 18Z"
        fill={fill}
      />
      <Path d="M88 72c14 2 22-8 20-22" stroke={dark} strokeWidth={1.2} opacity={0.35} />
      {/* Body */}
      <Ellipse cx="58" cy="78" rx="30" ry="20" fill={fill} />
      <Ellipse cx="48" cy="74" rx="14" ry="10" fill={light} opacity={0.35} />
      {/* Legs */}
      <Path d="M38 88v16M48 90v16M66 90v16M78 88v16" stroke={dark} strokeWidth={5} strokeLinecap="round" />
      <Path d="M38 88v16M48 90v16M66 90v16M78 88v16" stroke={fill} strokeWidth={3.2} strokeLinecap="round" />
      {/* Head */}
      <Circle cx="42" cy="48" r="22" fill={fill} />
      <Path d="M26 36 20 18l16 10Z" fill={fill} />
      <Path d="M58 36 64 18 48 28Z" fill={fill} />
      <Path d="M26 36 20 18l16 10Z" fill={light} opacity={0.5} />
      <Path d="M58 36 64 18 48 28Z" fill={light} opacity={0.5} />
      <Ellipse cx="35" cy="48" rx="3" ry="3.8" fill={dark} />
      <Ellipse cx="49" cy="48" rx="3" ry="3.8" fill={dark} />
      <Circle cx="42" cy="52" r="1.5" fill={dark} />
      <Path d="M42 54c1.4 1.2 2.8 1.2 4.2 0" stroke={dark} strokeWidth={1.4} strokeLinecap="round" />
      <Ellipse cx="30" cy="56" rx="3.2" ry="1.8" fill={light} opacity={0.55} />
      <Ellipse cx="54" cy="56" rx="3.2" ry="1.8" fill={light} opacity={0.55} />
    </Svg>
  );
}

function shade(hex: string, amount: number): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return hex;
  const num = Number.parseInt(raw, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + Math.round(255 * amount)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(255 * amount)));
  const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(255 * amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
