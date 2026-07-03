import * as Location from "expo-location";
import {
  fetchProfile,
  signInAnonymously,
  signInWithApple,
  signInWithCredentials,
  signInWithGoogle,
  signOut,
  signUpWithEmail,
  updateProfile,
} from "@/lib/auth";
import type { Profile } from "@/types/database";

export const authService = {
  signInWithCredentials,
  signUpWithEmail,
  signInWithGoogle,
  signInWithApple,
  signInAnonymously,
  signOut,
  fetchProfile,
  updateProfile,
  async requestLocationPermission() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  },
  async requestCameraPermission() {
    const { Camera } = await import("expo-camera");
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === "granted";
  },
  async syncOnboarding(userId: string, username: string, avatarEmoji: string) {
    return updateProfile(userId, {
      username,
      display_name: username,
      onboarding_completed: true,
      avatar_emoji: avatarEmoji,
    });
  },
  async touchDailyStreak(userId: string, profile: Profile) {
    const today = new Date().toISOString().slice(0, 10);
    if (profile.last_active_date === today) return profile;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);

    let nextStreak: number;
    if (profile.last_active_date === yStr) {
      nextStreak = profile.streak + 1;
    } else if (profile.last_active_date && profile.streak > 1) {
      const { retentionStore } = await import("@/gameplay/retention/retention-store");
      const { daysSinceLastActive } = await import("@/gameplay/retention/daily-bonus");
      const missed = daysSinceLastActive(profile.last_active_date);
      if (missed === 2 && retentionStore.canUseStreakFreeze()) {
        retentionStore.useStreakFreeze();
        nextStreak = profile.streak;
      } else {
        nextStreak = 1;
      }
    } else {
      nextStreak = 1;
    }

    return updateProfile(userId, {
      streak: nextStreak,
      last_active_date: today,
    });
  },
};
