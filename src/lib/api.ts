import { agentDebugLog } from '@/lib/agentDebugLog';
import { getApiCandidateUrls } from '@/lib/apiUrl';
import { withFunnyCatName } from '@/lib/funnyCatName';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import type { CatAnalysis } from '@/types/cat';

const AUTH_REQUIRED_MESSAGE =
  'Non autorisé. Connecte-toi pour analyser une photo.';

const AUTH_SESSION_REJECTED_MESSAGE =
  'Session refusée par l’API. Déconnecte-toi puis reconnecte-toi, puis réessaie.';

type AnalyzeResponse = {
  analysis: CatAnalysis;
  mocked?: boolean;
  error?: string;
  /** Transparent PNG cutout as a data URI, when available. */
  cutoutUri?: string;
};

type AnalyzeApiPayload = {
  analysis?: CatAnalysis;
  mocked?: boolean;
  error?: string;
  cutoutBase64?: string;
  cutoutMimeType?: string;
};

/** Vision needs real time — never fall back to mock on timeout. */
function analyzeTimeoutFor(apiBase: string): number {
  if (!__DEV__) return 45_000;
  try {
    const host = new URL(apiBase).hostname;
    const isLocal =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.');
    // Local OpenAI path: give it room. Remote fallback: fail fast if asleep/down.
    return isLocal ? 50_000 : 18_000;
  } catch {
    return 45_000;
  }
}

function stripDataUrl(imageBase64: string): { base64: string; mimeType?: string } {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(imageBase64.trim());
  if (!match) return { base64: imageBase64.trim() };
  return { mimeType: match[1], base64: match[2] };
}

async function getAccessToken(): Promise<string | null> {
  if (!supabase) {
    agentDebugLog({
      hypothesisId: 'A',
      location: 'src/lib/api.ts:getAccessToken',
      message: 'supabase client null',
      data: { hasSupabase: false },
    });
    return null;
  }
  try {
    const { data } = await supabase.auth.getSession();
    let token = data.session?.access_token?.trim() || null;
    let expiresAt = data.session?.expires_at ?? null;

    // Zustand may already hold a live session while getSession() briefly returns null on web.
    if (!token) {
      const storeSession = useAuthStore.getState().session;
      token = storeSession?.access_token?.trim() || null;
      expiresAt = storeSession?.expires_at ?? expiresAt;
      agentDebugLog({
        hypothesisId: 'A',
        location: 'src/lib/api.ts:getAccessToken',
        message: 'fallback to auth store session',
        data: { hasToken: Boolean(token), userId: storeSession?.user?.id ?? null },
      });
    }

    agentDebugLog({
      hypothesisId: 'A',
      location: 'src/lib/api.ts:getAccessToken',
      message: 'session snapshot',
      data: {
        hasToken: Boolean(token),
        expiresAt,
        expiredSoon: Boolean(expiresAt && expiresAt * 1000 < Date.now() + 60_000),
        userId: data.session?.user?.id ?? useAuthStore.getState().user?.id ?? null,
      },
    });

    const needsRefresh =
      !token || Boolean(expiresAt && expiresAt * 1000 < Date.now() + 60_000);

    if (needsRefresh) {
      const { data: refreshed, error } = await supabase.auth.refreshSession();
      if (!error && refreshed.session?.access_token) {
        token = refreshed.session.access_token.trim();
        useAuthStore.setState({
          session: refreshed.session,
          user: useAuthStore.getState().user,
        });
      }
      agentDebugLog({
        hypothesisId: 'B',
        location: 'src/lib/api.ts:getAccessToken',
        message: 'refresh attempted',
        data: {
          hasTokenAfterRefresh: Boolean(token),
          refreshError: error?.message?.slice(0, 120) ?? null,
        },
      });
    }

    return token;
  } catch (error) {
    agentDebugLog({
      hypothesisId: 'B',
      location: 'src/lib/api.ts:getAccessToken',
      message: 'getSession threw',
      data: { errorName: error instanceof Error ? error.name : 'unknown' },
    });
    return useAuthStore.getState().session?.access_token?.trim() || null;
  }
}

async function requestAnalyze(
  apiBase: string,
  base64: string,
  mimeType: string,
  signal: AbortSignal,
): Promise<AnalyzeResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const accessToken = await getAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  // Always call the API — beta Render may allow unauth analyze; never block OpenAI
  // locally before the request when the session token is briefly missing.

  console.log('[analyzeCatPhoto] POST', {
    apiBase,
    mimeType,
    bytesApprox: Math.round((base64.length * 3) / 4),
    hasAuth: Boolean(accessToken),
  });

  const startedAt = Date.now();
  const response = await fetch(`${apiBase}/analyze-cat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      imageBase64: base64,
      mimeType,
    }),
    signal,
  });

  let data: AnalyzeApiPayload | null = null;
  try {
    data = (await response.json()) as AnalyzeApiPayload;
  } catch {
    data = null;
  }

  agentDebugLog({
    hypothesisId: 'C',
    location: 'src/lib/api.ts:requestAnalyze',
    message: 'analyze response',
    data: {
      apiBase,
      status: response.status,
      hasAuth: Boolean(accessToken),
      latencyMs: Date.now() - startedAt,
      error: data?.error ?? null,
      hasAnalysis: Boolean(data?.analysis),
    },
  });

  if (response.status === 401) {
    // Token present but API rejected it — try one refresh + retry.
    if (accessToken) {
      try {
        const { data: refreshed } = await supabase!.auth.refreshSession();
        const nextToken = refreshed.session?.access_token?.trim();
        if (nextToken && nextToken !== accessToken) {
          agentDebugLog({
            hypothesisId: 'C',
            location: 'src/lib/api.ts:requestAnalyze',
            message: '401 then refresh retry',
            data: { apiBase },
          });
          const retry = await fetch(`${apiBase}/analyze-cat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${nextToken}`,
            },
            body: JSON.stringify({
              imageBase64: base64,
              mimeType,
            }),
            signal,
          });
          let retryData: AnalyzeApiPayload | null = null;
          try {
            retryData = (await retry.json()) as AnalyzeApiPayload;
          } catch {
            retryData = null;
          }
          if (retry.ok && retryData?.analysis) {
            return {
              analysis: withFunnyCatName(retryData.analysis),
              mocked: false,
              error: retryData.error,
              cutoutUri: retryData.cutoutBase64
                ? `data:${retryData.cutoutMimeType ?? 'image/png'};base64,${retryData.cutoutBase64}`
                : undefined,
            };
          }
          if (retry.status === 401) {
            throw new Error(
              retryData?.error || AUTH_SESSION_REJECTED_MESSAGE,
            );
          }
        }
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes('Session refusée') ||
            error.message.includes('Non autorisé'))
        ) {
          throw error;
        }
      }
      throw new Error(data?.error || AUTH_SESSION_REJECTED_MESSAGE);
    }
    throw new Error(data?.error || AUTH_REQUIRED_MESSAGE);
  }
  if (response.status === 429) {
    throw new Error(
      data?.error || 'Trop de demandes. Réessaie dans une heure.',
    );
  }
  if (response.status === 413) {
    throw new Error(
      data?.error || 'Image trop lourde. Compresse la photo et réessaie.',
    );
  }
  if (response.status === 503 || response.status === 502) {
    throw new Error(
      data?.error || 'Analyse Vision indisponible. Réessaie dans un instant.',
    );
  }

  if (data?.mocked) {
    console.warn('[analyzeCatPhoto] Server returned mocked=true — rejecting');
    throw new Error(
      'Analyse simulée refusée. L’API doit utiliser OpenAI Vision.',
    );
  }

  if (data?.analysis) {
    console.log('[CATDEX ANALYSIS] Frontend received:', {
      suggestedName: data.analysis.suggestedName,
      breed: data.analysis.breed,
      color: data.analysis.color,
      coat: data.analysis.coat,
      tags: data.analysis.tags,
      distinctiveFeatures: data.analysis.distinctiveFeatures,
      description: data.analysis.description?.slice(0, 120),
      confidence: data.analysis.confidence,
      notACat: data.analysis.notACat,
    });
    return {
      analysis: withFunnyCatName(data.analysis),
      mocked: false,
      error: data.error,
      cutoutUri: data.cutoutBase64
        ? `data:${data.cutoutMimeType ?? 'image/png'};base64,${data.cutoutBase64}`
        : undefined,
    };
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Identification impossible (${response.status}). Vérifie que le serveur tourne sur ${apiBase}.`,
    );
  }

  throw new Error('Réponse d’analyse invalide');
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (error instanceof Error && /network request failed/i.test(error.message)) return true;
  return false;
}

/** Transient / local-misconfig errors — try the next API candidate. */
function shouldTryNextCandidate(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    error.name === 'AbortError' ||
    isNetworkError(error) ||
    message.includes('joindre') ||
    message.includes('trop de temps') ||
    message.includes('indisponible') ||
    message.includes('openai_api_key') ||
    message.includes('503') ||
    message.includes('502') ||
    message.includes('504')
  );
}

/**
 * Send photo to OpenAI Vision via API.
 * Never fills the form with mock / random data.
 */
export async function analyzeCatPhoto(
  base64Image: string,
  mimeType = 'image/jpeg',
): Promise<AnalyzeResponse> {
  const stripped = stripDataUrl(base64Image);
  const resolvedMime = stripped.mimeType ?? mimeType;
  const candidates = getApiCandidateUrls();

  if (candidates.length === 0) {
    throw new Error(
      'EXPO_PUBLIC_API_URL manquant. Configure l’URL de l’API Vision.',
    );
  }

  let lastError: Error | null = null;

  for (const apiBase of candidates) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), analyzeTimeoutFor(apiBase));

    try {
      return await requestAnalyze(apiBase, stripped.base64, resolvedMime, controller.signal);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new Error(
          `L’analyse Vision a pris trop de temps (${apiBase}). Réessaie.`,
        );
      } else if (isNetworkError(error)) {
        lastError = new Error(
          `Impossible de joindre l’API (${apiBase}). Lance \`npm run server\` ou configure EXPO_PUBLIC_API_URL.`,
        );
      } else if (error instanceof Error) {
        lastError = error;
        if (!shouldTryNextCandidate(error)) {
          break;
        }
      } else {
        lastError = new Error('Erreur d’analyse inconnue');
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw (
    lastError ??
    new Error(
      `Impossible de joindre l’API Vision (${candidates[0] ?? 'non défini'}).`,
    )
  );
}

/**
 * Permanently delete the signed-in account (storage + auth user + cascaded rows).
 * Requires API with SUPABASE_SERVICE_ROLE_KEY.
 */
export async function deleteRemoteAccount(): Promise<void> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Connecte-toi pour supprimer ton compte.');
  }

  const candidates = getApiCandidateUrls();
  if (candidates.length === 0) {
    throw new Error(
      'EXPO_PUBLIC_API_URL manquant. Configure l’URL de l’API.',
    );
  }

  let lastError: Error | null = null;

  for (const apiBase of candidates) {
    try {
      const response = await fetch(`${apiBase}/account`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      let data: { error?: string; ok?: boolean } | null = null;
      try {
        data = (await response.json()) as { error?: string; ok?: boolean };
      } catch {
        data = null;
      }

      if (response.ok) return;

      lastError = new Error(
        data?.error || `Suppression impossible (${response.status}).`,
      );
      if (response.status === 401 || response.status === 503) break;
    } catch (error) {
      if (isNetworkError(error)) {
        lastError = new Error(`Impossible de joindre l’API (${apiBase}).`);
        continue;
      }
      lastError =
        error instanceof Error ? error : new Error('Erreur de suppression');
      break;
    }
  }

  throw lastError ?? new Error('Impossible de supprimer le compte.');
}
