import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  analysisForClaimedCat,
  displayNameForClaim,
} from './claimDiscoverableCat';
import type { ClaimTarget } from '../store/claimTarget';

const target: ClaimTarget = {
  sourceWorldId: 'sighting-1',
  name: 'Flambyx',
  latitude: 48.86,
  longitude: 2.4,
  analysis: {
    color: 'Roux',
    breed: 'Européen',
    coat: 'Court',
    description: 'Roux du square.',
    suggestedName: 'Flambyx',
    tags: ['Vif', 'Soleil'],
    rarity: 'Commun',
  },
};

describe('analysisForClaimedCat', () => {
  it('keeps the community traits and name without inventing new ones', () => {
    const analysis = analysisForClaimedCat(target);
    assert.equal(analysis.color, 'Roux');
    assert.equal(analysis.breed, 'Européen');
    assert.equal(analysis.coat, 'Court');
    assert.equal(analysis.suggestedName, 'Flambyx');
    assert.deepEqual(analysis.tags, ['Vif', 'Soleil']);
    assert.equal(analysis.rarity, 'Commun');
    assert.match(analysis.description, /Roux du square/);
  });
});

describe('displayNameForClaim', () => {
  it('prefers the coined nickname on the sighting', () => {
    assert.equal(displayNameForClaim(target), 'Flambyx');
  });
});
