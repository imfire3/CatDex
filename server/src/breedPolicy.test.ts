import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseBreedKey, resolveBreed, resolveCoatLength, RACE_INCONNUE } from './breedPolicy';

describe('parseBreedKey', () => {
  it('parses french and english labels', () => {
    assert.equal(parseBreedKey('Persan'), 'persian');
    assert.equal(parseBreedKey('Persian'), 'persian');
    assert.equal(parseBreedKey('Chat domestique à poil court'), 'domestic_shorthair');
    assert.equal(parseBreedKey('Européen'), 'european');
  });
});

describe('resolveBreed confidence gate', () => {
  it('returns Race inconnue when confidence < 60%', () => {
    const result = resolveBreed({
      breedKey: 'siamese',
      confidence: 0.55,
      coatLength: 'short',
    });
    assert.equal(result.key, 'unknown');
    assert.equal(result.label, RACE_INCONNUE);
  });

  it('returns Race inconnue for unknown key', () => {
    const result = resolveBreed({ breedKey: 'unknown', confidence: 0.9 });
    assert.equal(result.label, RACE_INCONNUE);
  });

  it('keeps precise breed when confidence ≥ 80%', () => {
    const result = resolveBreed({
      breedKey: 'bengal',
      confidence: 0.85,
      coatLength: 'short',
      visibleEvidence: ['rosettes'],
    });
    assert.equal(result.key, 'bengal');
    assert.equal(result.label, 'Bengal');
  });
});

describe('resolveCoatLength', () => {
  it('keeps short', () => {
    assert.equal(resolveCoatLength('short', 0.4), 'short');
  });

  it('does not invent short when unknown', () => {
    assert.equal(resolveCoatLength('unknown', 0.9), 'unknown');
  });
});
