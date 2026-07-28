/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface NeonFeature {
  id: number;
  category: string;
  name: string;
  description: string;
}

export const NEON_ARENA_FEATURE_CATEGORIES = [
  'Open World & Maps',
  'Characters & AI',
  'Combat Systems',
  'Vehicles',
  'Creatures & Wildlife',
  'Building & Creation',
  'Technology Systems',
  'Economy & Trading',
  'Multiplayer',
  'Story & Missions',
  'Customization',
  'Survival & Adventure',
  'Future Technology',
  'Secret Features',
  'Developer Tools'
] as const;

export const TOTAL_FEATURE_COUNT = 500;
