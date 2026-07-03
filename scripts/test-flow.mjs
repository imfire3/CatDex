import { createClient } from "@supabase/supabase-js";
import { loadEnv, requireEnv } from "./env.mjs";

const DEMO_EMAIL = "demo.hunter@catdex.test";
const DEMO_PASSWORD = "CatDexDemo123!";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  loadEnv();
  const url = requireEnv("EXPO_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY");
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("1) Login demo user");
  const login = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  assert(!login.error, `Login failed: ${login.error?.message}`);
  const userId = login.data.user?.id;
  assert(userId, "Missing user id after login");
  console.log("✓ Login OK");

  console.log("2) Load profile");
  const profile = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  assert(!profile.error, profile.error?.message ?? "Profile error");
  assert(profile.data.onboarding_completed, "Expected onboarding_completed=true");
  console.log(`✓ Profile OK (${profile.data.username})`);

  console.log("3) Load zones");
  const zones = await supabase.from("zones").select("*").order("name");
  assert(!zones.error, zones.error?.message ?? "Zones error");
  assert((zones.data?.length ?? 0) >= 8, "Expected seeded zones");
  console.log(`✓ Zones OK (${zones.data.length})`);

  console.log("4) Load public cats");
  const cats = await supabase
    .from("cats")
    .select("*, zone:zones(name, city)")
    .order("created_at", { ascending: false });
  assert(!cats.error, cats.error?.message ?? "Cats error");
  assert((cats.data?.length ?? 0) >= 5, "Expected seeded cats");
  console.log(`✓ Public cats OK (${cats.data.length})`);

  console.log("5) Load personal ChatDex");
  const captures = await supabase
    .from("captures")
    .select("*, cat:cats(name, zone:zones(name))")
    .eq("user_id", userId);
  assert(!captures.error, captures.error?.message ?? "Captures error");
  assert((captures.data?.length ?? 0) >= 2, "Expected at least 2 captures for demo hunter");
  console.log(`✓ ChatDex OK (${captures.data.length} captures)`);

  console.log("6) Create new cat via RPC");
  const shibuya = zones.data.find((zone) => zone.name === "Shibuya");
  assert(shibuya, "Shibuya zone missing");
  const dedupKey = `flow_test_${Date.now()}`;
  const created = await supabase.rpc("create_cat_with_capture", {
    p_name: "FlowTest",
    p_zone_id: shibuya.id,
    p_color: "crème",
    p_breed: "européen",
    p_pattern: "uni",
    p_photo_url: "https://placecats.com/300/200?id=flow_test",
    p_dedup_key: dedupKey,
    p_lat_approx: shibuya.center_lat + 0.0004,
    p_lng_approx: shibuya.center_lng - 0.0003,
  });
  assert(!created.error, created.error?.message ?? "RPC create failed");
  console.log(`✓ Created cat ${created.data.name}`);

  console.log("7) Prevent duplicate cat");
  const duplicate = await supabase.rpc("create_cat_with_capture", {
    p_name: "FlowTestDuplicate",
    p_zone_id: shibuya.id,
    p_color: "crème",
    p_breed: "européen",
    p_pattern: "uni",
    p_photo_url: "https://placecats.com/300/200?id=flow_test_dup",
    p_dedup_key: dedupKey,
    p_lat_approx: shibuya.center_lat + 0.0004,
    p_lng_approx: shibuya.center_lng - 0.0003,
  });
  assert(duplicate.error, "Duplicate cat should be rejected");
  console.log("✓ Duplicate blocked");

  console.log("8) Add existing cat to ChatDex");
  const luna = cats.data.find((cat) => cat.name === "Luna");
  assert(luna, "Luna missing");
  const captureExisting = await supabase.from("captures").insert({
    user_id: userId,
    cat_id: luna.id,
    photo_url: "https://placecats.com/300/200?id=luna_capture_retry",
  });
  assert(
    !captureExisting.error || captureExisting.error.code === "23505",
    captureExisting.error?.message
  );
  console.log("✓ Existing cat capture handled");

  console.log("\nAll flow checks passed.");
}

main().catch((error) => {
  console.error("\nFlow test failed:", error.message);
  process.exit(1);
});
