import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { getDatabaseUrl, loadEnv } from "./env.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

async function runSqlFile(client, relativePath) {
  const filePath = resolve(root, relativePath);
  const sql = readFileSync(filePath, "utf8");
  console.log(`→ Running ${relativePath}`);
  await client.query(sql);
  console.log(`✓ ${relativePath}`);
}

async function main() {
  loadEnv();
  const databaseUrl = getDatabaseUrl();
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await runSqlFile(client, "supabase/schema.sql");
    await runSqlFile(client, "supabase/schema-extensions.sql");
    await runSqlFile(client, "supabase/schema-gameplay.sql");
    await runSqlFile(client, "supabase/storage.sql");
    console.log("\nDatabase setup complete.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("\nSetup failed:", error.message);
  process.exit(1);
});
