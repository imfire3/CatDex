/**
 * CatDex Vision structured output schema (catdex_form_v1).
 * Single source of truth for Render/server and Netlify analyze-cat.
 * Do not duplicate this schema elsewhere.
 */

export const CATDEX_FORM_SCHEMA_NAME = 'catdex_form_v1';

export const CATDEX_FORM_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'isCat',
    'reason',
    'name',
    'breed',
    'breedConfidence',
    'coatColor',
    'coatPattern',
    'furLength',
    'eyeColor',
    'size',
    'estimatedAge',
    'sex',
    'distinctiveFeatures',
    'personalityTraits',
    'description',
  ],
  properties: {
    isCat: {
      type: 'boolean',
      description: 'True only if a live cat is clearly visible',
    },
    reason: {
      type: 'string',
      description:
        'If isCat is false, explain why. Empty string when isCat is true.',
    },
    name: {
      type: 'string',
      description:
        'Short suggested name inspired only by visible traits. Empty if nothing fits.',
    },
    breed: {
      type: 'string',
      description:
        'Breed label in French, or empty / Race inconnue when unsure',
    },
    breedConfidence: {
      type: 'integer',
      description: 'Breed confidence 0–100. Below 60 → treat as Race inconnue',
    },
    coatColor: {
      type: 'string',
      description:
        'Visible coat color(s) in French, e.g. Roux et blanc. Empty if unknown.',
    },
    coatPattern: {
      type: 'string',
      description:
        'Visible pattern if clear (tigré, bicolore…). Empty if unknown.',
    },
    furLength: {
      type: 'string',
      enum: ['court', 'mi-long', 'long', 'unknown'],
      description: 'Visible fur length only. Use unknown if not clear.',
    },
    eyeColor: {
      type: 'string',
      description: 'Visible eye color in French. Empty if unknown.',
    },
    size: {
      type: 'string',
      enum: ['petit', 'moyen', 'grand', 'unknown'],
      description: 'Apparent size. Use unknown if not clear.',
    },
    estimatedAge: {
      type: 'string',
      description: 'Apparent age group in French. Empty if unknown.',
    },
    sex: {
      type: 'string',
      enum: ['mâle', 'femelle', 'inconnu'],
      description: 'Only if clearly visible; otherwise inconnu',
    },
    distinctiveFeatures: {
      type: 'array',
      items: { type: 'string' },
      description: 'Visible markings only, French. Empty array if none.',
    },
    personalityTraits: {
      type: 'array',
      items: { type: 'string' },
      description: 'Max 3 traits from visible pose/expression. Empty if none.',
    },
    description: {
      type: 'string',
      description:
        '1–2 French sentences of what is visible only. No invented story/owner/future.',
    },
  },
};

export const CATDEX_FORM_RESPONSE_FORMAT = {
  type: 'json_schema',
  json_schema: {
    name: CATDEX_FORM_SCHEMA_NAME,
    strict: true,
    schema: CATDEX_FORM_JSON_SCHEMA,
  },
};
