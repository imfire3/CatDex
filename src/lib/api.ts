import { API_URL } from '@/lib/constants';
import type { CatAnalysis } from '@/types/cat';

type AnalyzeResponse = {
  analysis: CatAnalysis;
  mocked?: boolean;
  error?: string;
};

export async function analyzeCatPhoto(
  base64Image: string,
  mimeType = 'image/jpeg',
): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_URL}/analyze-cat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64Image, mimeType }),
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
}
