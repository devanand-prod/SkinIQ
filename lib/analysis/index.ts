import type { ScanScores } from '../../types/skin';
import { scoreDarkSpots } from './darkSpots';
import { scoreDiscoloration } from './discoloration';
import { scoreHydration } from './hydration';
import { scorePores } from './pores';
import { scoreTexture } from './texture';

/**
 * Runs the on-device analysis pipeline against a captured photo and returns
 * per-condition scores plus an overall average.
 *
 * TODO: this currently stubs out image decoding entirely. React Native has
 * no native Canvas/ImageData API (unlike the web prototype this was ported
 * from), so `uri` is never actually turned into pixel data below. Before
 * this can produce real scores, wire up one of: expo-gl (offscreen render +
 * readPixels), a JPEG-decode library (e.g. jpeg-js) run against the file
 * bytes from expo-file-system, or a native module — then feed the resulting
 * { pixels, width, height } into the score* functions in this directory
 * (each has its own TODO on the specific math to port from the prototype).
 */
export async function analyzeCapture(uri: string): Promise<ScanScores> {
  const pixels = new Uint8Array(0);
  const width = 0;
  const height = 0;

  const darkSpots = scoreDarkSpots(pixels, width, height);
  const discoloration = scoreDiscoloration(pixels, width, height);
  const texture = scoreTexture(pixels, width, height);
  const hydration = scoreHydration(pixels, width, height);
  const pores = scorePores(pixels, width, height);

  const overall = Math.round((darkSpots + discoloration + texture + hydration + pores) / 5);

  return { overall, darkSpots, discoloration, texture, hydration, pores };
}
