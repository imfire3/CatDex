import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getRuntimeAnalyzeStats, recordAnalyzeEvent } from './statsStore';

describe('statsStore', () => {
  it('records ok and error analyze events', () => {
    const before = getRuntimeAnalyzeStats();

    recordAnalyzeEvent({
      ok: true,
      userId: 'user-a',
      latencyMs: 100,
      model: 'gpt-4o-mini',
    });
    recordAnalyzeEvent({
      ok: false,
      userId: 'user-b',
      latencyMs: 50,
      error: 'Payload invalide',
    });

    const after = getRuntimeAnalyzeStats();
    assert.equal(after.total, before.total + 2);
    assert.equal(after.ok, before.ok + 1);
    assert.equal(after.errors, before.errors + 1);
    assert.equal(after.recent[0]?.userId, 'user-b');
    assert.equal(after.recent[1]?.userId, 'user-a');
  });
});
