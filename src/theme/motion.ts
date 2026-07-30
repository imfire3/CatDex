/**
 * Motion — smooth, premium, never abrupt.
 */
export const motionDuration = {
  instant: 80,
  fast: 160,
  normal: 240,
  slow: 400,
  reveal: 600,
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
  pressScale: 0.96,
  cardPressScale: 0.98,
} as const;
