import { getApiCandidateUrls } from '@/lib/apiUrl';
import { supabase } from '@/lib/supabase';
import type { CatAnalysis } from '@/types/cat';

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
    return isLocal ? 45_000 : 40_000;
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
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token?.trim() || null;
  } catch {
    return null;
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

  console.log('[analyzeCatPhoto] POST', {
    apiBase,
    mimeType,
    bytesApprox: Math.round((base64.length * 3) / 4),
    hasAuth: Boolean(accessToken),
  });

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

  if (response.status === 401) {
    throw new Error(
      data?.error || 'Connecte-toi pour identifier un chat.',
    );
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
    console.log('[analyzeCatPhoto] Vision analysis received', {
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
      analysis: data.analysis,
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
        lastError = new Error(`Impossible de joindre l’API (${apiBase}).`);
      } else if (error instanceof Error) {
        lastError = error;
        if (!/impossible de joindre/i.test(error.message)) {
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
