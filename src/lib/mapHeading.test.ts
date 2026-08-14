import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  headingDeltaDegrees,
  headingFromDeviceOrientation,
  normalizeHeading,
  resolveDeviceHeading,
  shouldUpdateHeading,
} from './mapHeading';

describe('normalizeHeading', () => {
  it('wraps into 0–360', () => {
    assert.equal(normalizeHeading(0), 0);
    assert.equal(normalizeHeading(360), 0);
    assert.equal(normalizeHeading(-90), 270);
    assert.equal(normalizeHeading(450), 90);
  });
});

describe('headingDeltaDegrees', () => {
  it('uses the shortest arc', () => {
    assert.equal(headingDeltaDegrees(10, 20), 10);
    assert.equal(headingDeltaDegrees(350, 10), 20);
    assert.equal(headingDeltaDegrees(0, 180), 180);
  });
});

describe('resolveDeviceHeading', () => {
  it('prefers true heading when valid', () => {
    assert.equal(
      resolveDeviceHeading({ trueHeading: 42, magHeading: 10, accuracy: 2 }),
      42,
    );
  });

  it('falls back to magnetic when true heading is unavailable', () => {
    assert.equal(
      resolveDeviceHeading({ trueHeading: -1, magHeading: 88, accuracy: 3 }),
      88,
    );
  });

  it('rejects invalid samples', () => {
    assert.equal(
      resolveDeviceHeading({ trueHeading: -1, magHeading: -1, accuracy: 0 }),
      null,
    );
  });
});

describe('shouldUpdateHeading', () => {
  it('updates on first sample and when past threshold', () => {
    assert.equal(shouldUpdateHeading(null, 10), true);
    assert.equal(shouldUpdateHeading(10, 12), false);
    assert.equal(shouldUpdateHeading(10, 15), true);
  });
});

describe('headingFromDeviceOrientation', () => {
  it('uses webkitCompassHeading when present', () => {
    assert.equal(
      headingFromDeviceOrientation({ alpha: 100, webkitCompassHeading: 33 }),
      33,
    );
  });

  it('inverts absolute alpha', () => {
    assert.equal(
      headingFromDeviceOrientation({ alpha: 90, absolute: true }),
      270,
    );
  });

  it('falls back to inverted alpha when webkit is missing', () => {
    assert.equal(headingFromDeviceOrientation({ alpha: 90 }), 270);
  });
});
