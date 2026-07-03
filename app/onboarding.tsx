import { Redirect } from "expo-router";

/** Legacy route — redirects to the current onboarding flow. */
export default function LegacyOnboardingRedirect() {
  return <Redirect href="/(onboarding)/welcome" />;
}
