import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CAPTURE_HIT_WINDOW,
  CAPTURE_SWING_MAX_MS,
  CAPTURE_SWING_MIN_MS,
  isCaptureHit,
  resolveCaptureTap,
  sampleSwingDurationMs,
} from './captureSwing';

describe('sampleSwingDurationMs', () => {
  it('stays within [1200, 2200]', () => {
    for (let i = 0; i < 50; i += 1) {
      const ms = sampleSwingDurationMs(() => i / 49);
      assert.ok(ms >= CAPTURE_SWING_MIN_MS);
      assert.ok(ms <= CAPTURE_SWING_MAX_MS);
    }
  });

  it('maps 0 → min and 1 → max', () => {
    assert.equal(sampleSwingDurationMs(() => 0), CAPTURE_SWING_MIN_MS);
    assert.equal(sampleSwingDurationMs(() => 1), CAPTURE_SWING_MAX_MS);
  });
});

describe('isCaptureHit', () => {
  it('hits at center', () => {
    assert.equal(isCaptureHit(0.5), true);
  });

  it('hits at edge of window', () => {
    const half = CAPTURE_HIT_WINDOW / 2;
    assert.equal(isCaptureHit(0.5 - half), true);
    assert.equal(isCaptureHit(0.5 + half), true);
  });

  it('misses outside window', () => {
    const half = CAPTURE_HIT_WINDOW / 2;
    assert.equal(isCaptureHit(0.5 - half - 0.001), false);
    assert.equal(isCaptureHit(0.5 + half + 0.001), false);
    assert.equal(isCaptureHit(0), false);
    assert.equal(isCaptureHit(1), false);
  });
});

describe('resolveCaptureTap', () => {
  it('returns hit / miss while swinging', () => {
    assert.equal(resolveCaptureTap('swinging', 0.5), 'hit');
    assert.equal(resolveCaptureTap('swinging', 0), 'miss');
  });

  it('ignores taps while resolving or success', () => {
    assert.equal(resolveCaptureTap('resolving', 0.5), 'ignored');
    assert.equal(resolveCaptureTap('success', 0.5), 'ignored');
  });
});
