import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { fetchSupabaseProductStats } from './supabaseProductStats';

const originalFetch = globalThis.fetch;
const originalUrl = process.env.SUPABASE_URL;
const originalExpoUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = originalUrl;
  if (originalExpoUrl === undefined) delete process.env.EXPO_PUBLIC_SUPABASE_URL;
  else process.env.EXPO_PUBLIC_SUPABASE_URL = originalExpoUrl;
  if (originalKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
});

function useEnv() {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  delete process.env.EXPO_PUBLIC_SUPABASE_URL;
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test';
}

function countResponse(total: number, body = '[{"id":"row-1"}]'): Response {
  return new Response(body, {
    status: 206,
    headers: {
      'content-range': `0-0/${total}`,
      'content-type': 'application/json',
    },
  });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('fetchSupabaseProductStats', () => {
  it('fails clearly when service_role env is missing', async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const stats = await fetchSupabaseProductStats();
    assert.equal(stats.available, false);
    assert.match(stats.error ?? '', /SUPABASE_SERVICE_ROLE_KEY/);
  });

  it('counts with GET + Range and consumes the response body', async () => {
    useEnv();
    const seen: Array<{ url: string; method: string; range: string | null }> =
      [];
    const responses: Response[] = [];

    globalThis.fetch = (async (input, init) => {
      const url = String(input);
      const headers = new Headers(init?.headers);
      seen.push({
        url,
        method: init?.method ?? 'GET',
        range: headers.get('Range'),
      });

      if (url.includes('/rest/v1/profiles') && url.includes('order=')) {
        return jsonResponse([]);
      }
      if (url.includes('/rest/v1/cats') && url.includes('order=')) {
        return jsonResponse([]);
      }

      const response = countResponse(12);
      responses.push(response);
      return response;
    }) as typeof fetch;

    const stats = await fetchSupabaseProductStats();
    assert.equal(stats.available, true);
    assert.equal(stats.profiles, 12);
    assert.equal(stats.cats, 12);

    const countCalls = seen.filter((call) => !call.url.includes('order='));
    assert.ok(countCalls.length >= 2);
    for (const call of countCalls) {
      assert.equal(call.method, 'GET');
      assert.equal(call.range, '0-0');
    }
    assert.ok(responses.every((response) => response.bodyUsed));
  });

  it('surfaces recent profile fetch errors instead of an empty list', async () => {
    useEnv();

    globalThis.fetch = (async (input) => {
      const url = String(input);
      if (url.includes('/rest/v1/profiles') && url.includes('order=')) {
        return new Response('JWT expired', { status: 401 });
      }
      if (url.includes('/rest/v1/cats') && url.includes('order=')) {
        return jsonResponse([]);
      }
      return countResponse(3);
    }) as typeof fetch;

    const stats = await fetchSupabaseProductStats();
    assert.equal(stats.available, true);
    assert.deepEqual(stats.recentProfiles, []);
    assert.match(stats.recentProfilesError ?? '', /401/);
  });

  it('keeps owner display names when lifestyle select fails but embed works', async () => {
    useEnv();

    globalThis.fetch = (async (input) => {
      const url = decodeURIComponent(String(input));
      if (url.includes('/rest/v1/profiles') && url.includes('order=')) {
        return jsonResponse([]);
      }
      if (url.includes('/rest/v1/cats') && url.includes('order=')) {
        if (url.includes('lifestyle') && url.includes('profiles!')) {
          return new Response('column cats.lifestyle does not exist', {
            status: 400,
          });
        }
        if (url.includes('profiles!')) {
          return jsonResponse([
            {
              id: 'cat-1',
              name: 'Pixel',
              photo_url: null,
              owner_id: 'user-1',
              created_at: '2026-08-14T09:30:00.000Z',
              profiles: { display_name: 'Miaouledea' },
            },
          ]);
        }
        return jsonResponse([
          {
            id: 'cat-1',
            name: 'Pixel',
            photo_url: null,
            owner_id: 'user-1',
            created_at: '2026-08-14T09:30:00.000Z',
          },
        ]);
      }
      return countResponse(1);
    }) as typeof fetch;

    const stats = await fetchSupabaseProductStats();
    assert.equal(stats.recentCats?.[0]?.owner_display_name, 'Miaouledea');
    assert.equal(stats.recentCatsError, undefined);
  });
});
