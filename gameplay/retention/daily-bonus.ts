export function dailyBonusXp(streak: number): number {
  const safe = Math.max(1, streak);
  if (safe === 1) return 50;
  if (safe < 7) return 50 + safe * 15;
  if (safe < 30) return 100 + safe * 10;
  return Math.min(500, 180 + safe * 8);
}

export function streakLabel(streak: number): string {
  if (streak >= 30) return "Légende urbaine";
  if (streak >= 14) return "Chasseur confirmé";
  if (streak >= 7) return "Explorateur fidèle";
  if (streak >= 3) return "En forme";
  return "Nouveau jour";
}

export function nextStreakMilestone(streak: number): { days: number; reward: string } | null {
  const milestones = [
    { at: 3, reward: "+25 XP bonus quotidien" },
    { at: 7, reward: "Badge Série de feu" },
    { at: 14, reward: "Cadre profil argent" },
    { at: 30, reward: "Cadre profil or" },
  ];
  const next = milestones.find((m) => m.at > streak);
  if (!next) return null;
  return { days: next.at - streak, reward: next.reward };
}

export function daysSinceLastActive(lastActiveDate: string | null): number {
  if (!lastActiveDate) return 999;
  const last = new Date(lastActiveDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - last.getTime()) / 86400000);
}
