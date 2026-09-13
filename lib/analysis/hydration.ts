/**
 * Hydration (surface moisture proxy).
 *
 * Ported (structure only) from the web prototype's specular-highlight ratio
 * method: count near-white specular highlight pixels (a rough proxy for
 * skin surface reflectivity/oiliness vs. dryness) as a proportion of the
 * sampled region, and map that ratio to a 0-100 score.
 *
 * TODO: same RN Canvas/ImageData limitation as lib/analysis/texture.ts —
 * see that file's TODO for the decode options (expo-gl / JPEG-decode
 * library / native module) needed before `pixels` is real data. Once it is,
 * port the prototype's specular-highlight ratio loop into this function.
 */
export function scoreHydration(pixels: Uint8Array, width: number, height: number): number {
  // Stub: no real pixel analysis yet. Neutral placeholder score.
  return 70;
}
