import { API_BASE } from '../constants/api';
import type {
  PhotoAnalysisResult,
  DiscoveryResult,
  MapCatPin,
  Cat,
  Mission,
  Season,
  LeaderboardEntry,
  FriendDiscovery,
  Badge,
  UserProfile,
} from '@catdex/shared';

const DEFAULT_USER_ID = 'user-1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'x-user-id': DEFAULT_USER_ID,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface UserProfileResponse extends UserProfile {
  xpProgress: { current: number; required: number; progress: number };
}

export interface CatProfileResponse extends Cat {
  observations: Array<{ id: string; username: string; observed_at: string; photo_url: string }>;
  comments: Array<{ id: string; username: string; text: string; created_at: string }>;
  isLiked: boolean;
}

export interface ChatDexResponse {
  recentCats: Cat[];
  totalSeen: number;
}

export const api = {
  getProfile: () => request<UserProfileResponse>('/users/me'),
  getMapCats: (bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
    const params = bounds
      ? `?minLat=${bounds.minLat}&maxLat=${bounds.maxLat}&minLng=${bounds.minLng}&maxLng=${bounds.maxLng}`
      : '';
    return request<MapCatPin[]>(`/map/cats${params}`);
  },
  getCat: (id: string) => request<CatProfileResponse>(`/cats/${id}`),
  discoverCat: async (uri: string, latitude: number, longitude: number, name?: string) => {
    const formData = new FormData();
    formData.append('photo', { uri, type: 'image/jpeg', name: 'cat.jpg' } as unknown as Blob);
    formData.append('latitude', String(latitude));
    formData.append('longitude', String(longitude));
    if (name) formData.append('name', name);
    return request<DiscoveryResult>('/discover', { method: 'POST', body: formData });
  },
  analyzePhoto: async (uri: string) => {
    const formData = new FormData();
    formData.append('photo', { uri, type: 'image/jpeg', name: 'cat.jpg' } as unknown as Blob);
    return request<PhotoAnalysisResult>('/analyze', { method: 'POST', body: formData });
  },
  likeCat: (id: string) => request<{ liked: boolean; likes: number }>(`/cats/${id}/like`, { method: 'POST' }),
  favoriteCat: (id: string) => request<{ favorited: boolean }>(`/cats/${id}/favorite`, { method: 'POST' }),
  commentCat: (id: string, text: string) =>
    request<{ success: boolean }>(`/cats/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }),
  getLeaderboard: () => request<LeaderboardEntry[]>('/leaderboard'),
  getFriendsDiscoveries: () => request<FriendDiscovery[]>('/friends/discoveries'),
  getMissions: () => request<Mission[]>('/missions'),
  getBadges: () => request<Badge[]>('/badges'),
  getSeason: () => request<Season>('/season'),
  getChatDex: () => request<ChatDexResponse>('/chatdex'),
};
