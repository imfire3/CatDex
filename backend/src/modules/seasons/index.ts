import { Season, BadgeId } from '@catdex/shared';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SEASONAL_CHALLENGES = [
  'Discover 15 cats in new neighborhoods',
  'Photograph 20 unique cat breeds',
  'Complete all daily missions for 7 days',
  'Find 5 first-discoverer cats',
  'Explore 3 new districts',
  'Observe 30 cats this month',
];

const SEASONAL_BACKGROUNDS = [
  'seasonal_spring', 'seasonal_summer', 'seasonal_autumn', 'seasonal_winter',
];

export function getCurrentSeason(): Season {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

  return {
    id: `season-${year}-${month + 1}`,
    name: `${MONTH_NAMES[month]} Challenge`,
    month: month + 1,
    year,
    challenge: SEASONAL_CHALLENGES[month % SEASONAL_CHALLENGES.length],
    limitedBadgeId: 'seasonal_champion' as BadgeId,
    specialBackground: SEASONAL_BACKGROUNDS[month % SEASONAL_BACKGROUNDS.length],
    endsAt: endOfMonth.toISOString(),
  };
}

export interface SeasonService {
  getCurrentSeason(): Season;
}

export const seasonService: SeasonService = {
  getCurrentSeason,
};
