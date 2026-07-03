import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { signOut } from "@/lib/auth";
import { authModeStore, isAnonymousSession, isAuthenticatedSession } from "@/lib/auth-mode";

const NAV_TIMEOUT_MS = 4000;

export function useAuthGate() {
  const router = useRouter();
  const { session, profile, loading, profileLoading } = useAuth();
  const clearingGuest = useRef(false);

  useEffect(() => {
    if (loading || profileLoading || clearingGuest.current) return;

    const navigate = async () => {
      if (session && isAnonymousSession(session) && !authModeStore.isGuest()) {
        clearingGuest.current = true;
        try {
          await signOut();
        } catch {
          /* ignore */
        } finally {
          clearingGuest.current = false;
        }
        router.replace("/(auth)/login");
        return;
      }

      if (!isAuthenticatedSession(session)) {
        router.replace("/(auth)/login");
        return;
      }

      if (!profile) {
        router.replace("/(onboarding)/welcome");
        return;
      }

      if (!profile.onboarding_completed) {
        router.replace("/(onboarding)/welcome");
        return;
      }

      router.replace("/(tabs)/map");
    };

    navigate().catch(() => router.replace("/(auth)/login"));
  }, [loading, profileLoading, session, profile, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading && !profileLoading && !isAuthenticatedSession(session)) {
        router.replace("/(auth)/login");
      }
    }, NAV_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [loading, profileLoading, session, router]);
}
