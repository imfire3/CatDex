import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CAT_BREED_OPTIONS, catBreedOptionsForValue } from './catBreeds';

describe('catBreedOptionsForValue', () => {
  it('includes canonical French breeds used in capture', () => {
    assert.ok(CAT_BREED_OPTIONS.includes('Bengal'));
    assert.ok(CAT_BREED_OPTIONS.includes('Européen'));
    assert.ok(CAT_BREED_OPTIONS.includes('Race inconnue'));
  });

  it('keeps a custom Vision label at the top', () => {
    const options = catBreedOptionsForValue('Chartreux');
    assert.equal(options[0], 'Chartreux');
    assert.ok(options.includes('Bengal'));
  });

  it('does not duplicate a canonical label', () => {
    const options = catBreedOptionsForValue('bengal');
    assert.equal(options.filter((label) => label.toLowerCase() === 'bengal').length, 1);
  });
});
