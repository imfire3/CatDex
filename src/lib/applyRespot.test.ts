import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { applyRespot, resolveCaptureCount, withCaptureCount } from './applyRespot';
import type { Cat } from '@/types/cat';

const base: Cat = {
  id: 'cat_1',
  number: 7,
  name: 'Paprika',
  photoUri: 'file://old.jpg',
  latitude: 48.86,
  longitude: 2.4,
  discoveredAt: '2026-01-01T00:00:00.000Z',
  lastSeenAt: '2026-01-02T00:00:00.000Z',
  views: 2,
  captureCount: 1,
  analysis: {
    color: 'Gris',
    breed: 'Européen',
    coat: 'Court',
    description: 'stable',
  },
};

describe('applyRespot', () => {
  it('bumps captureCount and updates location without renaming or touching views', () => {
    const next = applyRespot(base, {
      latitude: 48.861,
      longitude: 2.401,
      photoUri: 'file://new.jpg',
      nowIso: '2026-09-02T12:00:00.000Z',
    });
    assert.equal(next.captureCount, 2);
    assert.equal(next.views, 2);
    assert.equal(next.lastSeenAt, '2026-09-02T12:00:00.000Z');
    assert.equal(next.latitude, 48.861);
    assert.equal(next.longitude, 2.401);
    assert.equal(next.photoUri, 'file://new.jpg');
    assert.equal(next.name, 'Paprika');
    assert.equal(next.number, 7);
    assert.equal(next.discoveredAt, base.discoveredAt);
    assert.equal(next.analysis.description, 'stable');
    assert.notEqual(next, base);
  });

  it('keeps previous photo when photoUri omitted', () => {
    const next = applyRespot(base, {
      latitude: 48.861,
      longitude: 2.401,
      nowIso: '2026-09-02T12:00:00.000Z',
    });
    assert.equal(next.photoUri, 'file://old.jpg');
    assert.equal(next.captureCount, 2);
  });
});

describe('resolveCaptureCount', () => {
  it('keeps an explicit captureCount', () => {
    assert.equal(resolveCaptureCount({ captureCount: 4, views: 99 }), 4);
  });

  it('derives from views for legacy cats', () => {
    assert.equal(
      resolveCaptureCount({ captureCount: undefined as unknown as number, views: 3 }),
      3,
    );
    assert.equal(resolveCaptureCount({ views: 0 } as Pick<Cat, 'captureCount' | 'views'>), 1);
  });
});

describe('withCaptureCount', () => {
  it('fills missing captureCount on hydrate', () => {
    const legacy = { ...base, captureCount: undefined as unknown as number, views: 5 };
    const next = withCaptureCount(legacy);
    assert.equal(next.captureCount, 5);
    assert.equal(withCaptureCount(base), base);
  });
});
