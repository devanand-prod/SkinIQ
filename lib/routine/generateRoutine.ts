import { amRoutineSteps, pmRoutineSteps, routineTips } from '../../constants/copy';
import { CONDITION_KEYS } from '../../types/skin';
import type { ConditionKey, ScanScores } from '../../types/skin';

export interface RoutinePlan {
  focusAreas: ConditionKey[];
  am: string[];
  pm: string[];
  tip: string;
}

/**
 * Derives a simple routine plan from a set of scan scores: the two
 * lowest-scoring conditions become "focus areas", the AM/PM steps are
 * static placeholder copy (see constants/copy.ts), and one rotating tip is
 * picked deterministically from the overall score so it doesn't change on
 * every re-render of the same scan.
 */
export function generateRoutine(scores: ScanScores): RoutinePlan {
  const focusAreas = [...CONDITION_KEYS].sort((a, b) => scores[a] - scores[b]).slice(0, 2);

  const tipIndex = Math.floor(scores.overall) % routineTips.length;

  return {
    focusAreas,
    am: amRoutineSteps,
    pm: pmRoutineSteps,
    tip: routineTips[tipIndex],
  };
}
