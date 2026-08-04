import { Platform } from 'react-native';

import { toDataUri } from '@/lib/photoUri';

const PHOTO_REF_PREFIX = 'catphoto:';
const IDB_NAME = 'catdex-photos-v1';
const IDB_STORE = 'photos';

/** Soft cap for canvas compression — keeps IndexedDB lean. */
const MAX_EDGE = 720;
const JPEG_QUALITY = 0.55;

export function isCatPhotoRef(uri: string | null | undefined): boolean {
  return Boolean(uri?.startsWith(PHOTO_REF_PREFIX));
}

export function toCatPhotoRef(catId: string): string {
  return `${PHOTO_REF_PREFIX}${catId}`;
}

export function catIdFromPhotoRef(ref: string): string | null {
  if (!isCatPhotoRef(ref)) return null;
  return ref.slice(PHOTO_REF_PREFIX.length) || null;
}

function stripDataUrl(input: string): { mimeType: string; base64: string } {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(input.trim());
  if (match) return { mimeType: match[1], base64: match[2] };
  return { mimeType: 'image/jpeg', base64: input.trim() };
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

/** Shrink large captures before durable storage (web canvas). */
export async function compressPhotoDataUri(
  dataUri: string,
  maxEdge = MAX_EDGE,
  quality = JPEG_QUALITY,
): Promise<string> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return dataUri;
  if (!dataUri.startsWith('data:')) return dataUri;

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image load failed'));
      el.src = dataUri;
    });

    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUri;
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return dataUri;
  }
}

function openPhotoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
  });
}

async function idbPut(catId: string, blob: Blob): Promise<void> {
  const db = await openPhotoDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(blob, catId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB put failed'));
  });
  db.close();
}

async function idbGet(catId: string): Promise<Blob | null> {
  const db = await openPhotoDb();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(catId);
    req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB get failed'));
  });
  db.close();
  return blob;
}

async function idbDelete(catId: string): Promise<void> {
  const db = await openPhotoDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(catId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB delete failed'));
  });
  db.close();
}

async function persistNativeFile(catId: string, dataUri: string): Promise<string> {
  const FileSystem = await import('expo-file-system');
  const legacy = FileSystem as typeof FileSystem & {
    documentDirectory?: string | null;
    writeAsStringAsync?: (
      uri: string,
      contents: string,
      options?: { encoding?: string },
    ) => Promise<void>;
    makeDirectoryAsync?: (uri: string, options?: { intermediates?: boolean }) => Promise<void>;
  };

  const root = legacy.documentDirectory;
  if (!root || !legacy.writeAsStringAsync) {
    // Web/native fallback — keep compressed data URI only if tiny
    return dataUri.length < 180_000 ? dataUri : '';
  }

  const dir = `${root}cat-photos/`;
  try {
    await legacy.makeDirectoryAsync?.(dir, { intermediates: true });
  } catch {
    // exists
  }

  const { base64 } = stripDataUrl(dataUri);
  const path = `${dir}${catId}.jpg`;
  await legacy.writeAsStringAsync(path, base64, { encoding: 'base64' });
  return path;
}

/**
 * Persist a capture outside AsyncStorage/localStorage.
 * Returns a lightweight `catphoto:{id}` ref (web) or file path (native).
 */
export async function persistCatPhoto(catId: string, photoUri: string): Promise<string> {
  if (!photoUri || photoUri.startsWith('blob:')) {
    throw new Error('Photo éphémère — impossible à sauvegarder');
  }
  if (isCatPhotoRef(photoUri) || photoUri.startsWith('file:')) {
    return isCatPhotoRef(photoUri) ? photoUri : photoUri;
  }

  let dataUri = photoUri.startsWith('data:')
    ? photoUri
    : photoUri; // http(s) left as-is
  if (photoUri.startsWith('http://') || photoUri.startsWith('https://')) {
    return photoUri;
  }

  if (!dataUri.startsWith('data:')) {
    // Treat raw base64
    dataUri = toDataUri(photoUri, 'image/jpeg');
  }

  dataUri = await compressPhotoDataUri(dataUri);

  if (Platform.OS === 'web' && typeof indexedDB !== 'undefined') {
    const { mimeType, base64 } = stripDataUrl(dataUri);
    await idbPut(catId, base64ToBlob(base64, mimeType || 'image/jpeg'));
    return toCatPhotoRef(catId);
  }

  return persistNativeFile(catId, dataUri);
}

/** Resolve a stored ref to an Image-ready URI (may be a blob: object URL). */
export async function resolveCatPhotoUri(photoUri: string): Promise<string | null> {
  if (!photoUri || photoUri.startsWith('blob:') || photoUri.startsWith('demo')) {
    return null;
  }
  if (isCatPhotoRef(photoUri)) {
    if (Platform.OS !== 'web' || typeof indexedDB === 'undefined') return null;
    const catId = catIdFromPhotoRef(photoUri);
    if (!catId) return null;
    const blob = await idbGet(catId);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  }
  return photoUri;
}

export async function deleteCatPhoto(photoUri: string | null | undefined): Promise<void> {
  if (!photoUri) return;
  if (isCatPhotoRef(photoUri)) {
    const catId = catIdFromPhotoRef(photoUri);
    if (!catId) return;
    if (Platform.OS === 'web' && typeof indexedDB !== 'undefined') {
      await idbDelete(catId);
    }
    return;
  }
  if (photoUri.startsWith('file:') && Platform.OS !== 'web') {
    try {
      const FileSystem = await import('expo-file-system');
      const legacy = FileSystem as typeof FileSystem & {
        deleteAsync?: (uri: string, options?: { idempotent?: boolean }) => Promise<void>;
      };
      await legacy.deleteAsync?.(photoUri, { idempotent: true });
    } catch {
      // ignore
    }
  }
}

type SlimCat = { id: string; photoUri: string; [key: string]: unknown };

/** Move inline data: URIs out of localStorage into IndexedDB / files. */
export async function migrateInlineCatPhotos<T extends SlimCat>(cats: T[]): Promise<T[]> {
  let changed = false;
  const next: T[] = [];

  for (const cat of cats) {
    if (typeof cat.photoUri === 'string' && cat.photoUri.startsWith('data:')) {
      try {
        const ref = await persistCatPhoto(cat.id, cat.photoUri);
        next.push({ ...cat, photoUri: ref });
        changed = true;
        continue;
      } catch (error) {
        console.warn('[photoStorage] migrate failed', cat.id, error);
        next.push({ ...cat, photoUri: '' });
        changed = true;
        continue;
      }
    }
    next.push(cat);
  }

  return changed ? next : cats;
}

/**
 * Emergency reclaim when localStorage is already over quota from old data: URIs.
 * Safe to call at startup on web.
 */
export async function reclaimPhotoQuotaFromLocalStorage(): Promise<void> {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') return;

  try {
    const raw = localStorage.getItem('catdex-cats');
    if (!raw || !raw.includes('data:image')) return;

    const parsed = JSON.parse(raw) as {
      state?: { cats?: SlimCat[]; nextNumber?: number };
      cats?: SlimCat[];
    };
    const state = parsed.state ?? parsed;
    const cats = state.cats;
    if (!Array.isArray(cats) || cats.length === 0) return;

    const migrated = await migrateInlineCatPhotos(cats);
    const nextPayload = {
      ...parsed,
      state: {
        ...(parsed.state ?? {}),
        cats: migrated,
        nextNumber: (parsed.state?.nextNumber ?? (state as { nextNumber?: number }).nextNumber) ?? 1,
      },
    };
    localStorage.setItem('catdex-cats', JSON.stringify(nextPayload));
  } catch (error) {
    console.warn('[photoStorage] reclaim failed, clearing photo payloads', error);
    try {
      const raw = localStorage.getItem('catdex-cats');
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        state?: { cats?: SlimCat[]; nextNumber?: number };
      };
      const cats = (parsed.state?.cats ?? []).map((cat) =>
        typeof cat.photoUri === 'string' && cat.photoUri.startsWith('data:')
          ? { ...cat, photoUri: '' }
          : cat,
      );
      localStorage.setItem(
        'catdex-cats',
        JSON.stringify({
          ...parsed,
          state: { ...parsed.state, cats },
        }),
      );
    } catch {
      // last resort — leave as-is; UI will show sprite
    }
  }
}
