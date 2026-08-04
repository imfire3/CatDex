/**
 * Helpers so CatDex photos survive persistence (AsyncStorage) and web reloads.
 * Blob / temporary camera URIs break; data: and http(s) URIs do not.
 */

export function isDurablePhotoUri(uri: string): boolean {
  return (
    uri.startsWith('data:') ||
    uri.startsWith('https://') ||
    uri.startsWith('http://')
  );
}

export function toDataUri(base64: string, mimeType = 'image/jpeg'): string {
  const cleaned = base64.includes('base64,')
    ? base64.slice(base64.indexOf('base64,') + 'base64,'.length)
    : base64;
  return `data:${mimeType};base64,${cleaned}`;
}

/** Prefer a durable URI for storage / collection tiles. */
export function resolvePersistentPhotoUri(options: {
  uri?: string | null;
  base64?: string | null;
  mimeType?: string;
}): string | null {
  const { uri, base64, mimeType = 'image/jpeg' } = options;
  if (uri && isDurablePhotoUri(uri)) return uri;
  if (base64) return toDataUri(base64, mimeType);
  return uri?.trim() ? uri : null;
}
