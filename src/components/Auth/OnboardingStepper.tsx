/** Post-auth onboarding: a single beat, then the map. */
export const ONBOARDING_STEP_COUNT = 1;

export const ONBOARDING_STEP_LABELS = ['Découverte'] as const;

/** @deprecated Prefer `ProgressDots` from `@/components/Auth/Onboarding`. */
export { ProgressDots as OnboardingStepper, ProgressDots } from './Onboarding';
