import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { makeRedirectUri } from "expo-auth-session";
import type { AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { normalizeEmail } from "@/lib/validation";

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri({ scheme: "catdex" });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function signInAfterSignup(email: string, password: string) {
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) await sleep(400);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return data;

    const authError = error as AuthError;
    if (authError.code !== "email_not_confirmed" || attempt === maxAttempts - 1) {
      throw error;
    }
  }

  throw new Error("Connexion impossible après inscription.");
}

export const ADMIN_EMAIL = "admin@catdex.local";
export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "admin";

export function resolveLoginIdentifier(identifier: string) {
  const value = identifier.trim().toLowerCase();
  if (value === ADMIN_USERNAME) return ADMIN_EMAIL;
  if (value.includes("@")) return identifier.trim();
  return identifier.trim();
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signInWithCredentials(identifier: string, password: string) {
  return signInWithEmail(resolveLoginIdentifier(identifier), password);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  username: string
) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedUsername = username.trim();

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: { username: normalizedUsername, display_name: normalizedUsername },
    },
  });
  if (error) throw error;
  if (data.session) return data;

  return signInAfterSignup(normalizedEmail, password);
}

async function signInWithOAuth(provider: "google" | "apple") {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error("OAuth URL missing");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success" || !result.url) {
    throw new Error("Connexion annulée");
  }

  const url = new URL(result.url);
  const params = new URLSearchParams(url.hash.replace("#", "?"));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    throw new Error("Tokens OAuth manquants");
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError) throw sessionError;
}

export function signInWithGoogle() {
  return signInWithOAuth("google");
}

export function signInWithApple() {
  return signInWithOAuth("apple");
}

export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function updateProfile(
  userId: string,
  updates: {
    username?: string;
    display_name?: string;
    onboarding_completed?: boolean;
    avatar_emoji?: string;
    avatar_url?: string;
    xp?: number;
    level?: number;
    streak?: number;
    last_active_date?: string;
    total_captures?: number;
    zones_explored?: number;
  }
) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}
