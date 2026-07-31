/**
 * Motion — semantic durations for pressed, sheets, reveal.
 */
export const motionDuration = {
  instant: 80,
  fast: 140,
  normal: 220,
  standard: 220,
  slow: 320,
  reveal: 520,
} as const;

export type MotionSpeed = keyof typeof motionDuration;

export const motionEasing = {
  standard: { damping: 20, stiffness: 220 },
  spring: { damping: 16, stiffness: 180 },
  bouncy: { damping: 12, stiffness: 200 },
} as const;

export const motion = {
  duration: motionDuration,
  easing: motionEasing,
  pressScale: 0.98,
  cardPressScale: 0.99,
} as const;
