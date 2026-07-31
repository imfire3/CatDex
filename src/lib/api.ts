import { API_URL, resolveApiUrl } from '@/lib/constants';
import type { CatAnalysis } from '@/types/cat';

type AnalyzeResponse = {
  analysis: CatAnalysis;
  mocked?: boolean;
  error?: string;
};

/** Used when the API is unreachable (phone → localhost, offline, etc.). */
const offlineFallback: CatAnalysis = {
  color: 'Gris tigré',
  breed: 'Européen',
  coat: 'Poil court',
  description:
    'Chat observé en rue, allure urbaine et curieuse. Analyse de secours (API injoignable).',
  suggestedName: 'Grisou',
};

const ANALYZE_TIMEOUT_MS = 18_000;

export async function analyzeCatPhoto(
  base64Image: string,
  mimeType = 'image/jpeg',
): Promise<AnalyzeResponse> {
  // Resolve at call time — hostUri can be ready after first paint on Expo Go
  const baseUrl = resolveApiUrl() || API_URL;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/analyze-cat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64Image, mimeType }),
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
          `Analyse IA impossible (${response.status}). Vérifie que le serveur tourne sur ${baseUrl}.`,
      );
    }

    throw new Error('Réponse d’analyse invalide');
  } catch (error) {
    // Network / timeout → keep capture flow alive with a local mock card
    if (__DEV__) {
      console.warn('[analyzeCatPhoto] fallback', baseUrl, error);
    }
    return { analysis: offlineFallback, mocked: true };
  } finally {
    clearTimeout(timeoutId);
  }
}
