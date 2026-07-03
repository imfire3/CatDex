import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

export function loadEnv() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return;

  for (const rawLine of readFileSync(envPath, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (!key || process.env[key]) continue;

    process.env[key] = value;
  }
}

export function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.includes("your_supabase") || value.includes("_here")) {
    throw new Error(`Missing or placeholder env var: ${name}`);
  }
  return value;
}

export function getProjectRef() {
  const url = requireEnv("EXPO_PUBLIC_SUPABASE_URL");
  const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!ref) throw new Error("Invalid EXPO_PUBLIC_SUPABASE_URL");
  return ref;
}

export function getServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SB_SECRET_KEY
  );
}

export function getDatabaseUrl() {
  if (
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("your_supabase") &&
    !process.env.DATABASE_URL.includes("_here")
  ) {
    return process.env.DATABASE_URL;
  }

  const password =
    process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD;
  if (!password) {
    throw new Error(
      "Missing DATABASE_URL or SUPABASE_DB_PASSWORD in .env"
    );
  }

  const ref = getProjectRef();
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}
