import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({ id: 'catdex-storage' });

export const cacheStorage = new MMKV({ id: 'catdex-cache' });

export const offlineStorage = new MMKV({ id: 'catdex-offline' });

export function getJson<T>(key: string, store: MMKV = storage): T | null {
  const value = store.getString(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function setJson<T>(key: string, value: T, store: MMKV = storage): void {
  store.set(key, JSON.stringify(value));
}

export function removeKey(key: string, store: MMKV = storage): void {
  store.delete(key);
}

export const StorageKeys = {
  NEARBY_CATS: 'nearby_cats',
  UPLOAD_QUEUE: 'upload_queue',
  CACHED_PROFILE: 'cached_profile',
  LAST_SYNC: 'last_sync',
  CHATDEX_CACHE: 'chatdex_cache',
  FAVORITES_CACHE: 'favorites_cache',
} as const;
