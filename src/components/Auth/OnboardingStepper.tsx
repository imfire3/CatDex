/** Post-auth onboarding: 3 game intro screens — permissions asked in-game. */
export const ONBOARDING_STEP_COUNT = 3;

export const ONBOARDING_STEP_LABELS = [
  'Découverte',
  'Analyse',
  'Récompense',
] as const;

/** @deprecated Prefer `ProgressDots` from `@/components/Auth/Onboarding`. */
export { ProgressDots as OnboardingStepper, ProgressDots } from './Onboarding';
