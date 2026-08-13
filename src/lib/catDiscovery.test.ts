import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildOwnedCatIdSet,
  getCatDiscoveryState,
  isOwnedByCurrentUser,
} from './catDiscovery';
import type { Cat, CatAnalysis } from '../types/cat';

function analysis(): CatAnalysis {
  return {
    color: 'Roux',
    breed: 'Européen',
    coat: 'Court',
    description: 'Chat de test',
  };
}

function cat(partial: Partial<Cat> & Pick<Cat, 'id'>): Cat {
  return {
    number: 1,
    name: 'Test',
    photoUri: '',
    latitude: 48.86,
    longitude: 2.35,
    discoveredAt: '2026-01-01',
    views: 0,
    analysis: analysis(),
    ...partial,
  };
}

describe('buildOwnedCatIdSet', () => {
  it('indexes id, remoteId and sourceWorldId', () => {
    const ids = buildOwnedCatIdSet([
      cat({ id: 'local-1', remoteId: 'remote-1', sourceWorldId: 'world-1' }),
      cat({ id: 'local-2' }),
    ]);
    assert.equal(ids.has('local-1'), true);
    assert.equal(ids.has('remote-1'), true);
    assert.equal(ids.has('world-1'), true);
    assert.equal(ids.has('local-2'), true);
    assert.equal(ids.has('missing'), false);
  });

  it('returns empty set for empty collection', () => {
    assert.equal(buildOwnedCatIdSet([]).size, 0);
  });
});

describe('getCatDiscoveryState', () => {
  it('marks empty CatDex + community pin as discoverable', () => {
    const ownedIds = buildOwnedCatIdSet([]);
    const community = cat({ id: 'community-1', remoteId: 'community-1' });
    assert.equal(getCatDiscoveryState(community, ownedIds), 'discoverable');
    assert.equal(isOwnedByCurrentUser(community, ownedIds), false);
  });

  it('marks own captures as owned', () => {
    const mine = cat({ id: 'mine-1', remoteId: 'uuid-mine' });
    const ownedIds = buildOwnedCatIdSet([mine]);
    assert.equal(getCatDiscoveryState(mine, ownedIds), 'owned');
    assert.equal(
      getCatDiscoveryState({ id: 'uuid-mine' }, ownedIds),
      'owned',
    );
  });

  it('marks mixed map: owned + discoverable', () => {
    const mine = cat({
      id: 'mine-1',
      remoteId: 'uuid-mine',
      sourceWorldId: 'sighting-a',
    });
    const ownedIds = buildOwnedCatIdSet([mine]);
    assert.equal(
      getCatDiscoveryState({ id: 'sighting-a' }, ownedIds),
      'owned',
    );
    assert.equal(
      getCatDiscoveryState({ id: 'other-sighting', remoteId: 'other' }, ownedIds),
      'discoverable',
    );
  });

  it('treats remoteId match as owned', () => {
    const ownedIds = buildOwnedCatIdSet([
      cat({ id: 'local', remoteId: 'remote-x' }),
    ]);
    assert.equal(
      getCatDiscoveryState({ id: 'unrelated', remoteId: 'remote-x' }, ownedIds),
      'owned',
    );
  });
});
