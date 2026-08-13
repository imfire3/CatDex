import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { normalizeCatGender } from '@/lib/catGender';

describe('normalizeCatGender', () => {
  it('maps French Vision sex labels to DB enums', () => {
    assert.equal(normalizeCatGender('mâle'), 'male');
    assert.equal(normalizeCatGender('femelle'), 'female');
    assert.equal(normalizeCatGender('inconnu'), 'unknown');
  });

  it('keeps English DB values', () => {
    assert.equal(normalizeCatGender('male'), 'male');
    assert.equal(normalizeCatGender('female'), 'female');
    assert.equal(normalizeCatGender('unknown'), 'unknown');
  });

  it('falls back to unknown for empty or exotic values', () => {
    assert.equal(normalizeCatGender(''), 'unknown');
    assert.equal(normalizeCatGender(null), 'unknown');
    assert.equal(normalizeCatGender(undefined), 'unknown');
    assert.equal(normalizeCatGender('???'), 'unknown');
  });
});
