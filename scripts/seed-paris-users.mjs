/**
 * Seed 6 Paris beta testers with varied CatDex sizes (REST, no WebSocket).
 *
 * Usage:
 *   node --env-file=.env scripts/seed-paris-users.mjs
 *
 * Requires EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY
 * Optional: SUPABASE_SERVICE_ROLE_KEY (preferred — creates users without email confirm)
 */
const URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(
  /\/$/,
  '',
);
const ANON =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ANON) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const SHARED_PASSWORD = 'CatDexSeed2026!';
const KEY = SERVICE || ANON;
const IS_ADMIN = Boolean(SERVICE);

/** Capture counts: user1=2, user2=0, user3=6, then varied. */
const USERS = [
  { slot: 1, email: 'seed.paris.1@catdex.app', displayName: 'Léa · Belleville', catCount: 2 },
  { slot: 2, email: 'seed.paris.2@catdex.app', displayName: 'Noé · Nouveau', catCount: 0 },
  { slot: 3, email: 'seed.paris.3@catdex.app', displayName: 'Inès · Père-Lachaise', catCount: 6 },
  { slot: 4, email: 'seed.paris.4@catdex.app', displayName: 'Hugo · Ménilmontant', catCount: 4 },
  { slot: 5, email: 'seed.paris.5@catdex.app', displayName: 'Aya · Charonne', catCount: 1 },
  { slot: 6, email: 'seed.paris.6@catdex.app', displayName: 'Tom · Nation', catCount: 5 },
];

const PHOTOS = [
  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&q=80',
  'https://images.unsplash.com/photo-1592194996308-7b1b9a1dedbc?w=400&q=80',
  'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&q=80',
  'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&q=80',
  'https://images.unsplash.com/photo-1533738363-b7f9aef958cd?w=400&q=80',
  'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400&q=80',
];

const NAMES = [
  'Miel', 'Ombre', 'Éclair', 'Velours', 'Nuit', 'Pixel', 'Croquette', 'Moustache',
  'Patoune', 'Tigrou', 'Neige', 'Cendre', 'Boubou', 'Miaouki', 'Grisou', 'Roux',
];

const COLORS = ['Roux', 'Noir', 'Blanc', 'Tigré', 'Gris', 'Écaille de tortue'];
const BREEDS = ['Européen', 'Chartreux', 'Siamois', 'Maine Coon', 'Persan'];
const COATS = ['Court', 'Mi-long', 'Long'];

const BOUNDS = {
  minLat: 48.848,
  maxLat: 48.875,
  minLng: 2.376,
  maxLng: 2.412,
};

function pick(list, i) {
  return list[i % list.length];
}

function randomParisPoint(seed) {
  const t = Math.sin(seed * 12.9898) * 43758.5453;
  const u = t - Math.floor(t);
  const v = Math.sin(seed * 78.233) * 43758.5453;
  const w = v - Math.floor(v);
  return {
    latitude: BOUNDS.minLat + u * (BOUNDS.maxLat - BOUNDS.minLat),
    longitude: BOUNDS.minLng + w * (BOUNDS.maxLng - BOUNDS.minLng),
  };
}

function buildCats(ownerSlot, count) {
  const cats = [];
  for (let i = 0; i < count; i += 1) {
    const seed = ownerSlot * 100 + i + 1;
    const point = randomParisPoint(seed);
    const name = pick(NAMES, seed);
    const color = pick(COLORS, seed + 3);
    const breed = pick(BREEDS, seed + 5);
    const coat = pick(COATS, seed + 7);
    cats.push({
      name,
      description: `Chat seed #${ownerSlot}-${i + 1} — quartier Paris 20e.`,
      coat_type: coat,
      breed,
      gender: pick(['male', 'female', 'unknown'], seed),
      dex_number: i + 1,
      latitude: point.latitude,
      longitude: point.longitude,
      address: 'Paris 20e (seed)',
      photo_url: pick(PHOTOS, seed),
      analysis: {
        color,
        breed,
        coat,
        description: `${color} ${breed.toLowerCase()} aperçu près de ${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}.`,
        suggested_name: name,
        gender: pick(['male', 'female', 'unknown'], seed),
        eyes: pick(['Verts', 'Ambre', 'Bleus'], seed),
        size: pick(['Petit', 'Moyen', 'Grand'], seed),
        tags: ['Seed', 'Paris', color],
      },
    });
  }
  return cats;
}

async function api(path, { method = 'GET', body, token = KEY, headers = {} } = {}) {
  const res = await fetch(`${URL}${path}`, {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg =
      (data && (data.msg || data.message || data.error_description || data.error)) ||
      text ||
      res.statusText;
    const err = new Error(`${method} ${path} → ${res.status}: ${msg}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function ensureUser(spec) {
  if (IS_ADMIN) {
    // List is heavy; try create, on duplicate sign-in via password grant isn't available for admin.
    try {
      const created = await api('/auth/v1/admin/users', {
        method: 'POST',
        body: {
          email: spec.email,
          password: SHARED_PASSWORD,
          email_confirm: true,
          user_metadata: { display_name: spec.displayName },
        },
      });
      await api('/rest/v1/profiles', {
        method: 'POST',
        body: {
          id: created.id,
          email: spec.email,
          display_name: spec.displayName,
        },
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      }).catch(() => undefined);
      return { id: created.id, via: 'admin-create', accessToken: KEY };
    } catch (error) {
      if (error.status !== 422 && error.status !== 400) throw error;
      // Fetch user by email via admin list filter
      const listed = await api(
        `/auth/v1/admin/users?page=1&per_page=200`,
      );
      const users = listed?.users || listed || [];
      const existing = users.find(
        (u) => u.email?.toLowerCase() === spec.email.toLowerCase(),
      );
      if (!existing) throw error;
      await api('/rest/v1/profiles', {
        method: 'POST',
        body: {
          id: existing.id,
          email: spec.email,
          display_name: spec.displayName,
        },
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      }).catch(() => undefined);
      return { id: existing.id, via: 'admin-existing', accessToken: KEY };
    }
  }

  // Anon: signup then password login
  try {
    await api('/auth/v1/signup', {
      method: 'POST',
      token: ANON,
      body: {
        email: spec.email,
        password: SHARED_PASSWORD,
        data: { display_name: spec.displayName },
      },
    });
  } catch (error) {
    // User may already exist — continue to login
    if (error.status !== 400 && error.status !== 422) {
      // ignore "already registered"
    }
  }

  const session = await api('/auth/v1/token?grant_type=password', {
    method: 'POST',
    token: ANON,
    body: {
      email: spec.email,
      password: SHARED_PASSWORD,
    },
  });

  const userId = session.user?.id;
  if (!userId || !session.access_token) {
    throw new Error('Login did not return a session (email confirm may be required)');
  }

  await api('/rest/v1/profiles', {
    method: 'POST',
    token: session.access_token,
    body: {
      id: userId,
      email: spec.email,
      display_name: spec.displayName,
    },
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
  }).catch(() => undefined);

  return {
    id: userId,
    via: 'password',
    accessToken: session.access_token,
  };
}

async function replaceCatsForUser(ownerId, cats, accessToken) {
  const token = IS_ADMIN ? KEY : accessToken;

  const existing = await api(
    `/rest/v1/cats?owner_id=eq.${ownerId}&address=eq.${encodeURIComponent('Paris 20e (seed)')}&select=id`,
    { token },
  );

  if (Array.isArray(existing) && existing.length) {
    const ids = existing.map((row) => row.id);
    const inList = `(${ids.join(',')})`;
    await api(`/rest/v1/cat_analysis?cat_id=in.${inList}`, {
      method: 'DELETE',
      token,
      headers: { Prefer: 'return=minimal' },
    }).catch(() => undefined);
    await api(`/rest/v1/cats?id=in.${inList}`, {
      method: 'DELETE',
      token,
      headers: { Prefer: 'return=minimal' },
    });
  }

  for (const cat of cats) {
    const inserted = await api('/rest/v1/cats', {
      method: 'POST',
      token,
      body: {
        owner_id: ownerId,
        name: cat.name,
        description: cat.description,
        coat_type: cat.coat_type,
        breed: cat.breed,
        gender: cat.gender,
        dex_number: cat.dex_number,
        latitude: cat.latitude,
        longitude: cat.longitude,
        address: cat.address,
        photo_url: cat.photo_url,
      },
    });
    const row = Array.isArray(inserted) ? inserted[0] : inserted;
    await api('/rest/v1/cat_analysis', {
      method: 'POST',
      token,
      body: {
        cat_id: row.id,
        color: cat.analysis.color,
        breed: cat.analysis.breed,
        coat: cat.analysis.coat,
        description: cat.analysis.description,
        suggested_name: cat.analysis.suggested_name,
        gender: cat.analysis.gender,
        eyes: cat.analysis.eyes,
        size: cat.analysis.size,
        tags: cat.analysis.tags,
      },
      headers: { Prefer: 'return=minimal' },
    });
  }
}

async function main() {
  console.log(`Seeding ${USERS.length} Paris users → ${URL}`);
  console.log(IS_ADMIN ? 'Using SERVICE_ROLE (admin)' : 'Using ANON (signup/signin)');
  console.log('');

  let failed = 0;

  for (const spec of USERS) {
    const cats = buildCats(spec.slot, spec.catCount);
    try {
      const user = await ensureUser(spec);
      await replaceCatsForUser(user.id, cats, user.accessToken);
      console.log(
        `✓ ${spec.displayName} <${spec.email}> — ${spec.catCount} chat(s) [${user.via}]`,
      );
    } catch (error) {
      failed += 1;
      console.error(`✗ ${spec.email}:`, error.message || error);
    }
  }

  console.log('\n--- Login credentials (all accounts) ---');
  console.log(`Password: ${SHARED_PASSWORD}`);
  console.log('Emails:');
  for (const u of USERS) {
    console.log(`  ${u.email}  (${u.catCount} cats) — ${u.displayName}`);
  }
  console.log('\nTip: connect as seed.paris.2 (0 cats) to see everyone else’s pins as discoverable (?).');
  console.log('Connect as seed.paris.3 (6 cats) to see a fuller owned CatDex + others as ?.');

  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
