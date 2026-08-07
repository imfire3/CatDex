import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

type IconProps = {
  color?: string;
  size?: number;
};

function useStroke(color?: string) {
  const { colors, iconStroke, iconSize } = useTheme();
  return {
    stroke: color ?? colors.textSecondary,
    strokeWidth: iconStroke.regular,
    size: iconSize.md,
  };
}

/** Compact stroke icons for settings rows — theme-aware. */
export function IconUser({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.5" stroke={t.stroke} strokeWidth={t.strokeWidth} />
      <Path
        d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconShield({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3 5 6.5v5.2c0 4.2 2.8 7.8 7 8.8 4.2-1 7-4.6 7-8.8V6.5L12 3Z"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconLink({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10 14a4 4 0 0 0 5.7.2l2.1-2.1a4 4 0 0 0-5.7-5.7L11 7.5"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M14 10a4 4 0 0 0-5.7-.2L6.2 11.9a4 4 0 0 0 5.7 5.7L13 16.5"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconBell({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 17h12l-1.2-1.2V11a4.8 4.8 0 1 0-9.6 0v4.8L6 17Z"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinejoin="round"
      />
      <Path
        d="M10 17a2 2 0 0 0 4 0"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconSparkle({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5 14.8 9l6.2.9-4.5 4.4 1.1 6.2L12 17.8 6.4 20.5l1.1-6.2L3 9.9l6.2-.9L12 3.5Z"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconFlag({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 21V4h9l-1 4 1 4H5"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconFlame({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21c4 0 7-2.8 7-6.5 0-3.2-2-5.2-4.2-7.2-.4 2.2-1.6 3.3-3.3 3.7C12.8 7.8 12 5.5 12 3c-3.5 2.5-7 5.8-7 11.5C5 18.2 8 21 12 21Z"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconMegaphone({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 10v4h2l7 4V6L6 10H4Z"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinejoin="round"
      />
      <Path
        d="M18 9.5a3.5 3.5 0 0 1 0 5"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconPalette({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4a8 8 0 1 0 0 16h1.2a2.2 2.2 0 0 0 2-3.1 2.2 2.2 0 0 1 2-3.1H18a4 4 0 0 0 0-8h-6Z"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinejoin="round"
      />
      <Circle cx="8" cy="10" r="1" fill={t.stroke} />
      <Circle cx="11" cy="8" r="1" fill={t.stroke} />
      <Circle cx="8.5" cy="13.5" r="1" fill={t.stroke} />
    </Svg>
  );
}

export function IconSpeaker({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 10v4h3l5 4V6l-5 4H4Z"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinejoin="round"
      />
      <Path
        d="M16 9.5a3.5 3.5 0 0 1 0 5M18.5 7.5a6.5 6.5 0 0 1 0 9"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconVibrate({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Rect
        x="8"
        y="4"
        width="8"
        height="16"
        rx="1.5"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
      />
      <Path
        d="M4 8v8M2 10v4M20 8v8M22 10v4"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconSpark({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconImage({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4"
        y="5"
        width="16"
        height="14"
        rx="2"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
      />
      <Circle cx="9" cy="10" r="1.5" stroke={t.stroke} strokeWidth={t.strokeWidth} />
      <Path
        d="M4 16l4.5-4 3.5 3 3-2.5L20 16"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconMap({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinejoin="round"
      />
      <Path d="M9 4v14M15 6v14" stroke={t.stroke} strokeWidth={t.strokeWidth} />
    </Svg>
  );
}

export function IconRadar({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8" stroke={t.stroke} strokeWidth={t.strokeWidth} />
      <Circle cx="12" cy="12" r="4" stroke={t.stroke} strokeWidth={t.strokeWidth} />
      <Path d="M12 12 18 8" stroke={t.stroke} strokeWidth={t.strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function IconEye({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12Z"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
      />
      <Circle cx="12" cy="12" r="2.5" stroke={t.stroke} strokeWidth={t.strokeWidth} />
    </Svg>
  );
}

export function IconFilter({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 6h16M7 12h10M10 18h4"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconCamera({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 8h3l1.5-2h7L17 8h3v11H4V8Z"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="13" r="3.5" stroke={t.stroke} strokeWidth={t.strokeWidth} />
    </Svg>
  );
}

export function IconPin({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
      />
      <Circle cx="12" cy="11" r="2" stroke={t.stroke} strokeWidth={t.strokeWidth} />
    </Svg>
  );
}

export function IconPhotos({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Rect x="6" y="6" width="14" height="14" rx="2" stroke={t.stroke} strokeWidth={t.strokeWidth} />
      <Path
        d="M4 16V6a2 2 0 0 1 2-2h10"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconDownload({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4v10M8 10l4 4 4-4M5 18h14"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconTrash({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconStorage({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="4" width="16" height="6" rx="1.5" stroke={t.stroke} strokeWidth={t.strokeWidth} />
      <Rect x="4" y="14" width="16" height="6" rx="1.5" stroke={t.stroke} strokeWidth={t.strokeWidth} />
      <Circle cx="8" cy="7" r="1" fill={t.stroke} />
      <Circle cx="8" cy="17" r="1" fill={t.stroke} />
    </Svg>
  );
}

export function IconSync({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 12a8 8 0 0 1-13.5 5.8M4 12A8 8 0 0 1 17.5 6.2"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M20 7v5h-5M4 17v-5h5"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconTrophy({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 4h8v5a4 4 0 0 1-8 0V4Z"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
      />
      <Path
        d="M8 6H5a2 2 0 0 0 2 4M16 6h3a2 2 0 0 1-2 4M10 17h4v3H10v-3Z"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconXp({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3v18M7 8l5-3 5 3M7 16l5 3 5-3"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconChart({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 19V10M10 19V5M15 19v-7M20 19V8"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconHelp({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8" stroke={t.stroke} strokeWidth={t.strokeWidth} />
      <Path
        d="M9.5 9.5a2.5 2.5 0 1 1 4.2 1.8c-.8.7-1.7 1.4-1.7 2.7"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="17.2" r="0.9" fill={t.stroke} />
    </Svg>
  );
}

export function IconMail({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="6" width="18" height="12" rx="2" stroke={t.stroke} strokeWidth={t.strokeWidth} />
      <Path
        d="M4 8l8 5 8-5"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconBug({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 9h8v6a4 4 0 0 1-8 0V9Z"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
      />
      <Path
        d="M12 9V6M8 12H5M19 12h-3M7 7l-2-2M17 7l2-2M7 17l-2 2M17 17l2 2"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconLightbulb({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.8c.6.5 1 1.2 1.1 2.2h4.8c.1-1 .5-1.7 1.1-2.2A6 6 0 0 0 12 3Z"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconRoadmap({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 6h6l2 3h8M4 18h6l2-3h8"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="6" cy="6" r="1.5" fill={t.stroke} />
      <Circle cx="6" cy="18" r="1.5" fill={t.stroke} />
    </Svg>
  );
}

export function IconDoc({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 3h7l5 5v13H7V3Z"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinejoin="round"
      />
      <Path d="M14 3v5h5M9 13h6M9 17h4" stroke={t.stroke} strokeWidth={t.strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function IconInfo({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8" stroke={t.stroke} strokeWidth={t.strokeWidth} />
      <Path d="M12 11v5M12 8.2v.2" stroke={t.stroke} strokeWidth={t.strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function IconLock({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Rect x="6" y="11" width="12" height="9" rx="2" stroke={t.stroke} strokeWidth={t.strokeWidth} />
      <Path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconSettings({ color, size }: IconProps) {
  const t = useStroke(color);
  const s = size ?? t.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={t.stroke} strokeWidth={t.strokeWidth} />
      <Path
        d="M12 3.5v2.2M12 18.3v2.2M4.9 6.5l1.6 1.5M17.5 16l1.6 1.5M3.5 12h2.2M18.3 12h2.2M4.9 17.5l1.6-1.5M17.5 8l1.6-1.5"
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
