import type { MockCat } from "@/data/mock";

export type CollectionNudge = {
  emoji: string;
  message: string;
  subtext?: string;
  urgency: "low" | "medium" | "high";
};

export function getCollectionNudge(
  discovered: number,
  total: number,
  undiscoveredNearby: MockCat[]
): CollectionNudge | null {
  if (undiscoveredNearby.length > 0) {
    const closest = undiscoveredNearby[0];
    return {
      emoji: "📸",
      message: `${undiscoveredNearby.length} chat${undiscoveredNearby.length > 1 ? "s" : ""} inconnu${undiscoveredNearby.length > 1 ? "s" : ""} tout près`,
      subtext: closest ? `Le plus proche : ${closest.zone}` : undefined,
      urgency: "high",
    };
  }

  const remaining = total - discovered;
  if (remaining > 0 && remaining <= 3) {
    return {
      emoji: "🎯",
      message: `Plus que ${remaining} pour compléter le ChatDex local`,
      subtext: "Tu y es presque — une petite balade ?",
      urgency: "medium",
    };
  }

  if (discovered === 0 && total > 0) {
    return {
      emoji: "🐾",
      message: "Ta première découverte t'attend",
      subtext: "Ouvre la carte et cherche les silhouettes",
      urgency: "medium",
    };
  }

  const pct = total > 0 ? discovered / total : 0;
  if (pct >= 0.5 && pct < 1) {
    return {
      emoji: "📚",
      message: `${Math.round(pct * 100)}% de la zone documentée`,
      subtext: "Continue — chaque chat compte pour ta série",
      urgency: "low",
    };
  }

  return null;
}

export function getZoneCompletionByName(
  cats: MockCat[],
  zoneName: string
): { discovered: number; total: number } {
  const inZone = cats.filter((c) => c.zone === zoneName);
  return {
    discovered: inZone.filter((c) => c.discovered).length,
    total: inZone.length,
  };
}
