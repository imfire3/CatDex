import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

export type AnalyzeAuthUser = {
  id: string;
  email?: string;
};

type RateBucket = {
  count: number;
  resetAt: number;
};

const rateBuckets = new Map<string, RateBucket>();

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function allowUnauthAnalyze(): boolean {
  const flag = process.env.ALLOW_UNAUTH_ANALYZE?.trim().toLowerCase();
  // Explicit lock-down only. Beta keeps Vision working even when JWT verify is broken.
  if (flag === '0' || flag === 'false') return false;
  return true;
}

export function getAnalyzeRateLimit(): number {
  const raw = Number(process.env.ANALYZE_RATE_LIMIT ?? 20);
  return Number.isFinite(raw) && raw > 0 ? raw : 20;
}

export function getAnalyzeMaxBytes(): number {
  const raw = Number(process.env.ANALYZE_MAX_BYTES ?? 5_000_000);
  return Number.isFinite(raw) && raw > 0 ? raw : 5_000_000;
}

/** Approximate decoded size from base64 length. */
export function estimateDecodedBytes(base64: string): number {
  const len = base64.replace(/\s/g, '').length;
  return Math.floor((len * 3) / 4);
}

export function isAllowedMime(mimeType: string): boolean {
  const normalized = mimeType.toLowerCase().split(';')[0]?.trim() ?? '';
  return ALLOWED_MIMES.has(normalized);
}

export function consumeRateLimit(userKey: string): {
  ok: boolean;
  remaining: number;
  resetAt: number;
} {
  const limit = getAnalyzeRateLimit();
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const existing = rateBuckets.get(userKey);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    rateBuckets.set(userKey, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  rateBuckets.set(userKey, existing);
  return {
    ok: true,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

function getSupabaseUrl(): string | null {
  const url = process.env.SUPABASE_URL?.trim() || process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  return url ? url.replace(/\/+$/, '') : null;
}

function getSupabaseApiKey(): string | null {
  return (
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    null
  );
}

function getJwtSecret(): Uint8Array | null {
  const secret =
    process.env.SUPABASE_JWT_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim();
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  const base = getSupabaseUrl();
  if (!base) return null;
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`${base}/auth/v1/.well-known/jwks.json`),
    );
  }
  return jwks;
}

function payloadToUser(payload: JWTPayload): AnalyzeAuthUser | null {
  const id = typeof payload.sub === 'string' ? payload.sub : null;
  if (!id) return null;
  const email =
    typeof payload.email === 'string'
      ? payload.email
      : typeof (payload as { user_metadata?: { email?: string } }).user_metadata
            ?.email === 'string'
        ? (payload as { user_metadata: { email: string } }).user_metadata.email
        : undefined;
  return { id, email };
}

/** Ask Supabase Auth directly — works even when local JWT secret / JWKS misconfigured. */
async function verifyViaSupabaseAuthApi(
  token: string,
): Promise<AnalyzeAuthUser | null> {
  const base = getSupabaseUrl();
  const apikey = getSupabaseApiKey();
  if (!base || !apikey) return null;

  try {
    const response = await fetch(`${base}/auth/v1/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey,
      },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as {
      id?: string;
      email?: string | null;
    };
    if (!body.id) return null;
    return {
      id: body.id,
      email: typeof body.email === 'string' ? body.email : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Verify Supabase access token (Auth /user first, then HS256 / JWKS).
 * Auth API is preferred: Render often has a wrong JWT secret while URL+keys are correct.
 */
export async function verifySupabaseAccessToken(
  token: string,
): Promise<AnalyzeAuthUser | null> {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const viaAuthApi = await verifyViaSupabaseAuthApi(trimmed);
  if (viaAuthApi) return viaAuthApi;

  const secret = getJwtSecret();
  if (secret) {
    try {
      const { payload } = await jwtVerify(trimmed, secret, {
        algorithms: ['HS256'],
      });
      return payloadToUser(payload);
    } catch {
      // Fall through to JWKS.
    }
  }

  const remoteJwks = getJwks();
  if (remoteJwks) {
    try {
      const { payload } = await jwtVerify(trimmed, remoteJwks);
      return payloadToUser(payload);
    } catch {
      return null;
    }
  }

  return null;
}

export function extractBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authorizationHeader.trim());
  return match?.[1]?.trim() || null;
}
