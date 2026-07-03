import pg from "pg";
import { getDatabaseUrl, loadEnv } from "./env.mjs";

async function main() {
  loadEnv();
  const client = new pg.Client({
    connectionString: getDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    const result = await client.query(`
      update auth.users
      set
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        confirmed_at = coalesce(confirmed_at, now())
      where email_confirmed_at is null
      returning email
    `);

    if (result.rowCount === 0) {
      console.log("Aucun compte en attente de confirmation.");
      return;
    }

    console.log(`✓ ${result.rowCount} compte(s) confirmé(s) :`);
    for (const row of result.rows) {
      console.log(`  • ${row.email}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("\nÉchec confirmation email:", error.message);
  process.exit(1);
});
