import { verifySupabaseAccessToken } from './analyzeAuth';

function getSupabaseUrl(): string | null {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  return url && !url.includes('your-project') ? url.replace(/\/+$/, '') : null;
}

function getServiceRoleKey(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key || /your[-_]?service|changeme|example/i.test(key)) return null;
  return key;
}

async function listStoragePaths(
  supabaseUrl: string,
  serviceKey: string,
  userId: string,
): Promise<string[]> {
  const paths: string[] = [];
  const queue = [userId];

  while (queue.length > 0) {
    const prefix = queue.shift()!;
    const response = await fetch(`${supabaseUrl}/storage/v1/object/list/cats`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prefix: `${prefix}/`,
        limit: 1000,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Storage list failed (${response.status}): ${text}`);
    }

    const entries = (await response.json()) as Array<{
      name?: string;
      id?: string | null;
      metadata?: unknown;
    }>;

    for (const entry of entries) {
      if (!entry.name) continue;
      const fullPath = `${prefix}/${entry.name}`;
      // Folders have null id in Storage list API.
      if (entry.id == null && !entry.metadata) {
        queue.push(fullPath);
      } else {
        paths.push(fullPath);
      }
    }
  }

  return paths;
}

async function deleteStoragePaths(
  supabaseUrl: string,
  serviceKey: string,
  paths: string[],
): Promise<void> {
  if (paths.length === 0) return;

  const chunkSize = 100;
  for (let i = 0; i < paths.length; i += chunkSize) {
    const chunk = paths.slice(i, i + chunkSize);
    const response = await fetch(`${supabaseUrl}/storage/v1/object/cats`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefixes: chunk }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Storage delete failed (${response.status}): ${text}`);
    }
  }
}

async function deleteAuthUser(
  supabaseUrl: string,
  serviceKey: string,
  userId: string,
): Promise<void> {
  const response = await fetch(
    `${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
    },
  );

  if (!response.ok && response.status !== 404) {
    const text = await response.text().catch(() => '');
    throw new Error(`Auth delete failed (${response.status}): ${text}`);
  }
}

/**
 * Permanently delete the authenticated user: storage objects + auth.users
 * (DB rows cascade via FK).
 */
export async function deleteAccountForBearerToken(
  authorizationHeader: string | undefined,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const match = /^Bearer\s+(.+)$/i.exec(authorizationHeader ?? '');
  const token = match?.[1]?.trim();
  if (!token) {
    return { ok: false, status: 401, error: 'Non autorisé.' };
  }

  const user = await verifySupabaseAccessToken(token);
  if (!user?.id) {
    return { ok: false, status: 401, error: 'Session invalide.' };
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getServiceRoleKey();
  if (!supabaseUrl || !serviceKey) {
    return {
      ok: false,
      status: 503,
      error:
        'Suppression indisponible. Configure SUPABASE_SERVICE_ROLE_KEY côté API.',
    };
  }

  try {
    const paths = await listStoragePaths(supabaseUrl, serviceKey, user.id);
    await deleteStoragePaths(supabaseUrl, serviceKey, paths);
    await deleteAuthUser(supabaseUrl, serviceKey, user.id);
    return { ok: true };
  } catch (error) {
    console.error('[delete-account]', error);
    return {
      ok: false,
      status: 502,
      error: 'Impossible de supprimer le compte pour le moment. Réessaie plus tard.',
    };
  }
}
