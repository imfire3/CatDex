import { Easing } from 'react-native-reanimated';

/**
 * Motion tokens — prepare curves without wiring product flows.
 * Respect reduced motion at the call site via useReducedMotion.
 */

export const motionDuration = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

export type MotionSpeed = keyof typeof motionDuration;

/** Natural ease-out for UI settles */
export const motionEasing = {
  standard: Easing.bezier(0.25, 0.1, 0.25, 1),
  emphasized: Easing.bezier(0.2, 0, 0, 1),
  decelerate: Easing.bezier(0, 0, 0.2, 1),
  accelerate: Easing.bezier(0.3, 0, 1, 1),
  spring: {
    damping: 18,
    stiffness: 220,
    mass: 0.9,
  },
} as const;

export const motion = {
  duration: motionDuration,
  easing: motionEasing,
} as const;
