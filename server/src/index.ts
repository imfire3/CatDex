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
    'Chat observé en rue, allure urbaine et curieuse. Analyse de secours (mock) utilisée faute de clé OpenAI.',
};

app.post('/analyze-cat', async (c) => {
  const body = await c.req.json();
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
          content:
            'Tu analyses des photos de chats pour CatDex. Réponds uniquement en JSON avec les clés: color, breed, coat, description. Texte en français, concis et crédible.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Décris ce chat: couleur, race probable, robe, et une courte description.',
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
    const json = JSON.parse(raw) as {
      color?: string;
      breed?: string;
      coat?: string;
      description?: string;
    };

    return c.json({
      analysis: {
        color: json.color ?? 'Inconnue',
        breed: json.breed ?? 'Indéterminée',
        coat: json.coat ?? 'Indéterminée',
        description: json.description ?? 'Chat découvert dans la rue.',
      },
      mocked: false,
    });
  } catch (error) {
    console.error(error);
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
