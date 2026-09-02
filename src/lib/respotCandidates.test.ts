import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { findRespotCandidates, RESPOT_MAX_DISTANCE_M } from './respotCandidates';
import type { Cat } from '@/types/cat';

function makeCat(overrides: Partial<Cat> & Pick<Cat, 'id' | 'latitude' | 'longitude'>): Cat {
  return {
    number: 1,
    name: 'Paprika',
    photoUri: '',
    discoveredAt: '2026-01-01T00:00:00.000Z',
    views: 1,
    analysis: {
      color: 'Gris',
      breed: 'Européen',
      coat: 'Court',
      description: 'Gris du métro',
      coatPattern: 'Tigré',
    },
    ...overrides,
  };
}

describe('findRespotCandidates', () => {
  it('excludes cats farther than max distance', () => {
    const owned = [
      makeCat({ id: 'far', latitude: 48.86, longitude: 2.4 }),
    ];
    // ~1.1 km north
    const result = findRespotCandidates(owned, {
      latitude: 48.87,
      longitude: 2.4,
      analysis: { color: 'Gris', coatPattern: 'Tigré', coat: 'Court', breed: 'Européen' },
    });
    assert.equal(result.length, 0);
  });

  it('ranks a nearby same-color cat first', () => {
    const owned = [
      makeCat({ id: 'match', name: 'Paprika', latitude: 48.8601, longitude: 2.4 }),
      makeCat({
        id: 'other',
        name: 'Roux',
        latitude: 48.8601,
        longitude: 2.4,
        analysis: {
          color: 'Roux',
          breed: 'Européen',
          coat: 'Court',
          description: 'x',
          coatPattern: 'Uni',
        },
      }),
    ];
    const result = findRespotCandidates(owned, {
      latitude: 48.86,
      longitude: 2.4,
      analysis: { color: 'Gris', coatPattern: 'Tigré', coat: 'Court', breed: 'Européen' },
    });
    assert.ok(result.length >= 1);
    assert.equal(result[0].cat.id, 'match');
    assert.ok(result[0].score >= 0.55);
    assert.ok(result[0].distanceM < RESPOT_MAX_DISTANCE_M);
  });

  it('treats missing pattern as neutral (still can match on color+geo)', () => {
    const owned = [
      makeCat({
        id: 'no-pattern',
        latitude: 48.86005,
        longitude: 2.4,
        analysis: {
          color: 'Gris',
          breed: 'Européen',
          coat: 'Court',
          description: 'x',
        },
      }),
    ];
    const result = findRespotCandidates(owned, {
      latitude: 48.86,
      longitude: 2.4,
      analysis: { color: 'Gris', coat: 'Court', breed: 'Européen' },
    });
    assert.equal(result.length, 1);
    assert.equal(result[0].cat.id, 'no-pattern');
  });

  it('returns at most 3 candidates', () => {
    const owned = Array.from({ length: 5 }, (_, i) =>
      makeCat({
        id: `c${i}`,
        name: `Cat${i}`,
        latitude: 48.86 + i * 0.00005,
        longitude: 2.4,
      }),
    );
    const result = findRespotCandidates(owned, {
      latitude: 48.86,
      longitude: 2.4,
      analysis: { color: 'Gris', coatPattern: 'Tigré', coat: 'Court', breed: 'Européen' },
    });
    assert.ok(result.length <= 3);
  });
});
