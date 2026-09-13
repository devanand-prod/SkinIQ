/**
 * Discoloration / tone evenness.
 *
 * Ported (structure only) from the web prototype's hue-variance method:
 * convert sampled pixels to HSV, compute the variance of the hue channel
 * across the face region, and map that variance to a 0-100 score (lower hue
 * variance -> more even tone -> higher score).
 *
 * TODO: same RN Canvas/ImageData limitation as lib/analysis/texture.ts —
 * see that file's TODO for the decode options (expo-gl / JPEG-decode
 * library / native module) needed before `pixels` is real data. Once it is,
 * port the prototype's RGB->HSV conversion + hue-variance loop into this
 * function.
 */
export function scoreDiscoloration(pixels: Uint8Array, width: number, height: number): number {
  // Stub: no real pixel analysis yet. Neutral placeholder score.
  return 70;
}
