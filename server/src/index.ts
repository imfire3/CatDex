import 'dotenv/config';

import { serve } from '@hono/node-server';
import { removeBackground } from '@imgly/background-removal-node';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import OpenAI from 'openai';
import { z } from 'zod';

import {
  CATDEX_VISION_PROMPT,
  CATDEX_VISION_USER_TEXT,
} from './catdexVisionPrompt';

const app = new Hono();
const port = Number(process.env.PORT ?? 8787);
const apiSecret = process.env.API_SECRET?.trim();

app.use(
  '*',
  cors({
    origin: '*',
  }),
);

app.get('/health', (c) => c.json({ ok: true, service: 'catdex-api' }));

/** Lightweight shared-secret gate for /analyze-cat (optional in local dev). */
app.use('/analyze-cat', async (c, next) => {
  if (!apiSecret) {
    await next();
    return;
  }

  const header =
    c.req.header('x-api-key')?.trim() ||
    c.req.header('authorization')?.replace(/^Bearer\s+/i, '').trim();

  if (header !== apiSecret) {
    return c.json({ error: 'Non autorisé' }, 401);
  }

  await next();
});

const analyzeSchema = z.object({
  imageBase64: z.string().min(32),
  mimeType: z.string().default('image/jpeg'),
});

const COLORS = [
  'Noir',
  'Roux',
  'Roux tigré',
  'Gris',
  'Gris tigré',
  'Blanc',
  'Écaille de tortue',
  'Bicolore',
  'Crème',
  'Siamois',
] as const;

const BREEDS = [
  'Européen',
  'Chartreux',
  'Siamois',
  'Maine Coon',
  'Persan',
  'British Shorthair',
  'Bengal',
  'Ragdoll',
  'Norvégien',
  'Sphynx',
] as const;

const COATS = ['Court', 'Mi-long', 'Long', 'Bouclé'] as const;
const EYES = ['Ambre', 'Verts', 'Bleus', 'Dorés', 'Noisette', 'Cuivre'] as const;
const SIZES = ['Petite', 'Moyenne', 'Grande'] as const;
const GENDERS = ['male', 'female', 'unknown'] as const;
const NAMES = [
  'Nori',
  'Caramel',
  'Mistral',
  'Suki',
  'Olive',
  'Pixel',
  'Moka',
  'Luna',
  'Tigrou',
  'Cendre',
  'Wasabi',
  'Praline',
  'Ziggy',
  'Félix',
  'Mina',
  'Gus',
  'Nala',
  'Biscuit',
  'Shadow',
  'Pêche',
] as const;
const TAG_SETS = [
  ['Ombre', 'Mystère', 'Discret'],
  ['Soleil', 'Curieux', 'Vif'],
  ['Velours', 'Doux', 'Câlin'],
  ['Éclair', 'Audacieux', 'Joueur'],
  ['Nuit', 'Furtif', 'Calme'],
  ['Miel', 'Gourmand', 'Affectueux'],
  ['Brume', 'Poète', 'Observateur'],
  ['Flamme', 'Têtu', 'Explorateur'],
] as const;

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function pick<T>(items: readonly T[], seed: number, salt: number): T {
  return items[(seed + salt * 97) % items.length]!;
}

/** Varied mock analysis when OpenAI is unavailable — always has breed/color/name/traits. */
function buildFallbackAnalysis(seedInput: string) {
  const seed = hashSeed(seedInput || 'fallback');
  const color = pick(COLORS, seed, 1);
  const breed = pick(BREEDS, seed, 2);
  const coat = pick(COATS, seed, 3);
  const eyes = pick(EYES, seed, 4);
  const size = pick(SIZES, seed, 5);
  const gender = pick(GENDERS, seed, 6);
  const suggestedName = pick(NAMES, seed, 7);
  const tags = [...pick(TAG_SETS, seed, 8)];
  return {
    color,
    breed,
    coat,
    eyes,
    size,
    gender,
    tags,
    suggestedName,
    description: `Un chat ${color.toLowerCase()} de type ${breed}, air ${tags[0]!.toLowerCase()}. ${suggestedName} a été repéré dans le quartier — prêt à rejoindre ton CatDex.`,
  };
}

type VisionError = {
  code?: string;
  title?: string;
  message?: string;
};

type VisionStats = {
  timesSeen?: number;
  captures?: number;
  likes?: number;
  captured?: boolean;
  popularity?: string;
};

/** Raw JSON from the CatDex Vision prompt (success or NOT_A_CAT). */
type VisionJson = {
  success?: boolean;
  error?: VisionError;
  /** Legacy flat schema (fallback / mocks) */
  color?: string;
  suggestedName?: string;
  tags?: string[] | string;
  eyes?: string;
  coat?: string;
  /** Rich fiche schema */
  catdexNumber?: string;
  name?: string;
  description?: string;
  species?: string;
  breed?: string;
  gender?: string;
  estimatedAge?: string;
  size?: string;
  estimatedWeight?: string;
  bodyType?: string;
  mainColor?: string;
  secondaryColors?: string[] | string;
  coatPattern?: string;
  coatLength?: string;
  coatTexture?: string;
  eyeColor?: string;
  ears?: string;
  tail?: string;
  condition?: string;
  confidence?: number;
  traits?: string[] | string;
  distinctiveFeatures?: string[] | string;
  habitat?: string;
  state?: string;
  rarity?: string;
  stats?: VisionStats;
  colorPalette?: string[];
  discoveredAt?: string;
};

const NOT_A_CAT_TITLE = 'Aucun chat détecté 🐾';
const NOT_A_CAT_MESSAGE =
  'Cette photo ne semble pas contenir un chat. Essaie de prendre une photo plus nette d’un chat.';

function asStringList(value?: string[] | string, max = 8): string[] {
  if (Array.isArray(value)) {
    return value.map((t) => String(t).trim()).filter(Boolean).slice(0, max);
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/[,;/]/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, max);
  }
  return [];
}

function normalizeGender(value?: string) {
  const v = value?.trim().toLowerCase() ?? '';
  if (
    v === 'male' ||
    v === 'm' ||
    v === 'mâle' ||
    v.includes('mâle') ||
    v.includes('male')
  ) {
    return 'male' as const;
  }
  if (
    v === 'female' ||
    v === 'f' ||
    v === 'femelle' ||
    v.includes('femelle') ||
    v.includes('female')
  ) {
    return 'female' as const;
  }
  return 'unknown' as const;
}

function buildNoCatAnalysis(error?: VisionError) {
  const title = error?.title?.trim() || NOT_A_CAT_TITLE;
  const message = error?.message?.trim() || NOT_A_CAT_MESSAGE;
  return {
    color: 'Indéterminée',
    breed: 'Inconnu',
    coat: 'Indéterminée',
    description: message,
    suggestedName: '',
    gender: 'unknown' as const,
    tags: [] as string[],
    confidence: 0,
    notACat: true as const,
    errorCode: error?.code?.trim() || 'NOT_A_CAT',
    errorTitle: title,
    errorMessage: message,
  };
}

function normalizeAnalysis(json: VisionJson, seedInput: string) {
  const confidence =
    typeof json.confidence === 'number' && Number.isFinite(json.confidence)
      ? json.confidence
      : undefined;

  const explicitFail =
    json.success === false ||
    json.error?.code === 'NOT_A_CAT' ||
    (confidence !== undefined && confidence < 90);

  if (explicitFail) {
    return buildNoCatAnalysis(json.error);
  }

  const description = json.description?.trim() || '';
  const breedRaw = json.breed?.trim() || '';
  const name = (json.name ?? json.suggestedName)?.trim() || '';
  const legacyNoCat =
    /aucun chat/i.test(description) ||
    (breedRaw.toLowerCase() === 'inconnu' && !name);

  if (legacyNoCat) {
    return buildNoCatAnalysis({
      code: 'NOT_A_CAT',
      title: NOT_A_CAT_TITLE,
      message: description || NOT_A_CAT_MESSAGE,
    });
  }

  const fallback = buildFallbackAnalysis(seedInput);
  const color = json.mainColor?.trim() || json.color?.trim() || fallback.color;
  const breed = json.breed?.trim() || fallback.breed;
  const coat =
    json.coatLength?.trim() || json.coat?.trim() || fallback.coat;
  const suggestedName = name || fallback.suggestedName;
  const traits = asStringList(json.traits ?? json.tags, 8);
  const tags = traits.length > 0 ? traits : fallback.tags;
  const secondaryColors = asStringList(json.secondaryColors, 6);
  const distinctiveFeatures = asStringList(json.distinctiveFeatures, 8).filter(
    (f) => !/^aucune$/i.test(f),
  );

  return {
    color,
    breed,
    coat,
    description:
      description ||
      `Un chat ${color.toLowerCase()} de type ${breed}. ${suggestedName} rejoint ton CatDex.`,
    suggestedName,
    gender: normalizeGender(json.gender),
    eyes: json.eyeColor?.trim() || json.eyes?.trim() || fallback.eyes,
    size: json.size?.trim() || fallback.size,
    tags,
    species: json.species?.trim() || undefined,
    estimatedAge: json.estimatedAge?.trim() || undefined,
    estimatedWeight: json.estimatedWeight?.trim() || undefined,
    bodyType: json.bodyType?.trim() || undefined,
    secondaryColors: secondaryColors.length > 0 ? secondaryColors : undefined,
    coatPattern: json.coatPattern?.trim() || undefined,
    coatTexture: json.coatTexture?.trim() || undefined,
    ears: json.ears?.trim() || undefined,
    tail: json.tail?.trim() || undefined,
    condition: json.condition?.trim() || undefined,
    confidence,
    distinctiveFeatures:
      distinctiveFeatures.length > 0 ? distinctiveFeatures : undefined,
    habitat: json.habitat?.trim() || undefined,
    state: json.state?.trim() || undefined,
    rarity: json.rarity?.trim() || undefined,
    colorPalette: Array.isArray(json.colorPalette)
      ? json.colorPalette.map((c) => String(c).trim()).filter(Boolean).slice(0, 6)
      : undefined,
    catdexNumber: json.catdexNumber?.trim() || undefined,
    stats: json.stats
      ? {
          timesSeen: json.stats.timesSeen,
          captures: json.stats.captures,
          likes: json.stats.likes,
          captured: json.stats.captured,
          popularity: json.stats.popularity,
        }
      : undefined,
    notACat: false as const,
  };
}

function stripDataUrl(imageBase64: string, mimeType: string) {
  const dataUrl = /^data:([^;]+);base64,(.+)$/s.exec(imageBase64);
  if (!dataUrl) return { imageBase64, mimeType };
  return {
    mimeType: dataUrl[1] || mimeType,
    imageBase64: dataUrl[2],
  };
}

function keyLooksPlaceholder(apiKey?: string | null): boolean {
  const key = apiKey?.trim();
  return (
    !key ||
    /your[-_]?key|sk-your|changeme|example/i.test(key) ||
    key.length < 20
  );
}

async function cutoutCatPng(imageBase64: string, mimeType: string): Promise<string | null> {
  try {
    const input = Buffer.from(imageBase64, 'base64');
    const blob = await removeBackground(new Blob([input], { type: mimeType }), {
      model: 'small',
      output: { format: 'image/png', quality: 0.9, type: 'foreground' },
    });
    const buffer = Buffer.from(await blob.arrayBuffer());
    return buffer.toString('base64');
  } catch (error) {
    console.error('[cutout]', error);
    return null;
  }
}

app.post('/analyze-cat', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = analyzeSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Payload invalide' }, 400);
  }

  let { imageBase64, mimeType } = stripDataUrl(parsed.data.imageBase64, parsed.data.mimeType);
  const analysisSeed = imageBase64.slice(0, 1200);

  const normalizedMime = mimeType.toLowerCase();
  if (
    normalizedMime.includes('heic') ||
    normalizedMime.includes('heif') ||
    normalizedMime.includes('tiff')
  ) {
    // Always 200 + analysis when mocking — Cloudflare quick tunnels strip non-200 bodies.
    return c.json({
      error: 'Format image non supporté. Utilise JPEG ou PNG.',
      analysis: buildFallbackAnalysis(analysisSeed),
      mocked: true,
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const cutoutPromise = cutoutCatPng(imageBase64, mimeType);

  if (keyLooksPlaceholder(apiKey)) {
    const cutoutBase64 = await cutoutPromise;
    return c.json({
      analysis: buildFallbackAnalysis(analysisSeed),
      mocked: true,
      cutoutBase64: cutoutBase64 ?? undefined,
      cutoutMimeType: cutoutBase64 ? 'image/png' : undefined,
    });
  }

  const openai = new OpenAI({ apiKey: apiKey!.trim() });

  try {
    const [completion, cutoutBase64] = await Promise.all([
      openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: CATDEX_VISION_PROMPT,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: CATDEX_VISION_USER_TEXT,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
      }),
      cutoutPromise,
    ]);

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const json = JSON.parse(raw) as VisionJson;
    const analysis = normalizeAnalysis(json, analysisSeed);

    return c.json({
      analysis,
      mocked: false,
      cutoutBase64: cutoutBase64 ?? undefined,
      cutoutMimeType: cutoutBase64 ? 'image/png' : undefined,
      ...(analysis.notACat
        ? {
            error: analysis.errorCode ?? 'NOT_A_CAT',
            visionError: {
              code: analysis.errorCode ?? 'NOT_A_CAT',
              title: analysis.errorTitle ?? NOT_A_CAT_TITLE,
              message: analysis.errorMessage ?? NOT_A_CAT_MESSAGE,
            },
          }
        : {}),
    });
  } catch (error) {
    console.error('[analyze-cat]', error);
    const cutoutBase64 = await cutoutPromise.catch(() => null);
    // Prefer 200 so public tunnels (Cloudflare) do not replace the JSON body.
    return c.json({
      error: 'Échec analyse OpenAI',
      analysis: buildFallbackAnalysis(analysisSeed),
      mocked: true,
      cutoutBase64: cutoutBase64 ?? undefined,
      cutoutMimeType: cutoutBase64 ? 'image/png' : undefined,
    });
  }
});

serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, () => {
  console.log(`CatDex API ready on http://0.0.0.0:${port}`);
});
