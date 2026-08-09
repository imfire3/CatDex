import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/auth';

/**
 * Legacy route — camera is requested in-game via EnablePermissionModal
 * when the user taps Capture.
 */
export default function PermissionCameraScreen() {
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (!onboardingCompleted) {
    return <Redirect href="/(auth)/onboarding-reward" />;
  }
  return <Redirect href="/(tabs)/map" />;
}
