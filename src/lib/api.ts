import { getApiCandidateUrls } from '@/lib/apiUrl';
import { OFFLINE_CAT_ANALYSIS } from '@/lib/mockAnalysis';
import type { CatAnalysis } from '@/types/cat';

type AnalyzeResponse = {
  analysis: CatAnalysis;
  mocked?: boolean;
  error?: string;
};

const ANALYZE_TIMEOUT_MS = 45_000;

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
  const response = await fetch(`${apiBase}/analyze-cat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64: base64,
      mimeType,
    }),
    signal,
  });

  let data: AnalyzeResponse | null = null;
  try {
    data = (await response.json()) as AnalyzeResponse;
  } catch {
    data = null;
  }

  if (data?.analysis) {
    return data;
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
        // Server reachable but returned a hard error — don't try other hosts.
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
      `Impossible de joindre l’API. Lance \`npm run server\` puis vérifie ${candidates[0]}.`,
    )
  );
}
