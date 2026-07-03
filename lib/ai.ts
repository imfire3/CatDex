import { readAsStringAsync } from "expo-file-system/legacy";
import type { CatAnalysis } from "@/types/database";

const COLOR_KEYWORDS = [
  "noir",
  "blanc",
  "gris",
  "roux",
  "orange",
  "tigré",
  "tricolore",
  "crème",
  "chocolat",
];

const BREED_KEYWORDS = [
  "européen",
  "siamois",
  "persan",
  "maine coon",
  "bengal",
  "chartreux",
  "abyssin",
  "norvégien",
  "sphinx",
  "british shorthair",
];

const PATTERN_KEYWORDS = [
  "uni",
  "rayé",
  "tacheté",
  "bicolore",
  "tricolore",
  "tigré",
  "point",
];

function pickKeyword(text: string, keywords: string[], fallback: string) {
  const normalized = text.toLowerCase();
  return keywords.find((keyword) => normalized.includes(keyword)) ?? fallback;
}

function fallbackAnalysis(): CatAnalysis {
  return {
    color: "roux",
    breed: "européen",
    pattern: "uni",
    confidence: 0.35,
    suggestedName: "Mimi",
  };
}

export async function analyzeCatPhoto(
  photoUri: string
): Promise<CatAnalysis> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    return fallbackAnalysis();
  }

  try {
    const base64 = await readAsStringAsync(photoUri, {
      encoding: "base64",
    });

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Tu analyses une photo de chat de rue. Réponds uniquement en JSON avec color, breed, pattern, confidence (0-1), suggestedName.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyse cette photo de chat et devine couleur dominante, race probable, motif et un prénom mignon.",
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64}` },
              },
            ],
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      return fallbackAnalysis();
    }

    const payload = await aiResponse.json();
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return fallbackAnalysis();

    const parsed = JSON.parse(content) as Partial<CatAnalysis>;
    return {
      color: pickKeyword(parsed.color ?? "", COLOR_KEYWORDS, "roux"),
      breed: pickKeyword(parsed.breed ?? "", BREED_KEYWORDS, "européen"),
      pattern: pickKeyword(parsed.pattern ?? "", PATTERN_KEYWORDS, "uni"),
      confidence: Math.min(Math.max(parsed.confidence ?? 0.5, 0), 1),
      suggestedName: parsed.suggestedName?.trim() || "Mimi",
    };
  } catch {
    return fallbackAnalysis();
  }
}
