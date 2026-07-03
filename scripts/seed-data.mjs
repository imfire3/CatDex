import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import {
  getDatabaseUrl,
  getServiceRoleKey,
  loadEnv,
  requireEnv,
} from "./env.mjs";

const DEMO_USERS = [
  {
    email: "admin@catdex.local",
    password: "admin",
    username: "admin",
    display_name: "Admin",
  },
  {
    email: "demo.hunter@catdex.test",
    password: "CatDexDemo123!",
    username: "demo_hunter",
    display_name: "Demo Hunter",
  },
  {
    email: "demo.spotter@catdex.test",
    password: "CatDexDemo123!",
    username: "demo_spotter",
    display_name: "Demo Spotter",
  },
];

const DEMO_CATS = [
  {
    ownerEmail: "demo.hunter@catdex.test",
    zoneName: "Shibuya",
    city: "Tokyo",
    name: "Whiskers",
    color: "roux",
    breed: "européen",
    pattern: "uni",
    dedup_key: "seed_whiskers_shibuya",
    lat_offset: 0.0012,
    lng_offset: -0.0008,
  },
  {
    ownerEmail: "demo.hunter@catdex.test",
    zoneName: "Shinjuku",
    city: "Tokyo",
    name: "Mittens",
    color: "gris",
    breed: "chartreux",
    pattern: "uni",
    dedup_key: "seed_mittens_shinjuku",
    lat_offset: -0.0009,
    lng_offset: 0.0011,
  },
  {
    ownerEmail: "demo.spotter@catdex.test",
    zoneName: "Asakusa",
    city: "Tokyo",
    name: "Luna",
    color: "noir",
    breed: "européen",
    pattern: "uni",
    dedup_key: "seed_luna_asakusa",
    lat_offset: 0.0007,
    lng_offset: 0.0005,
  },
  {
    ownerEmail: "demo.spotter@catdex.test",
    zoneName: "Ginza",
    city: "Tokyo",
    name: "Oliver",
    color: "blanc",
    breed: "persan",
    pattern: "uni",
    dedup_key: "seed_oliver_ginza",
    lat_offset: -0.0010,
    lng_offset: -0.0006,
  },
  {
    ownerEmail: "demo.hunter@catdex.test",
    zoneName: "Akihabara",
    city: "Tokyo",
    name: "Leo",
    color: "tigré",
    breed: "bengal",
    pattern: "rayé",
    dedup_key: "seed_leo_akihabara",
    lat_offset: 0.0008,
    lng_offset: 0.0013,
  },
  {
    ownerEmail: "demo.spotter@catdex.test",
    zoneName: "Le Marais",
    city: "Paris",
    name: "Félix",
    color: "noir",
    breed: "européen",
    pattern: "uni",
    dedup_key: "seed_felix_marais",
    lat_offset: 0.0004,
    lng_offset: -0.0003,
  },
  {
    ownerEmail: "demo.hunter@catdex.test",
    zoneName: "Bastille",
    city: "Paris",
    name: "Minou",
    color: "gris",
    breed: "chartreux",
    pattern: "uni",
    dedup_key: "seed_minou_bastille",
    lat_offset: -0.0005,
    lng_offset: 0.0004,
  },
  {
    ownerEmail: "demo.spotter@catdex.test",
    zoneName: "Père-Lachaise",
    city: "Paris",
    name: "Gribouille",
    color: "tigré",
    breed: "européen",
    pattern: "rayé",
    dedup_key: "seed_gribouille_lachaise",
    lat_offset: 0.0003,
    lng_offset: 0.0006,
  },
  {
    ownerEmail: "demo.hunter@catdex.test",
    zoneName: "Belleville",
    city: "Paris",
    name: "Chaussette",
    color: "blanc",
    breed: "angora",
    pattern: "uni",
    dedup_key: "seed_chaussette_belleville",
    lat_offset: 0.0006,
    lng_offset: -0.0004,
  },
  {
    ownerEmail: "demo.spotter@catdex.test",
    zoneName: "République",
    city: "Paris",
    name: "Roussi",
    color: "roux",
    breed: "européen",
    pattern: "uni",
    dedup_key: "seed_roussi_republique",
    lat_offset: -0.0003,
    lng_offset: 0.0002,
  },
];

const EXTRA_ZONES = [
  { name: "Le Marais", city: "Paris", center_lat: 48.8566, center_lng: 2.3622, radius_meters: 600 },
  { name: "Bastille", city: "Paris", center_lat: 48.8530, center_lng: 2.3690, radius_meters: 600 },
  { name: "Belleville", city: "Paris", center_lat: 48.8720, center_lng: 2.3765, radius_meters: 700 },
  { name: "Père-Lachaise", city: "Paris", center_lat: 48.8610, center_lng: 2.3934, radius_meters: 550 },
  { name: "République", city: "Paris", center_lat: 48.8676, center_lng: 2.3636, radius_meters: 500 },
  { name: "Ménilmontant", city: "Paris", center_lat: 48.8665, center_lng: 2.3885, radius_meters: 550 },
];

async function ensureZones(client) {
  for (const zone of EXTRA_ZONES) {
    await client.query(
      `
      insert into public.zones (name, city, center_lat, center_lng, radius_meters)
      values ($1, $2, $3, $4, $5)
      on conflict (name, city) do nothing
      `,
      [zone.name, zone.city, zone.center_lat, zone.center_lng, zone.radius_meters]
    );
  }
  console.log("✓ Paris zones ensured");
}

async function ensureDemoUsers(admin, client) {
  const userMap = new Map();

  for (const demo of DEMO_USERS) {
    const list = await admin.auth.admin.listUsers();
    const existing = list.data.users.find((user) => user.email === demo.email);

    let userId = existing?.id;
    if (!existing) {
      const created = await admin.auth.admin.createUser({
        email: demo.email,
        password: demo.password,
        email_confirm: true,
        user_metadata: {
          username: demo.username,
          display_name: demo.display_name,
        },
      });
      if (created.error) throw created.error;
      userId = created.data.user.id;
      console.log(`✓ Created user ${demo.email}`);
    } else {
      console.log(`• User already exists ${demo.email}`);
    }

    await client.query(
      `
      insert into public.profiles (id, username, display_name, onboarding_completed)
      values ($1, $2, $3, true)
      on conflict (id) do update set
        username = excluded.username,
        display_name = excluded.display_name,
        onboarding_completed = true
      `,
      [userId, demo.username, demo.display_name]
    );

    userMap.set(demo.email, userId);
  }

  return userMap;
}

async function seedCats(client, userMap) {
  const zonesResult = await client.query(
    "select id, name, city, center_lat, center_lng from public.zones"
  );
  const zonesByKey = new Map(
    zonesResult.rows.map((row) => [`${row.name}:${row.city}`, row])
  );

  for (const cat of DEMO_CATS) {
    const zone = zonesByKey.get(`${cat.zoneName}:${cat.city}`);
    const ownerId = userMap.get(cat.ownerEmail);
    if (!zone || !ownerId) continue;

    await client.query(
      `
      insert into public.cats (
        name, zone_id, color, breed, pattern, photo_url, created_by,
        dedup_key, lat_approx, lng_approx
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      on conflict (dedup_key) do update set name = excluded.name
      `,
      [
        cat.name,
        zone.id,
        cat.color,
        cat.breed,
        cat.pattern,
        `https://placecats.com/300/200?id=${cat.dedup_key}`,
        ownerId,
        cat.dedup_key,
        zone.center_lat + cat.lat_offset,
        zone.center_lng + cat.lng_offset,
      ]
    );

    const catRow = await client.query(
      "select id from public.cats where dedup_key = $1",
      [cat.dedup_key]
    );
    const catId = catRow.rows[0].id;

    await client.query(
      `
      insert into public.captures (user_id, cat_id, photo_url)
      values ($1, $2, $3)
      on conflict (user_id, cat_id) do nothing
      `,
      [ownerId, catId, `https://placecats.com/300/200?id=${cat.dedup_key}`]
    );

    console.log(`✓ Seeded cat ${cat.name} (${cat.zoneName})`);
  }

  const hunterId = userMap.get("demo.hunter@catdex.test");
  const luna = await client.query(
    "select id from public.cats where dedup_key = 'seed_luna_asakusa'"
  );
  if (hunterId && luna.rows[0]) {
    await client.query(
      `
      insert into public.captures (user_id, cat_id, photo_url)
      values ($1, $2, $3)
      on conflict (user_id, cat_id) do nothing
      `,
      [hunterId, luna.rows[0].id, "https://placecats.com/300/200?id=seed_luna_capture"]
    );
    console.log("✓ Added cross-user capture: demo_hunter captured Luna");
  }
}

async function main() {
  loadEnv();
  const url = requireEnv("EXPO_PUBLIC_SUPABASE_URL");
  const serviceRole = getServiceRoleKey();
  if (!serviceRole) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY in .env"
    );
  }

  const admin = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const client = new pg.Client({
    connectionString: getDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await ensureZones(client);
    const userMap = await ensureDemoUsers(admin, client);
    await seedCats(client, userMap);
    console.log("\nSeed complete.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("\nSeed failed:", error.message);
  process.exit(1);
});
