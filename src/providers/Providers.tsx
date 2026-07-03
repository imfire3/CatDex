import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuth, useOfflineSync } from '@/hooks';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

function AppInitializer({ children }: { children: React.ReactNode }) {
  useAuth();
  useOfflineSync();
  useNetworkStatus();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInitializer>{children}</AppInitializer>
    </QueryClientProvider>
  );
}
