import 'dotenv/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import OpenAI from 'openai';
import { z } from 'zod';

const app = new Hono();
const port = Number(process.env.PORT ?? 8787);

app.use(
  '*',
  cors({
    origin: '*',
  }),
);

app.get('/health', (c) => c.json({ ok: true, service: 'catdex-api' }));

const analyzeSchema = z.object({
  imageBase64: z.string().min(32),
  mimeType: z.string().default('image/jpeg'),
});

const fallbackAnalysis = {
  color: 'Gris tigré',
  breed: 'Européen',
  coat: 'Poil court',
  description:
    'Chat observé en rue, allure urbaine et curieuse. Analyse de secours utilisée faute de réponse IA.',
  suggestedName: 'Grisou',
};

type AnalysisJson = {
  color?: string;
  breed?: string;
  coat?: string;
  description?: string;
  suggestedName?: string;
};

function normalizeAnalysis(json: AnalysisJson) {
  return {
    color: json.color?.trim() || 'Inconnue',
    breed: json.breed?.trim() || 'Indéterminée',
    coat: json.coat?.trim() || 'Indéterminée',
    description: json.description?.trim() || 'Chat découvert dans la rue.',
    suggestedName: json.suggestedName?.trim() || undefined,
  };
}

app.post('/analyze-cat', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = analyzeSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Payload invalide' }, 400);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return c.json({ analysis: fallbackAnalysis, mocked: true });
  }

  const openai = new OpenAI({ apiKey });
  const { imageBase64, mimeType } = parsed.data;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: [
            'Tu es le naturaliste urbain de CatDex.',
            'Tu analyses UNIQUEMENT des photos de chats (ou clairement dominées par un chat).',
            'Réponds uniquement en JSON valide avec les clés:',
            'color (couleur principale, ex: "Roux tigré"),',
            'breed (race ou type probable, ex: "Européen", "Siamois"),',
            'coat (robe/poil, ex: "Poil court", "Écaille de tortue"),',
            'description (2 phrases max, ton chaleureux, français, sans inventer de lieux),',
            'suggestedName (un seul prénom court et mignon adapté à l’apparence).',
            'Si la photo ne montre pas de chat, mets breed="Inconnu", color="Indéterminée",',
            'description="Aucun chat clairement visible sur cette photo.", suggestedName="".',
          ].join(' '),
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyse ce chat pour le CatDex.',
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
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const json = JSON.parse(raw) as AnalysisJson;

    return c.json({
      analysis: normalizeAnalysis(json),
      mocked: false,
    });
  } catch (error) {
    console.error('[analyze-cat]', error);
    return c.json(
      {
        error: 'Échec analyse OpenAI',
        analysis: fallbackAnalysis,
        mocked: true,
      },
      502,
    );
  }
});

serve({ fetch: app.fetch, port }, () => {
  console.log(`CatDex API ready on http://localhost:${port}`);
});
