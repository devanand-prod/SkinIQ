/**
 * Pore visibility.
 *
 * Ported (structure only) from the web prototype's gradient-magnitude
 * method: run a Sobel-style gradient filter over the luminance channel to
 * pick up small, high-frequency dark dots (pores), then map the density of
 * flagged pixels to a 0-100 score (lower density -> less visible pores ->
 * higher score).
 *
 * TODO: same RN Canvas/ImageData limitation as lib/analysis/texture.ts —
 * see that file's TODO for the decode options (expo-gl / JPEG-decode
 * library / native module) needed before `pixels` is real data. Once it is,
 * port the prototype's gradient-magnitude loop into this function.
 */
export function scorePores(pixels: Uint8Array, width: number, height: number): number {
  // Stub: no real pixel analysis yet. Neutral placeholder score.
  return 70;
}
