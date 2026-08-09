/** Post-auth onboarding: 3 game intro screens → camera → location */
export const ONBOARDING_STEP_COUNT = 5;

export const ONBOARDING_STEP_LABELS = [
  'Découverte',
  'Analyse',
  'Récompense',
  'Caméra',
  'Position',
] as const;

/** @deprecated Prefer `ProgressDots` from `@/components/Auth/Onboarding`. */
export { ProgressDots as OnboardingStepper, ProgressDots } from './Onboarding';
