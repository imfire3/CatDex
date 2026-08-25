/** Post-auth onboarding: two value screens, then the contextual GPS gate. */
export const ONBOARDING_STEP_COUNT = 2;

export const ONBOARDING_STEP_LABELS = [
  'Découverte',
  'Analyse',
] as const;

/** @deprecated Prefer `ProgressDots` from `@/components/Auth/Onboarding`. */
export { ProgressDots as OnboardingStepper, ProgressDots } from './Onboarding';
