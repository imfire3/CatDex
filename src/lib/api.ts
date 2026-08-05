import { getApiCandidateUrls, getApiSecret } from '@/lib/apiUrl';
import { ensureCatIdentity, generateCatAnalysis } from '@/lib/mockAnalysis';
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

/** Local API should answer fast; remote (Render cold start) gets a shorter budget in DEV. */
function analyzeTimeoutFor(apiBase: string): number {
  if (!__DEV__) return 28_000;
  try {
    const host = new URL(apiBase).hostname;
    const isLocal =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.');
    return isLocal ? 6_000 : 5_000;
  } catch {
    return 6_000;
  }
}


function stripDataUrl(imageBase64: string): { base64: string; mimeType?: string } {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(imageBase64.trim());
  if (!match) return { base64: imageBase64.trim() };
  return { mimeType: match[1], base64: match[2] };
}

function seedFromImage(base64: string): string {
  return base64.slice(0, 1200);
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
      analysis: ensureCatIdentity(data.analysis, seedFromImage(base64)),
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
  const seed = seedFromImage(stripped.base64);

  if (!__DEV__ && candidates.length === 0) {
    throw new Error(
      'EXPO_PUBLIC_API_URL manquant. Configure l’URL HTTPS de l’API pour les builds store.',
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
      analysis: generateCatAnalysis(seed),
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
