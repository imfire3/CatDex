/** Post-auth onboarding: 4 narrative beats — walk → photo → AI → CatDex. */
export const ONBOARDING_STEP_COUNT = 4;

export const ONBOARDING_STEP_LABELS = [
  'Promenade',
  'Photo',
  'Analyse',
  'Collection',
] as const;

/** @deprecated Prefer `ProgressDots` from `@/components/Auth/Onboarding`. */
export { ProgressDots as OnboardingStepper, ProgressDots } from './Onboarding';
