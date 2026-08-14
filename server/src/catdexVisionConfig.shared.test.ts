import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  CATDEX_VISION_PROMPT,
  CATDEX_VISION_SYSTEM_PROMPT,
  CATDEX_VISION_USER_PROMPT,
  CATDEX_VISION_USER_TEXT,
} from '../../shared/catdexVisionPrompt.mjs';
import {
  CATDEX_FORM_JSON_SCHEMA,
  CATDEX_FORM_RESPONSE_FORMAT,
  CATDEX_FORM_SCHEMA_NAME,
} from '../../shared/catdexFormSchema.mjs';
import {
  CATDEX_VISION_PROMPT as serverPrompt,
  CATDEX_VISION_USER_TEXT as serverUser,
} from './catdexVisionPrompt.ts';
import {
  CATDEX_FORM_RESPONSE_FORMAT as serverFormat,
  CATDEX_FORM_SCHEMA_NAME as serverSchemaName,
} from './catdexFormSchema.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const REQUIRED_FORM_KEYS = [
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
];

describe('shared CatDex Vision config', () => {
  it('exposes the full system prompt once', () => {
    assert.match(CATDEX_VISION_SYSTEM_PROMPT, /RÔLE/);
    assert.match(CATDEX_VISION_SYSTEM_PROMPT, /Flambyx/);
    assert.match(CATDEX_VISION_SYSTEM_PROMPT, /personalityTraits/);
    assert.match(CATDEX_VISION_SYSTEM_PROMPT, /Pokémon/);
    assert.doesNotMatch(CATDEX_VISION_SYSTEM_PROMPT, /Paprika Zen/);
    assert.equal(CATDEX_VISION_PROMPT, CATDEX_VISION_SYSTEM_PROMPT);
    assert.equal(CATDEX_VISION_USER_TEXT, CATDEX_VISION_USER_PROMPT);
    assert.match(CATDEX_VISION_USER_PROMPT, /Analyse cette photo pour CatDex/);
  });

  it('keeps catdex_form_v1 property set complete', () => {
    assert.equal(CATDEX_FORM_SCHEMA_NAME, 'catdex_form_v1');
    assert.deepEqual(CATDEX_FORM_JSON_SCHEMA.required, REQUIRED_FORM_KEYS);
    for (const key of REQUIRED_FORM_KEYS) {
      assert.ok(
        CATDEX_FORM_JSON_SCHEMA.properties[key],
        `missing schema property: ${key}`,
      );
    }
    assert.equal(CATDEX_FORM_RESPONSE_FORMAT.type, 'json_schema');
    assert.equal(
      CATDEX_FORM_RESPONSE_FORMAT.json_schema.name,
      'catdex_form_v1',
    );
  });

  it('re-exports the same values from the server wrappers', () => {
    assert.equal(serverPrompt, CATDEX_VISION_SYSTEM_PROMPT);
    assert.equal(serverUser, CATDEX_VISION_USER_PROMPT);
    assert.equal(serverSchemaName, CATDEX_FORM_SCHEMA_NAME);
    assert.deepEqual(serverFormat, CATDEX_FORM_RESPONSE_FORMAT);
  });

  it('makes Netlify analyze-cat import the shared prompt/schema', () => {
    const source = readFileSync(
      join(root, 'netlify/functions/analyze-cat.mjs'),
      'utf8',
    );
    assert.match(source, /shared\/catdexVisionPrompt\.mjs/);
    assert.match(source, /shared\/catdexFormSchema\.mjs/);
    assert.match(source, /CATDEX_VISION_SYSTEM_PROMPT/);
    assert.match(source, /CATDEX_VISION_USER_PROMPT/);
    assert.match(source, /CATDEX_FORM_RESPONSE_FORMAT/);
    assert.doesNotMatch(
      source,
      /const SYSTEM_PROMPT\s*=\s*`Tu es le moteur Vision/,
    );
    assert.doesNotMatch(source, /Analyse ce chat pour la fiche CatDex/);
  });
});
