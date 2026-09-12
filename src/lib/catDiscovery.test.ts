import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildOwnedCatIdSet,
  getCatDiscoveryState,
  isOwnedByCurrentUser,
  mergeMapCatsForExplorer,
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
    captureCount: 1,
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

describe('mergeMapCatsForExplorer', () => {
  it('replaces a claimed community pin with the owned fiche at the same spot', () => {
    const community = cat({
      id: 'sighting-a',
      remoteId: 'sighting-a',
      name: 'Mystère',
      latitude: 48.87,
      longitude: 2.4,
    });
    const claimed = cat({
      id: 'local-claimed',
      name: 'Noctix',
      sourceWorldId: 'sighting-a',
      latitude: 48.1,
      longitude: 2.1,
      photoUri: 'file://mine.jpg',
    });
    const ownedIds = buildOwnedCatIdSet([claimed]);
    const pins = mergeMapCatsForExplorer([claimed], [community], ownedIds);
    assert.equal(pins.length, 1);
    assert.equal(pins[0].id, 'local-claimed');
    assert.equal(pins[0].name, 'Noctix');
    assert.equal(pins[0].latitude, 48.87);
    assert.equal(pins[0].longitude, 2.4);
    assert.equal(getCatDiscoveryState(pins[0], ownedIds), 'owned');
  });

  it('keeps unclaimed community pins discoverable', () => {
    const community = cat({ id: 'sighting-b', latitude: 48.88, longitude: 2.41 });
    const mine = cat({ id: 'mine', latitude: 48.86, longitude: 2.35 });
    const ownedIds = buildOwnedCatIdSet([mine]);
    const pins = mergeMapCatsForExplorer([mine], [community], ownedIds);
    assert.equal(pins.length, 2);
    const mystery = pins.find((p) => p.id === 'sighting-b');
    assert.ok(mystery);
    assert.equal(getCatDiscoveryState(mystery!, ownedIds), 'discoverable');
  });
});
