import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { authService } from '@/services/auth.service';
import { catsService } from '@/services/cats.service';
import { favoritesService } from '@/services/favorites.service';
import { friendsService } from '@/services/friends.service';
import { profileService } from '@/services/profile.service';
import { notificationService } from '@/services/notification.service';
import { offlineService } from '@/services/offline.service';
import { useAuthStore } from '@/stores/auth.store';
import { useLocationStore } from '@/stores/location.store';
import { useOfflineStore } from '@/stores';
import { useNetworkStatus } from './useNetworkStatus';
import { useChatDexStore } from '@/stores';
import { getIsOnline } from '@/lib/queryClient';
import type { Session } from '@supabase/supabase-js';
import type { CreateCatInput } from '@/types';

export function useAuth() {
  const { session, user, profile, isLoading, isInitialized, setSession, setProfile, setLoading, setInitialized, reset } =
    useAuthStore();

  useEffect(() => {
    authService.getSession().then((session) => {
      setSession(session);
      if (session?.user) {
        authService.getProfile(session.user.id).then(setProfile).catch(() => {});
        authService.updateStreak(session.user.id).catch(() => {});
        notificationService.registerPushToken(session.user.id).catch(() => {});
      }
      setLoading(false);
      setInitialized(true);
    });

    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      const s = session as Session | null;
      setSession(s);
      if (s?.user) {
        authService.getProfile(s.user.id).then(setProfile).catch(() => {});
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, user, profile, isLoading, isInitialized, reset };
}

export function useNearbyCats(lat?: number, lng?: number) {
  const { setNearbyCats } = useLocationStore();
  const isOnline = getIsOnline();

  return useQuery({
    queryKey: queryKeys.nearbyCats(lat ?? 0, lng ?? 0),
    queryFn: async () => {
      if (!lat || !lng) return [];
      if (!isOnline) {
        const cached = offlineService.getCachedNearbyCats();
        setNearbyCats(cached);
        return cached;
      }
      const cats = await catsService.getNearbyCats(lat, lng);
      offlineService.cacheNearbyCats(cats);
      setNearbyCats(cats);
      return cats;
    },
    enabled: !!lat && !!lng,
    refetchInterval: 60000,
  });
}

export function useChatDex() {
  const { user } = useAuthStore();
  const { filters } = useChatDexStore();

  return useQuery({
    queryKey: queryKeys.chatdex(JSON.stringify(filters)),
    queryFn: async () => {
      const cats = await catsService.getAllCats(user?.id);
      return catsService.filterCats(cats, filters);
    },
    enabled: !!user,
  });
}

export function useCat(catId: string) {
  return useQuery({
    queryKey: queryKeys.cat(catId),
    queryFn: () => catsService.getCat(catId),
    enabled: !!catId,
  });
}

export function useCreateCat() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { setPendingUploads } = useOfflineStore();

  return useMutation({
    mutationFn: async (input: CreateCatInput) => {
      if (!user) throw new Error('Not authenticated');
      if (!getIsOnline()) {
        offlineService.addToUploadQueue({ type: 'cat_creation', payload: input });
        setPendingUploads(offlineService.getPendingUploadCount());
        return null;
      }
      const cat = await catsService.createCat(user.id, input);
      await profileService.checkAndAwardBadges(user.id);
      return cat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatdex'] });
      queryClient.invalidateQueries({ queryKey: ['nearbyCats'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (catId: string) => {
      if (!user) throw new Error('Not authenticated');
      return favoritesService.toggleFavorite(user.id, catId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatdex'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useFavorites() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.favorites(user?.id ?? ''),
    queryFn: () => favoritesService.getFavorites(user!.id),
    enabled: !!user,
  });
}

export function useFriends() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.friends(user?.id ?? ''),
    queryFn: () => friendsService.getFriends(user!.id),
    enabled: !!user,
  });
}

export function useFriendRequests() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.friendRequests(user?.id ?? ''),
    queryFn: () => friendsService.getPendingRequests(user!.id),
    enabled: !!user,
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: queryKeys.leaderboard(),
    queryFn: () => friendsService.getLeaderboard(),
  });
}

export function useUserSearch(query: string) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.userSearch(query),
    queryFn: () => friendsService.searchUsers(query, user!.id),
    enabled: !!user && query.length >= 2,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (addresseeId: string) => {
      if (!user) throw new Error('Not authenticated');
      return friendsService.sendFriendRequest(user.id, addresseeId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friends'] }),
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendId: string) => friendsService.acceptFriendRequest(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
  });
}

export function useProfileStats() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.stats(user?.id ?? ''),
    queryFn: () => profileService.getStats(user!.id),
    enabled: !!user,
  });
}

export function useBadges() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.badges(user?.id ?? ''),
    queryFn: () => profileService.getBadges(user!.id),
    enabled: !!user,
  });
}

export function useNotifications() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.notifications(user?.id ?? ''),
    queryFn: () => notificationService.getNotifications(user!.id),
    enabled: !!user,
    refetchInterval: 30000,
  });
}

export function useOfflineSync() {
  const { user } = useAuthStore();
  const { setOnline, setPendingUploads, setLastSyncTime, setSyncing } = useOfflineStore();

  useEffect(() => {
    if (!user) return;

    setPendingUploads(offlineService.getPendingUploadCount());
    setLastSyncTime(offlineService.getLastSyncTime());

    const unsubscribe = offlineService.setupAutoSync(user.id, (result) => {
      setSyncing(false);
      setPendingUploads(offlineService.getPendingUploadCount());
      setLastSyncTime(new Date().toISOString());
    });

    return unsubscribe;
  }, [user?.id]);
}
