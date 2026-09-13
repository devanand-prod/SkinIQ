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

/** A single detected box from the acne/lesion model, in normalized [0,1]
 * rect space against the original captured photo. */
export interface Highlight {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  classId: number;
}

/**
 * How a scan's scores were produced:
 * - 'model'     the photo decoded fine (classical-CV signals are real) and
 *               the acne detector ran (darkSpots is real)
 * - 'partial'   only one of those two succeeded
 * - 'heuristic' both failed — every score is a flat placeholder
 */
export type AnalysisSource = 'model' | 'partial' | 'heuristic';

export interface ScanRecord {
  id: string;
  timestamp: string;
  scores: ScanScores;
  photoUri?: string;
  /** Dark-spot detection boxes. Undefined = detector didn't run at all;
   * empty array = it ran and found zero — these are not the same thing. */
  highlights?: Highlight[];
  source?: AnalysisSource;
  /** Present only when source !== 'model' — the raw error from whichever
   * part of the pipeline failed, kept so a failure is diagnosable from the
   * device itself. */
  errors?: { photoDecode?: string; acne?: string };
}

export function tierForScore(score: number): Tier {
  if (score >= 75) return 'good';
  if (score >= 45) return 'mild';
  return 'attn';
}
