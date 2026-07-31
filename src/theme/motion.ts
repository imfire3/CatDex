/**
 * Motion — 200–350ms ease-out game feel + spring reveals.
 */
export const motionDuration = {
  instant: 80,
  fast: 200,
  normal: 260,
  standard: 260,
  slow: 350,
  reveal: 520,
} as const;

export type MotionSpeed = keyof typeof motionDuration;

export const motionEasing = {
  standard: { damping: 22, stiffness: 240 },
  spring: { damping: 14, stiffness: 180 },
  bouncy: { damping: 10, stiffness: 220 },
} as const;

export const motion = {
  duration: motionDuration,
  easing: motionEasing,
  pressScale: 0.97,
  cardPressScale: 0.985,
} as const;
