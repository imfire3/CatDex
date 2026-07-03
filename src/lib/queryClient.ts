import { QueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const queryKeys = {
  profile: (userId: string) => ['profile', userId] as const,
  nearbyCats: (lat: number, lng: number) => ['nearbyCats', lat, lng] as const,
  cat: (catId: string) => ['cat', catId] as const,
  chatdex: (filters: string) => ['chatdex', filters] as const,
  favorites: (userId: string) => ['favorites', userId] as const,
  friends: (userId: string) => ['friends', userId] as const,
  friendRequests: (userId: string) => ['friendRequests', userId] as const,
  leaderboard: () => ['leaderboard'] as const,
  badges: (userId: string) => ['badges', userId] as const,
  stats: (userId: string) => ['stats', userId] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
  userSearch: (query: string) => ['userSearch', query] as const,
};

let isOnline = true;

NetInfo.addEventListener((state) => {
  isOnline = state.isConnected ?? false;
});

export function getIsOnline(): boolean {
  return isOnline;
}
