import { API_URL } from '@/lib/constants';
import type { CatAnalysis } from '@/types/cat';

type AnalyzeResponse = {
  analysis: CatAnalysis;
  mocked?: boolean;
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

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Analyse IA impossible');
  }

  return response.json() as Promise<AnalyzeResponse>;
}
