import { API_URL } from '@/lib/constants';
import type { CatAnalysis } from '@/types/cat';

type AnalyzeResponse = {
  analysis: CatAnalysis;
  mocked?: boolean;
  error?: string;
};

const ANALYZE_TIMEOUT_MS = 45_000;

const LOCAL_FALLBACKS: CatAnalysis[] = [
  {
    color: 'Noir',
    breed: 'Européen',
    coat: 'Court',
    description:
      'Un chat noir élégant avec des yeux ambre. Observé près d’un café en fin d’après-midi.',
    suggestedName: 'Nori',
    gender: 'male',
    eyes: 'Ambre',
    size: 'Moyenne',
    tags: ['Ombre', 'Mystère'],
  },
  {
    color: 'Roux tigré',
    breed: 'Européen',
    coat: 'Court',
    description: 'Un roux curieux au regard vif, prêt à explorer le quartier.',
    suggestedName: 'Mimi',
    gender: 'female',
    eyes: 'Verts',
    size: 'Moyenne',
    tags: ['Soleil', 'Curieux'],
  },
  {
    color: 'Gris tigré',
    breed: 'Européen',
    coat: 'Poil court',
    description: 'Silhouette grise discrète, pose attentive au bord du trottoir.',
    suggestedName: 'Grisou',
    gender: 'unknown',
    eyes: 'Dorés',
    size: 'Moyenne',
    tags: ['Brume', 'Discret'],
  },
];

function stripDataUrl(imageBase64: string): { base64: string; mimeType?: string } {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(imageBase64.trim());
  if (!match) return { base64: imageBase64.trim() };
  return { mimeType: match[1], base64: match[2] };
}

function localMockAnalysis(seed: string): AnalyzeResponse {
  const index =
    Math.abs(
      [...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0),
    ) % LOCAL_FALLBACKS.length;
  return { analysis: LOCAL_FALLBACKS[index], mocked: true };
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

    // Le serveur peut renvoyer une analyse de secours même en erreur HTTP
    if (data?.analysis) {
      return data;
    }

    // Cloudflare / réseau : pas de JSON → mock local pour ne pas bloquer le scan
    if (__DEV__) {
      return localMockAnalysis(stripped.base64.slice(0, 64));
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          `Analyse IA impossible (${response.status}). Vérifie que le serveur tourne sur ${API_URL}.`,
      );
    }

    throw new Error('Réponse d’analyse invalide');
  } catch (error) {
    if (__DEV__) {
      return localMockAnalysis(stripped.base64.slice(0, 64));
    }
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
