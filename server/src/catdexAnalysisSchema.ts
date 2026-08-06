/**
 * Strict JSON Schema for OpenAI Structured Outputs (catdex.analysis.v1).
 * All objects: additionalProperties false + every key in required.
 * Nullable fields use type: ["T", "null"] (not "nullable": true).
 */

const colorEnum = [
  'black',
  'white',
  'gray',
  'blue_gray',
  'orange',
  'red',
  'cream',
  'brown',
  'chocolate',
  'cinnamon',
  'fawn',
  'beige',
  'silver',
  'golden',
  'unknown',
] as const;

const patternEnum = [
  'solid',
  'bicolor',
  'tricolor',
  'tuxedo',
  'tabby',
  'tortoiseshell',
  'calico',
  'colorpoint',
  'smoke',
  'shaded',
  'tipped',
  'spotted',
  'rosette',
  'unknown',
] as const;

const tabbyEnum = ['mackerel', 'classic', 'spotted', 'ticked', 'unknown'] as const;
const lengthEnum = ['hairless', 'short', 'medium', 'long', 'unknown'] as const;
const textureEnum = [
  'straight',
  'plush',
  'silky',
  'curly',
  'wavy',
  'wiry',
  'unknown',
] as const;
const ageEnum = ['kitten', 'young', 'adult', 'senior', 'unknown'] as const;
const typeCategoryEnum = ['domestic', 'probable_breed', 'mixed', 'unknown'] as const;
const statusEnum = ['success', 'low_quality', 'multiple_cats', 'not_a_cat'] as const;

const confidenceScore = {
  type: 'number' as const,
  description: 'Confidence between 0 and 1',
};

const stringList = {
  type: 'array' as const,
  items: { type: 'string' as const },
};

const breedCandidate = {
  type: 'object' as const,
  additionalProperties: false,
  required: ['label', 'confidence'],
  properties: {
    label: { type: 'string' },
    confidence: confidenceScore,
  },
};

const catObject = {
  type: 'object' as const,
  additionalProperties: false,
  required: [
    'generated_name',
    'type',
    'coat',
    'physical_features',
    'pose',
    'environment',
    'playful_traits',
    'description',
  ],
  properties: {
    generated_name: { type: 'string' },
    type: {
      type: 'object',
      additionalProperties: false,
      required: [
        'label',
        'category',
        'confidence',
        'possible_breeds',
        'visible_evidence',
      ],
      properties: {
        label: {
          type: 'string',
          description:
            'French label e.g. Chat domestique à poil court, or a precise breed only if confidence >= 0.80',
        },
        category: { type: 'string', enum: [...typeCategoryEnum] },
        confidence: confidenceScore,
        possible_breeds: { type: 'array', items: breedCandidate },
        visible_evidence: stringList,
      },
    },
    coat: {
      type: 'object',
      additionalProperties: false,
      required: [
        'primary_color',
        'secondary_color',
        'additional_colors',
        'pattern',
        'tabby_pattern',
        'length',
        'texture',
        'confidence',
      ],
      properties: {
        primary_color: { type: 'string', enum: [...colorEnum] },
        secondary_color: {
          anyOf: [{ type: 'string', enum: [...colorEnum] }, { type: 'null' }],
        },
        additional_colors: {
          type: 'array',
          items: { type: 'string', enum: [...colorEnum] },
        },
        pattern: { type: 'string', enum: [...patternEnum] },
        tabby_pattern: {
          anyOf: [{ type: 'string', enum: [...tabbyEnum] }, { type: 'null' }],
        },
        length: { type: 'string', enum: [...lengthEnum] },
        texture: { type: 'string', enum: [...textureEnum] },
        confidence: confidenceScore,
      },
    },
    physical_features: {
      type: 'object',
      additionalProperties: false,
      required: [
        'eye_color',
        'ears',
        'face_shape',
        'body_shape',
        'age_group',
        'distinctive_markings',
        'confidence',
      ],
      properties: {
        eye_color: { type: 'string' },
        ears: { type: 'string' },
        face_shape: { type: 'string' },
        body_shape: { type: 'string' },
        age_group: { type: 'string', enum: [...ageEnum] },
        distinctive_markings: stringList,
        confidence: confidenceScore,
      },
    },
    pose: {
      type: 'object',
      additionalProperties: false,
      required: ['label', 'confidence'],
      properties: {
        label: { type: 'string' },
        confidence: confidenceScore,
      },
    },
    environment: {
      type: 'object',
      additionalProperties: false,
      required: ['label', 'description', 'confidence'],
      properties: {
        label: { type: 'string' },
        description: { type: 'string' },
        confidence: confidenceScore,
      },
    },
    playful_traits: {
      type: 'array',
      items: { type: 'string' },
      description: 'Max 3 single-word French playful traits',
    },
    description: {
      type: 'string',
      description: 'Max 2 French sentences, playful but factual',
    },
  },
};

export const CATDEX_ANALYSIS_SCHEMA_NAME = 'catdex_analysis_v1';

export const CATDEX_ANALYSIS_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'schema_version',
    'status',
    'is_cat',
    'cat_count',
    'user_message',
    'image_quality',
    'cat',
    'warnings',
    'requires_user_confirmation',
  ],
  properties: {
    schema_version: {
      type: 'string',
      description: 'Must be catdex.analysis.v1',
    },
    status: { type: 'string', enum: [...statusEnum] },
    is_cat: { type: 'boolean' },
    cat_count: { type: 'integer' },
    user_message: {
      anyOf: [{ type: 'string' }, { type: 'null' }],
    },
    image_quality: {
      type: 'object',
      additionalProperties: false,
      required: ['usable', 'score', 'issues'],
      properties: {
        usable: { type: 'boolean' },
        score: confidenceScore,
        issues: stringList,
      },
    },
    cat: {
      anyOf: [catObject, { type: 'null' }],
      description: 'Null when status is not_a_cat or no main cat can be analyzed',
    },
    warnings: stringList,
    requires_user_confirmation: { type: 'boolean' },
  },
} as const;

export const CATDEX_ANALYSIS_RESPONSE_FORMAT = {
  type: 'json_schema' as const,
  json_schema: {
    name: CATDEX_ANALYSIS_SCHEMA_NAME,
    strict: true,
    schema: CATDEX_ANALYSIS_JSON_SCHEMA,
  },
};
