export const queryKeys = {
  profile: (id: string) => ["profile", id] as const,
  zones: ["zones"] as const,
  cats: ["cats"] as const,
  cat: (id: string) => ["cat", id] as const,
  captures: (userId: string) => ["captures", userId] as const,
  favorites: (userId: string) => ["favorites", userId] as const,
  badges: ["badges"] as const,
  userBadges: (userId: string) => ["userBadges", userId] as const,
  friends: (userId: string) => ["friends", userId] as const,
  leaderboard: ["leaderboard"] as const,
  notifications: (userId: string) => ["notifications", userId] as const,
  nearby: (lat: number, lng: number) => ["nearby", lat.toFixed(3), lng.toFixed(3)] as const,
};
