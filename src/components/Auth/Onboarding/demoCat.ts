/**
 * Clean demo photo for onboarding — never use the welcome screenshot asset
 * (`onboarding-demo-cat.jpg` embeds UI chrome and looks broken in circle crops).
 */
export const DEMO_CAT_IMAGE = require('../../../../assets/world-cats/miel.jpg');

export const DEMO_ONBOARDING_CAT = {
  name: 'Miel',
  number: 42,
  rarity: 'Rare',
  neighborhood: 'Belleville',
  distance: '150 m',
  breed: 'Européen',
  color: 'Tigré',
} as const;
