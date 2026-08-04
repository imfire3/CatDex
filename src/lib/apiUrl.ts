import Constants from 'expo-constants';

const API_PORT = 8787;

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

/** Host Expo uses for Metro — same machine as the dev API. */
function getExpoDevHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0]?.trim();
    if (host) return host;
  }

  const manifest = Constants.expoConfig as { debuggerHost?: string } | null;
  const debuggerHost = manifest?.debuggerHost;
  if (debuggerHost) {
    const host = debuggerHost.split(':')[0]?.trim();
    if (host) return host;
  }

  return null;
}

/** Ordered list of API bases to try (deduped). */
export function getApiCandidateUrls(): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const push = (url: string) => {
    const normalized = normalizeBaseUrl(url);
    if (seen.has(normalized)) return;
    seen.add(normalized);
    candidates.push(normalized);
  };

  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) push(fromEnv);

  // Production / store builds must only hit the configured HTTPS API.
  if (!__DEV__) {
    return candidates;
  }

  const devHost = getExpoDevHost();
  if (devHost) push(`http://${devHost}:${API_PORT}`);

  push(`http://localhost:${API_PORT}`);
  push(`http://127.0.0.1:${API_PORT}`);

  return candidates;
}

export function getPrimaryApiUrl(): string {
  return getApiCandidateUrls()[0] ?? `http://localhost:${API_PORT}`;
}

export function getApiSecret(): string | undefined {
  const secret = process.env.EXPO_PUBLIC_API_SECRET?.trim();
  return secret || undefined;
}
