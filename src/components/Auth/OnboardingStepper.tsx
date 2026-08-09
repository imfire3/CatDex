/** Post-auth onboarding flow length: Intro → Permissions → Camera → Location */
export const ONBOARDING_STEP_COUNT = 4;

export const ONBOARDING_STEP_LABELS = [
  'Découverte',
  'Récompenses',
  'Caméra',
  'Position',
] as const;

/** @deprecated Prefer `ProgressDots` from `@/components/Auth/Onboarding`. */
export { ProgressDots as OnboardingStepper, ProgressDots } from './Onboarding';
