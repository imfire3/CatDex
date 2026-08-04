import { getApiCandidateUrls, getApiSecret } from '@/lib/apiUrl';
import { OFFLINE_CAT_ANALYSIS } from '@/lib/mockAnalysis';
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

const ANALYZE_TIMEOUT_MS = 60_000;

function stripDataUrl(imageBase64: string): { base64: string; mimeType?: string } {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(imageBase64.trim());
  if (!match) return { base64: imageBase64.trim() };
  return { mimeType: match[1], base64: match[2] };
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
  const apiSecret = getApiSecret();
  if (apiSecret) {
    headers['x-api-key'] = apiSecret;
  }

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

  if (data?.analysis) {
    return {
      analysis: data.analysis,
      mocked: data.mocked,
      error: data.error,
      cutoutUri: data.cutoutBase64
        ? `data:${data.cutoutMimeType ?? 'image/png'};base64,${data.cutoutBase64}`
        : undefined,
    };
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Analyse IA impossible (${response.status}). Vérifie que le serveur tourne sur ${apiBase}.`,
    );
  }

  throw new Error('Réponse d’analyse invalide');
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (error instanceof Error && /network request failed/i.test(error.message)) return true;
  return false;
}

export async function analyzeCatPhoto(
  base64Image: string,
  mimeType = 'image/jpeg',
): Promise<AnalyzeResponse> {
  const stripped = stripDataUrl(base64Image);
  const resolvedMime = stripped.mimeType ?? mimeType;
  const candidates = getApiCandidateUrls();

  if (!__DEV__ && candidates.length === 0) {
    throw new Error(
      'EXPO_PUBLIC_API_URL manquant. Configure l’URL HTTPS de l’API pour les builds store.',
    );
  }

  let lastError: Error | null = null;

  for (const apiBase of candidates) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);

    try {
      return await requestAnalyze(apiBase, stripped.base64, resolvedMime, controller.signal);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new Error(
          `L’analyse a pris trop de temps. Vérifie que l’API tourne (${candidates.join(', ')}).`,
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

  if (__DEV__) {
    return {
      analysis: OFFLINE_CAT_ANALYSIS,
      mocked: true,
      error: lastError?.message,
    };
  }

  throw (
    lastError ??
    new Error(
      `Impossible de joindre l’API. Vérifie EXPO_PUBLIC_API_URL (${candidates[0] ?? 'non défini'}).`,
    )
  );
}
