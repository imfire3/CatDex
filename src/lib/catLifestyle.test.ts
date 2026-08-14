import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  isCatVisibleOnMap,
  normalizeCatLifestyle,
} from './catLifestyle';

describe('normalizeCatLifestyle', () => {
  it('maps domestique aliases', () => {
    assert.equal(normalizeCatLifestyle('domestique'), 'domestique');
    assert.equal(normalizeCatLifestyle('Domestique'), 'domestique');
    assert.equal(normalizeCatLifestyle('pet'), 'domestique');
  });

  it('defaults to sauvage', () => {
    assert.equal(normalizeCatLifestyle(undefined), 'sauvage');
    assert.equal(normalizeCatLifestyle('Sauvage'), 'sauvage');
    assert.equal(normalizeCatLifestyle('street'), 'sauvage');
  });
});

describe('isCatVisibleOnMap', () => {
  it('hides domestique pets from the explorer map', () => {
    assert.equal(isCatVisibleOnMap({ lifestyle: 'domestique' }), false);
    assert.equal(isCatVisibleOnMap({ lifestyle: 'sauvage' }), true);
    assert.equal(isCatVisibleOnMap({}), true);
  });
});
