import type { AnalysisSource, Highlight, ScanScores } from '../../types/skin';
import { runAcneDetector } from './acneDetector';
import { scoreDarkSpots } from './darkSpots';
import { scoreDiscoloration } from './discoloration';
import { scoreHydration } from './hydration';
import { scorePores } from './pores';
import { runSkinSignals } from './skinSignals';
import { scoreTexture } from './texture';

export interface AnalysisResult {
  scores: ScanScores;
  /** Undefined = the acne detector didn't run at all (model failed/missing);
   * empty array = it ran and found zero boxes. Not the same thing — see
   * PhotoHighlightOverlay. */
  highlights?: Highlight[];
  source: AnalysisSource;
}

function clamp0100(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

/**
 * darkSpots score from acne/lesion detection boxes: 92 (near-clear) if
 * nothing was detected, otherwise penalized by both how many boxes and how
 * confident the model was in them. Ported as-is from the web prototype.
 */
function scoreFromDetections(detections: Highlight[]): number {
  if (detections.length === 0) return 92;
  const avgConfidence = detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length;
  return clamp0100(100 - detections.length * 9 - avgConfidence * 10);
}

/**
 * Runs both on-device models against a captured photo and maps their output
 * onto the app's 5 UI conditions. The mapping is many-to-one, not 1:1 — see
 * constants/models.ts's CONDITION_MAPPING_NOTE:
 *   darkSpots <- acne detector boxes
 *   discoloration <- skin-signals "sunDamage"
 *   texture <- skin-signals "structure"
 *   pores <- skin-signals "structure" (same signal, reused)
 *   hydration <- skin-signals "hydration"
 *   overall <- average of the 5 above
 *
 * The two models are independent: each is wrapped so one failing doesn't
 * block the other, and whichever fails falls back to the flat heuristic
 * placeholder this pipeline used before real models were wired in (see
 * texture.ts / darkSpots.ts / discoloration.ts / hydration.ts / pores.ts).
 * `source` tells the caller which case happened so the UI can say so
 * honestly instead of presenting a heuristic guess as a real analysis.
 */
export async function analyzeCapture(uri: string): Promise<AnalysisResult> {
  const [signalsResult, acneResult] = await Promise.allSettled([runSkinSignals(uri), runAcneDetector(uri)]);

  const signalsOk = signalsResult.status === 'fulfilled';
  const acneOk = acneResult.status === 'fulfilled';

  if (!signalsOk) {
    console.warn('[analysis] skin-signals model failed, falling back to heuristic placeholder', signalsResult.reason);
  }
  if (!acneOk) {
    console.warn('[analysis] acne detector failed, falling back to heuristic placeholder', acneResult.reason);
  }

  const discoloration = signalsOk
    ? clamp0100(signalsResult.value.sunDamage * 100)
    : scoreDiscoloration(new Uint8Array(0), 0, 0);
  const texture = signalsOk
    ? clamp0100(signalsResult.value.structure * 100)
    : scoreTexture(new Uint8Array(0), 0, 0);
  const pores = signalsOk
    ? clamp0100(signalsResult.value.structure * 100)
    : scorePores(new Uint8Array(0), 0, 0);
  const hydration = signalsOk
    ? clamp0100(signalsResult.value.hydration * 100)
    : scoreHydration(new Uint8Array(0), 0, 0);
  const darkSpots = acneOk ? scoreFromDetections(acneResult.value) : scoreDarkSpots(new Uint8Array(0), 0, 0);

  const overall = clamp0100((darkSpots + discoloration + texture + hydration + pores) / 5);

  const source: AnalysisSource = signalsOk && acneOk ? 'model' : signalsOk || acneOk ? 'partial' : 'heuristic';

  return {
    scores: { overall, darkSpots, discoloration, texture, hydration, pores },
    highlights: acneOk ? acneResult.value : undefined,
    source,
  };
}
