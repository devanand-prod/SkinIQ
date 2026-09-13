import type { AnalysisSource, Highlight, ScanScores } from '../../types/skin';
import { runAcneDetector } from './acneDetector';
import { scoreDarkSpots } from './darkSpots';
import { scoreDiscoloration } from './discoloration';
import { scoreHydration } from './hydration';
import { resizeAndCenterCrop } from './imagePreprocessing';
import { scorePores } from './pores';
import { scoreTexture } from './texture';

export interface AnalysisResult {
  scores: ScanScores;
  /** Undefined = the acne detector didn't run at all (model failed/missing);
   * empty array = it ran and found zero boxes. Not the same thing — see
   * PhotoHighlightOverlay. */
  highlights?: Highlight[];
  source: AnalysisSource;
  /** Present only when source !== 'model' — the actual error from
   * whichever part of the pipeline failed, so a failure is diagnosable
   * from the device itself without needing adb/logcat access. */
  errors?: { photoDecode?: string; acne?: string };
}

// Classical-CV signals (texture/pores/hydration/discoloration) all run
// against the same decoded photo — resolution chosen for reasonable
// texture/pore detail at low compute cost, not tied to any model's
// required input size (there's no ML model behind these anymore — see
// constants/models.ts for why).
const ANALYSIS_INPUT_SIZE = 256;
const ANALYSIS_RESIZE_SHORT_SIDE = 288;

function clamp0100(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function describeError(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  if (typeof reason === 'string') return reason;
  try {
    return JSON.stringify(reason);
  } catch {
    return String(reason);
  }
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
 * Runs the analysis pipeline against a captured photo:
 *   - darkSpots comes from the on-device YOLOv8s acne/lesion detector
 *     (a real ML model — see constants/models.ts).
 *   - texture, pores, hydration, and discoloration are computed by
 *     classical-CV pixel math (block-local luminance variance,
 *     gradient-magnitude, specular-highlight ratio, hue-variance
 *     respectively — see each file's doc comment) run against the same
 *     decoded photo, not a model. This isn't a fallback path; it's the
 *     actual method for these four conditions, because the source repo's
 *     ML models for them are either broken (missing external weight data)
 *     or produce uncalibrated output with no documented scale — see
 *     constants/models.ts for the full explanation.
 *   - overall is the average of all 5.
 *
 * The two independent things that can actually fail here (decoding the
 * photo, and the acne detector) are wrapped so one failing doesn't block
 * the other; whichever fails falls back to a flat heuristic placeholder,
 * and `source` tells the caller which case happened so the UI can say so
 * honestly instead of presenting a placeholder as a real result.
 */
export async function analyzeCapture(uri: string): Promise<AnalysisResult> {
  const [photoResult, acneResult] = await Promise.allSettled([
    resizeAndCenterCrop(uri, ANALYSIS_INPUT_SIZE, ANALYSIS_RESIZE_SHORT_SIDE),
    runAcneDetector(uri),
  ]);

  const photoOk = photoResult.status === 'fulfilled';
  const acneOk = acneResult.status === 'fulfilled';

  if (!photoOk) {
    console.warn('[analysis] photo decode failed, classical-CV signals fall back to heuristic placeholder', photoResult.reason);
  }
  if (!acneOk) {
    console.warn('[analysis] acne detector failed, falling back to heuristic placeholder', acneResult.reason);
  }

  const pixels = photoOk ? photoResult.value.data : new Uint8Array(0);
  const width = photoOk ? photoResult.value.width : 0;
  const height = photoOk ? photoResult.value.height : 0;

  const texture = scoreTexture(pixels, width, height);
  const pores = scorePores(pixels, width, height);
  const hydration = scoreHydration(pixels, width, height);
  const discoloration = scoreDiscoloration(pixels, width, height);
  const darkSpots = acneOk ? scoreFromDetections(acneResult.value) : scoreDarkSpots(new Uint8Array(0), 0, 0);

  const overall = clamp0100((darkSpots + discoloration + texture + hydration + pores) / 5);

  const source: AnalysisSource = photoOk && acneOk ? 'model' : photoOk || acneOk ? 'partial' : 'heuristic';

  const errors =
    source === 'model'
      ? undefined
      : {
          photoDecode: photoOk ? undefined : describeError(photoResult.reason),
          acne: acneOk ? undefined : describeError(acneResult.reason),
        };

  return {
    scores: { overall, darkSpots, discoloration, texture, hydration, pores },
    highlights: acneOk ? acneResult.value : undefined,
    source,
    errors,
  };
}
