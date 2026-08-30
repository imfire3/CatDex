import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BELLEVILLE_METRO } from './geoLabels';
import { buildDailyQuests } from './progression';
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
    longitude: 2.39,
    discoveredAt: '2020-01-01T00:00:00.000Z',
    views: 0,
    analysis: analysis(),
    ...partial,
  };
}

describe('buildDailyQuests', () => {
  it('asks for the first cat when the CatDex is empty', () => {
    const quests = buildDailyQuests([], { streakDays: 0 });
    assert.equal(quests[0]?.id, 'daily-scan');
    assert.equal(quests[0]?.title, 'Capture ton premier chat');
    assert.equal(quests[0]?.completed, false);
    assert.equal(quests[1]?.id, 'daily-streak');
    assert.equal(quests[2]?.id, 'daily-metro');
  });

  it('completes the metro quest when a cat is near Belleville', () => {
    const quests = buildDailyQuests(
      [
        cat({
          id: 'metro',
          latitude: BELLEVILLE_METRO.latitude,
          longitude: BELLEVILLE_METRO.longitude,
        }),
      ],
      { streakDays: 3 },
    );
    assert.equal(quests[2]?.completed, true);
    assert.equal(quests[1]?.completed, true);
  });
});
