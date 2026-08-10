import Constants from 'expo-constants';

const API_PORT = 8787;

/** Last-resort Vision API when local `:8787` is down / missing OPENAI_API_KEY. */
const DEFAULT_REMOTE_API_URL = 'https://catdex-api.onrender.com';

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

function isLocalApiUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.local')
    );
  } catch {
    return false;
  }
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

  // Must read process.env.EXPO_PUBLIC_* without optional chaining so Expo can inline it.
  const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;
  const fromEnv = typeof rawApiUrl === 'string' ? rawApiUrl.trim() : '';

  // Production / store builds must only hit the configured HTTPS API.
  if (!__DEV__) {
    if (fromEnv) push(fromEnv);
    return candidates;
  }

  // Dev: prefer local API first (fast), then optional remote fallback.
  const devHost = getExpoDevHost();
  if (devHost) push(`http://${devHost}:${API_PORT}`);
  push(`http://localhost:${API_PORT}`);
  push(`http://127.0.0.1:${API_PORT}`);

  if (fromEnv && !isLocalApiUrl(fromEnv)) {
    push(fromEnv);
  } else if (fromEnv) {
    push(fromEnv);
  }

  // Dev without .env still needs a remote fallback (auth required there).
  push(DEFAULT_REMOTE_API_URL);

  return candidates;
}

export function getPrimaryApiUrl(): string {
  return getApiCandidateUrls()[0] ?? `http://localhost:${API_PORT}`;
}
