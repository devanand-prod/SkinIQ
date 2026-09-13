export type ConditionKey =
  | 'darkSpots'
  | 'discoloration'
  | 'texture'
  | 'hydration'
  | 'pores';

export const CONDITION_KEYS: ConditionKey[] = [
  'darkSpots',
  'discoloration',
  'texture',
  'hydration',
  'pores',
];

/**
 * Coarse banding used to color-code a score for display (tags, bars).
 * Not a clinical severity scale — just a UI grouping.
 */
export type Tier = 'good' | 'mild' | 'attn';

export interface ScanScores {
  overall: number;
  darkSpots: number;
  discoloration: number;
  texture: number;
  hydration: number;
  pores: number;
}

export interface ScanRecord {
  id: string;
  timestamp: string;
  scores: ScanScores;
  photoUri?: string;
}

export function tierForScore(score: number): Tier {
  if (score >= 75) return 'good';
  if (score >= 45) return 'mild';
  return 'attn';
}
