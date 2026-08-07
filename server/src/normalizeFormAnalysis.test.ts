/**
 * Flat form Vision normalize tests.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { RACE_INCONNUE } from './breedPolicy';
import { normalizeAnalysis } from './normalizeVisionAnalysis';

describe('normalizeAnalysis form schema', () => {
  it('maps flat Vision JSON to form fields without inventing', () => {
    const result = normalizeAnalysis({
      isCat: true,
      reason: '',
      name: 'Rouxie',
      breed: 'Persan',
      breedConfidence: 42,
      coatColor: 'Roux et blanc',
      coatPattern: 'bicolore',
      furLength: 'mi-long',
      eyeColor: 'Verts',
      size: 'moyen',
      estimatedAge: 'adulte',
      sex: 'inconnu',
      distinctiveFeatures: ['Poitrine blanche'],
      personalityTraits: ['Curieux'],
      description:
        'Chat roux à poils mi-longs, avec une poitrine blanche et des yeux verts. Il regarde l’objectif.',
    });

    assert.equal(result.notACat, false);
    assert.equal(result.suggestedName, 'Rouxie');
    assert.equal(result.breed, RACE_INCONNUE);
    assert.equal(result.color, 'Roux et blanc');
    assert.equal(result.coat, 'Mi-long');
    assert.equal(result.tags?.[0], 'Curieux');
    assert.match(result.coatPattern ?? '', /Poitrine blanche/);
    assert.match(result.description, /poitrine blanche/i);
  });

  it('returns notACat when isCat is false', () => {
    const result = normalizeAnalysis({
      isCat: false,
      reason: 'C’est un chien.',
      name: '',
      breed: '',
      breedConfidence: 0,
      coatColor: '',
      coatPattern: '',
      furLength: '',
      eyeColor: '',
      size: '',
      estimatedAge: '',
      sex: 'inconnu',
      distinctiveFeatures: [],
      personalityTraits: [],
      description: '',
    });

    assert.equal(result.notACat, true);
    assert.match(result.errorMessage ?? '', /chien/i);
  });

  it('leaves empty fields empty — no Européen/Roux/Long defaults', () => {
    const result = normalizeAnalysis({
      isCat: true,
      reason: '',
      name: '',
      breed: '',
      breedConfidence: 90,
      coatColor: '',
      coatPattern: '',
      furLength: '',
      eyeColor: '',
      size: '',
      estimatedAge: '',
      sex: 'inconnu',
      distinctiveFeatures: [],
      personalityTraits: [],
      description: '',
    });

    assert.equal(result.suggestedName, '');
    assert.equal(result.breed, RACE_INCONNUE);
    assert.equal(result.color, '');
    assert.equal(result.coat, '');
    assert.equal(result.description, '');
    assert.deepEqual(result.tags, []);
  });
});
