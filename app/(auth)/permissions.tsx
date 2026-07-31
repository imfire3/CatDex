import { Redirect } from 'expo-router';
import { useEffect } from 'react';

import { useAuthStore } from '@/store/auth';

/**
 * Permissions are requested just-in-time (Map → location, Scanner → camera).
 * This route remains for deep links / old stacks and forwards to the map.
 */
export default function PermissionsScreen() {
  const user = useAuthStore((state) => state.user);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  useEffect(() => {
    if (user && !onboardingCompleted) {
      completeOnboarding();
    }
  }, [completeOnboarding, onboardingCompleted, user]);

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return <Redirect href="/(tabs)/map" />;
}
