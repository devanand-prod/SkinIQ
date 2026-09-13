/**
 * Dark spot visibility.
 *
 * Ported (structure only) from the web prototype's high-pass thresholding
 * method: run a high-pass filter over the luminance channel to isolate
 * localized dark regions, threshold the result, and map the proportion of
 * flagged pixels to a 0-100 score (fewer/smaller flagged regions -> higher
 * score).
 *
 * TODO: same RN Canvas/ImageData limitation as lib/analysis/texture.ts —
 * see that file's TODO for the decode options (expo-gl / JPEG-decode
 * library / native module) needed before `pixels` is real data. Once it is,
 * port the prototype's high-pass + threshold loop into this function.
 */
export function scoreDarkSpots(pixels: Uint8Array, width: number, height: number): number {
  // Stub: no real pixel analysis yet. Neutral placeholder score.
  return 70;
}
