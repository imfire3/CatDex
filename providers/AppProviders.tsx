import { useEffect } from "react";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { LocationProvider } from "@/providers/LocationProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { UIProvider } from "@/providers/UIProvider";
import { authService } from "@/services/auth.service";
import { syncService } from "@/services/sync.service";

function SessionEffects() {
  const { session, profile, refreshProfile } = useAuth();

  useEffect(() => {
    syncService.processQueue().catch(() => undefined);
    return syncService.startAutoSync();
  }, []);

  useEffect(() => {
    if (!session?.user.id || !profile) return;
    authService.touchDailyStreak(session.user.id, profile).then(() => refreshProfile()).catch(() => undefined);
  }, [session?.user.id, profile?.id]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <LocationProvider>
          <UIProvider>
            <SessionEffects />
            {children}
          </UIProvider>
        </LocationProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
