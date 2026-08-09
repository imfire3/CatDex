import { useEffect, useState } from 'react';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  value: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
};

/** Counts up XP with a short tween (JS-driven for RN Text reliability). */
export function XpTicker({
  value,
  durationMs = 900,
  prefix = '+',
  suffix = ' XP',
}: Props) {
  const { fonts } = useTheme();
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) * (1 - t);
      setDisplay(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationMs, reduceMotion, value]);

  return (
    <Text variant="h2" color="textBrand" align="center" style={{ fontFamily: fonts.bodySemi }}>
      {prefix}
      {display}
      {suffix}
    </Text>
  );
}
