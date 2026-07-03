import type { SeasonChallenge } from "@/gameplay/types";

export function getCurrentSeason(): SeasonChallenge {
  const now = new Date();
  const month = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const seasons: Record<number, SeasonChallenge> = {
    0: { id: "season_jan", month: "Janvier", title: "Hiver Félin", description: "Découvre 15 chats ce mois-ci", badgeId: "season_winter", backgroundId: "winter_snow", target: 15, metric: "discoveries" },
    1: { id: "season_feb", month: "Février", title: "Amour Félin", description: "Trouve 10 chats tricolores", badgeId: "season_love", backgroundId: "valentine", target: 10, metric: "discoveries" },
    6: { id: "season_jul", month: "Juillet", title: "Été Urbain", description: "20 découvertes en plein été", badgeId: "season_summer", backgroundId: "summer_glow", target: 20, metric: "discoveries" },
  };

  const challenge = seasons[now.getMonth()] ?? {
    id: `season_${now.getMonth()}`,
    month,
    title: "Défi du mois",
    description: "12 découvertes ce mois-ci",
    badgeId: "season_monthly",
    backgroundId: "monthly_default",
    target: 12,
    metric: "discoveries" as const,
  };

  return challenge;
}
