import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  bearingDegrees,
  formatBearingToward,
  formatDistanceAndDirection,
  neighborhoodLabel,
  pickCatOfTheDay,
} from './geoLabels';
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
    latitude: 48.872,
    longitude: 2.377,
    discoveredAt: '2026-01-01',
    views: 0,
    captureCount: 1,
    analysis: analysis(),
    ...partial,
  };
}

describe('neighborhoodLabel', () => {
  it('names Belleville around the metro', () => {
    assert.equal(neighborhoodLabel(48.87215, 2.37689), 'Belleville');
  });

  it('names Père Lachaise on the east side', () => {
    assert.equal(neighborhoodLabel(48.86, 2.395), 'Père Lachaise');
  });
});

describe('bearing', () => {
  it('points north when the target is due north', () => {
    const deg = bearingDegrees(48.86, 2.38, 48.87, 2.38);
    assert.ok(deg < 8 || deg > 352);
    assert.equal(formatBearingToward(0), 'vers le nord');
  });

  it('combines distance and direction', () => {
    const label = formatDistanceAndDirection({
      distanceM: 150,
      fromLat: 48.86,
      fromLng: 2.38,
      toLat: 48.861,
      toLng: 2.382,
    });
    assert.match(label ?? '', /150 m · vers le /);
  });
});

describe('pickCatOfTheDay', () => {
  it('returns a stable cat for a given day', () => {
    const cats = [
      cat({ id: 'a', name: 'A' }),
      cat({ id: 'b', name: 'B' }),
      cat({ id: 'c', name: 'C' }),
    ];
    const day = new Date('2026-08-30T12:00:00Z');
    assert.equal(pickCatOfTheDay(cats, day)?.id, pickCatOfTheDay(cats, day)?.id);
  });

  it('returns null when the list is empty', () => {
    assert.equal(pickCatOfTheDay([]), null);
  });
});
