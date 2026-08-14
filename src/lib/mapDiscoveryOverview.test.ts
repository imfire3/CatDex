import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  coordinatesForDiscoveryOverview,
  DISCOVERY_OVERVIEW_RADIUS_M,
} from './mapDiscoveryOverview';

describe('coordinatesForDiscoveryOverview', () => {
  it('includes the player and nearby discoverable cats', () => {
    const origin = { latitude: 48.8635, longitude: 2.3985 };
    const points = coordinatesForDiscoveryOverview(origin, [
      { latitude: 48.864, longitude: 2.399 },
      { latitude: 48.9, longitude: 2.45 },
    ]);
    assert.equal(points[0]?.latitude, origin.latitude);
    assert.ok(points.some((p) => p.latitude === 48.864));
    assert.ok(!points.some((p) => p.latitude === 48.9));
  });

  it('falls back to nearest cats when none are inside the radius', () => {
    const origin = { latitude: 48.8635, longitude: 2.3985 };
    const farLat = origin.latitude + DISCOVERY_OVERVIEW_RADIUS_M / 111_320 + 0.02;
    const points = coordinatesForDiscoveryOverview(origin, [
      { latitude: farLat, longitude: origin.longitude },
      { latitude: farLat + 0.01, longitude: origin.longitude },
    ]);
    assert.equal(points.length, 3);
    assert.ok(points.some((p) => p.latitude === farLat));
  });
});
