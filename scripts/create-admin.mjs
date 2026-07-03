import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import {
  getDatabaseUrl,
  getServiceRoleKey,
  loadEnv,
  requireEnv,
} from "./env.mjs";

const ADMIN = {
  email: "admin@catdex.local",
  password: "admin",
  username: "admin",
  display_name: "Admin",
};

async function main() {
  loadEnv();
  const url = requireEnv("EXPO_PUBLIC_SUPABASE_URL");
  const serviceRole = getServiceRoleKey();
  if (!serviceRole) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in .env");
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
    const list = await admin.auth.admin.listUsers();
    const existing = list.data.users.find((user) => user.email === ADMIN.email);

    let userId = existing?.id;
    if (!existing) {
      const created = await admin.auth.admin.createUser({
        email: ADMIN.email,
        password: ADMIN.password,
        email_confirm: true,
        user_metadata: {
          username: ADMIN.username,
          display_name: ADMIN.display_name,
        },
      });
      if (created.error) throw created.error;
      userId = created.data.user.id;
      console.log("✓ Compte admin créé");
    } else {
      const updated = await admin.auth.admin.updateUserById(existing.id, {
        password: ADMIN.password,
        email_confirm: true,
        user_metadata: {
          username: ADMIN.username,
          display_name: ADMIN.display_name,
        },
      });
      if (updated.error) throw updated.error;
      userId = existing.id;
      console.log("✓ Compte admin mis à jour");
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
      [userId, ADMIN.username, ADMIN.display_name]
    );

    console.log("\nIdentifiants admin :");
    console.log("  Identifiant : admin");
    console.log("  Mot de passe : admin");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("\nÉchec création admin:", error.message);
  process.exit(1);
});
