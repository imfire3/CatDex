import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { renderAdminDashboardHtml } from './adminDashboard';

describe('renderAdminDashboardHtml', () => {
  it('renders product photo and recent capture stats', () => {
    const html = renderAdminDashboardHtml({
      generatedAt: '2026-08-14T10:00:00.000Z',
      analyze: {
        processStartedAt: '2026-08-14T09:00:00.000Z',
        total: 2,
        ok: 2,
        errors: 0,
        avgLatencyMs: 120,
        last24h: { ok: 2, errors: 0 },
        recent: [],
      },
      product: {
        available: true,
        profiles: 5,
        profilesLast7d: 2,
        cats: 10,
        catsWithPhoto: 8,
        catsLast24h: 1,
        catsLast7d: 4,
        sauvage: 7,
        domestique: 3,
        sightings: 0,
        analyses: 8,
        recentCats: [
          {
            id: 'cat-1',
            name: 'Pixel',
            photo_url: 'https://example.com/pixel.jpg',
            owner_id: 'user-abcdef12-3456',
            lifestyle: 'sauvage',
            created_at: '2026-08-14T09:30:00.000Z',
          },
        ],
      },
    });

    assert.match(html, /Avec photo/);
    assert.match(html, />8</);
    assert.match(html, /Captures 24h/);
    assert.match(html, /Sauvage/);
    assert.match(html, /Domestique/);
    assert.match(html, /Dernières captures/);
    assert.match(html, /Pixel/);
    assert.match(html, /https:\/\/example\.com\/pixel\.jpg/);
  });
});
