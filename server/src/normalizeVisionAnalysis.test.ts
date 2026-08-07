/**
 * Unit tests for Vision normalize + breed policy (observe → deduce gates).
 * Run: npx tsx --test server/src/breedPolicy.test.ts server/src/normalizeVisionAnalysis.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveBreed, resolveCoatLength } from './breedPolicy';
import { normalizeAnalysis } from './normalizeVisionAnalysis';

const fallback = {
  color: 'Roux',
  breed: 'Européen',
  coat: 'Court',
  eyes: 'Verts',
  size: 'Moyenne',
  gender: 'unknown' as const,
  tags: ['Curieux'],
  suggestedName: 'Caramel',
  description: 'Fallback',
};

describe('resolveBreed', () => {
  it('demotes persian without flat morphology', () => {
    const result = resolveBreed({
      breedKey: 'persian',
      label: 'Persian',
      confidence: 0.92,
      coatLength: 'short',
      morphology: {
        face_profile: 'normal',
        muzzle: 'elongated',
        ear_size: 'medium',
        ear_shape: 'pointed',
      },
    });
    assert.equal(result.label, 'Européen');
    assert.equal(result.demoted, true);
  });

  it('demotes precise breed when confidence < 0.80', () => {
    const result = resolveBreed({
      breedKey: 'persian',
      confidence: 0.55,
      coatLength: 'short',
      morphology: {
        face_profile: 'flat',
        muzzle: 'flat',
        ear_size: 'small',
        ear_shape: 'rounded',
      },
    });
    assert.equal(result.key, 'european');
    assert.equal(result.demoted, true);
  });

  it('keeps persian when flat morphology + high confidence', () => {
    const result = resolveBreed({
      breedKey: 'persian',
      confidence: 0.88,
      coatLength: 'long',
      morphology: {
        face_profile: 'flat',
        muzzle: 'flat',
        ear_size: 'small',
        ear_shape: 'rounded',
      },
    });
    assert.equal(result.label, 'Persan');
    assert.equal(result.demoted, false);
  });
});

describe('resolveCoatLength', () => {
  it('prefers short when unknown', () => {
    assert.equal(resolveCoatLength('unknown', 0.4), 'short');
  });

  it('demotes uncertain medium to short', () => {
    assert.equal(resolveCoatLength('medium', 0.5), 'short');
  });

  it('keeps medium when confident', () => {
    assert.equal(resolveCoatLength('medium', 0.9), 'medium');
  });
});

describe('normalizeAnalysis v1 — ginger bicolor domestic', () => {
  it('maps orange+white to Roux et blanc, European, Court, markings', () => {
    const json = {
      schema_version: 'catdex.analysis.v1',
      status: 'success',
      is_cat: true,
      cat_count: 1,
      user_message: null,
      image_quality: { usable: true, score: 0.86, issues: [] },
      warnings: [],
      requires_user_confirmation: false,
      cat: {
        generated_name: 'Rouxie',
        type: {
          breed_key: 'persian',
          label: 'Persian',
          category: 'probable_breed',
          confidence: 0.62,
          possible_breeds: [{ label: 'Persian', confidence: 0.62 }],
          visible_evidence: [],
        },
        coat: {
          primary_color: 'orange',
          secondary_color: 'white',
          additional_colors: [],
          pattern: 'bicolor',
          tabby_pattern: 'mackerel',
          length: 'medium',
          texture: 'straight',
          confidence: 0.55,
        },
        physical_features: {
          eye_color: 'green',
          ears: 'pointues',
          face_shape: 'normal',
          body_shape: 'moyen',
          age_group: 'adult',
          distinctive_markings: [
            'Poitrine blanche',
            'Pattes blanches',
            'Queue rayée',
          ],
          confidence: 0.84,
        },
        morphology: {
          face_profile: 'normal',
          muzzle: 'elongated',
          ear_size: 'medium',
          ear_shape: 'pointed',
          confidence: 0.8,
        },
        pose: { label: 'sitting', confidence: 0.9 },
        environment: {
          label: 'indoor',
          description: 'Intérieur',
          confidence: 0.7,
        },
        playful_traits: ['Curieux', 'Vif'],
        description:
          'Un chat bicolore de type Persian, air curieux. Rouxie rejoint ton CatDex.',
      },
    };

    const result = normalizeAnalysis(json, fallback);

    assert.equal(result.notACat, false);
    assert.equal(result.breed, 'Européen');
    assert.equal(result.color, 'Roux et blanc');
    assert.equal(result.coat, 'Court');
    assert.match(result.coatPattern ?? '', /Poitrine blanche/i);
    assert.match(result.eyes ?? '', /Vert/i);
    assert.ok(!/^Un chat .+ de type /i.test(result.description));
    assert.match(result.description.toLowerCase(), /roux et blanc/);
  });
});
