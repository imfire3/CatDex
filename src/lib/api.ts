import { API_URL } from '@/lib/constants';
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

export async function analyzeCatPhoto(
  base64Image: string,
  mimeType = 'image/jpeg',
): Promise<AnalyzeResponse> {
  const stripped = stripDataUrl(base64Image);
  const resolvedMime = stripped.mimeType ?? mimeType;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/analyze-cat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: stripped.base64,
        mimeType: resolvedMime,
      }),
      signal: controller.signal,
    });

    let data: AnalyzeResponse | null = null;
    try {
      data = (await response.json()) as AnalyzeResponse;
    } catch {
      data = null;
    }

    // Le serveur peut renvoyer une analyse de secours même en 502
    if (data?.analysis) {
      return data;
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          `Analyse IA impossible (${response.status}). Vérifie que le serveur tourne sur ${API_URL}.`,
      );
    }

    throw new Error('Réponse d’analyse invalide');
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        `L’analyse a pris trop de temps. Vérifie que l’API tourne sur ${API_URL}.`,
      );
    }
    if (
      error instanceof TypeError ||
      (error instanceof Error && /network request failed/i.test(error.message))
    ) {
      throw new Error(
        `Impossible de joindre l’API (${API_URL}). Lance \`npm run server\` sur ton Mac.`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
