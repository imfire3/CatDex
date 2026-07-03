import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { toUICat, capturesToUICats, toUIBadge, toUIFriend, toLeaderboardEntry } from "@/lib/adapters";
import { catsService } from "@/services/cats.service";
import { mapService } from "@/services/map.service";
import { badgesService } from "@/services/badges.service";
import { friendsService } from "@/services/friends.service";
import { notificationsService } from "@/services/notifications.service";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

export function useZones() {
  return useQuery({
    queryKey: queryKeys.zones,
    queryFn: () => mapService.fetchZones(),
  });
}

export function useCats() {
  return useQuery({
    queryKey: queryKeys.cats,
    queryFn: () => mapService.fetchCats(),
    staleTime: 60_000,
  });
}

export function useNearbyCats(lat: number, lng: number, userId?: string) {
  const { data: cats = [] } = useCats();
  const { data: captures = [] } = useCaptures(userId);

  return useMemo(() => {
    const capturedIds = new Set(captures.map((c) => c.cat_id));
    const toUi = (cat: (typeof cats)[number]) =>
      toUICat(cat, { discovered: capturedIds.has(cat.id) });

    const nearbyCats = mapService.getNearby(cats, lat, lng);
    return {
      cats: cats.map(toUi),
      nearby: nearbyCats.map(toUi),
    };
  }, [cats, captures, lat, lng]);
}

export function useCaptures(userId?: string) {
  return useQuery({
    queryKey: queryKeys.captures(userId ?? ""),
    queryFn: () => catsService.fetchUserCaptures(userId!),
    enabled: Boolean(userId),
    select: (data) => data ?? [],
  });
}

export function useChatDex(userId?: string) {
  const capturesQuery = useCaptures(userId);
  const favoritesQuery = useFavorites(userId);
  const catsQuery = useCats();

  const capturedIds = new Set((capturesQuery.data ?? []).map((c) => c.cat_id));
  const favorites = favoritesQuery.data ?? new Set<string>();

  const allCats = (catsQuery.data ?? []).map((cat) =>
    toUICat(cat, {
      discovered: capturedIds.has(cat.id),
      favorite: favorites.has(cat.id),
      gallery: capturedIds.has(cat.id) ? [cat.photo_url] : [],
    })
  );

  const discoveredCats = capturesToUICats(capturesQuery.data ?? []);

  return {
    allCats,
    discoveredCats,
    captures: capturesQuery.data ?? [],
    isLoading: capturesQuery.isLoading || catsQuery.isLoading,
    refetch: () => {
      capturesQuery.refetch();
      catsQuery.refetch();
    },
  };
}

export function useCatDetail(catId: string, userId?: string) {
  return useQuery({
    queryKey: queryKeys.cat(catId),
    queryFn: async () => {
      const [cat, photos, observations, favorites] = await Promise.all([
        catsService.fetchCatById(catId),
        catsService.fetchCatPhotos(catId),
        catsService.fetchObservations(catId),
        userId ? catsService.fetchFavorites(userId) : Promise.resolve(new Set<string>()),
      ]);

      const { data: captures } = userId
        ? await supabase.from("captures").select("cat_id").eq("user_id", userId)
        : { data: [] };

      const discovered = (captures ?? []).some((c) => c.cat_id === catId);

      return toUICat(cat, {
        discovered,
        favorite: favorites.has(catId),
        gallery: photos.map((p) => p.photo_url),
        observations,
        sightings: photos.length + observations.length,
      });
    },
    enabled: Boolean(catId),
  });
}

export function useFavorites(userId?: string) {
  return useQuery({
    queryKey: queryKeys.favorites(userId ?? ""),
    queryFn: () => catsService.fetchFavorites(userId!),
    enabled: Boolean(userId),
  });
}

export function useToggleFavorite(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ catId, favorite }: { catId: string; favorite: boolean }) =>
      catsService.toggleFavorite(userId, catId, favorite),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.favorites(userId) });
      qc.invalidateQueries({ queryKey: queryKeys.cats });
    },
  });
}

export function useBadges(userId?: string) {
  return useQuery({
    queryKey: queryKeys.userBadges(userId ?? ""),
    queryFn: async () => {
      const [badges, userBadges] = await Promise.all([
        badgesService.fetchAllBadges(),
        badgesService.fetchUserBadges(userId!),
      ]);
      const map = new Map(userBadges.map((ub) => [ub.badge_id, ub]));
      return badges.map((b) => toUIBadge(b, map.get(b.id)));
    },
    enabled: Boolean(userId),
  });
}

export function useFriends(userId?: string) {
  return useQuery({
    queryKey: queryKeys.friends(userId ?? ""),
    queryFn: async () => {
      const friendships = await friendsService.fetchFriends(userId!);
      const friendIds = friendships.map((f) =>
        f.requester_id === userId ? f.addressee_id : f.requester_id
      );

      if (friendIds.length === 0) return [];

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .in("id", friendIds);
      if (error) throw error;

      return (profiles as Profile[]).map((p) => toUIFriend(p, p.total_captures, false));
    },
    enabled: Boolean(userId),
  });
}

export function useLeaderboard(userId?: string) {
  return useQuery({
    queryKey: queryKeys.leaderboard,
    queryFn: async () => {
      const profiles = await friendsService.fetchLeaderboard();
      return profiles.map((p, i) => toLeaderboardEntry(p, i + 1, p.id === userId));
    },
  });
}

export function useProfileStats(userId?: string) {
  return useQuery({
    queryKey: queryKeys.profile(userId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: Boolean(userId),
  });
}

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: queryKeys.notifications(userId ?? ""),
    queryFn: () => notificationsService.fetchNotifications(userId!),
    enabled: Boolean(userId),
  });
}
