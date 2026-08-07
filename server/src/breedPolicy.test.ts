import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseBreedKey, resolveBreed, resolveCoatLength } from './breedPolicy';

describe('parseBreedKey', () => {
  it('parses french and english labels', () => {
    assert.equal(parseBreedKey('Persan'), 'persian');
    assert.equal(parseBreedKey('Persian'), 'persian');
    assert.equal(parseBreedKey('Chat domestique à poil court'), 'domestic_shorthair');
    assert.equal(parseBreedKey('Européen'), 'european');
  });
});

describe('resolveBreed defaults', () => {
  it('defaults unknown to european', () => {
    const result = resolveBreed({ breedKey: 'unknown', coatLength: 'short' });
    assert.equal(result.key, 'european');
  });
});

describe('resolveCoatLength', () => {
  it('keeps short', () => {
    assert.equal(resolveCoatLength('short', 0.4), 'short');
  });
});
