/**
 * Hydration (surface moisture proxy) via specular-highlight ratio.
 *
 * Ported from the web prototype: count near-white, low-saturation
 * "specular highlight" pixels (a rough proxy for skin surface reflectivity)
 * as a proportion of the sampled region, and map that ratio to a 0-100
 * score. Low-saturation is required alongside brightness so that colored
 * bright regions (e.g. red lips catching light) aren't counted the same as
 * a moisture highlight on skin.
 *
 * NOTE: BRIGHTNESS_THRESHOLD / SATURATION_THRESHOLD / CEILING_RATIO below
 * are reasonable defaults, not calibrated against labeled photos.
 */

const BRIGHTNESS_THRESHOLD = 200;
const SATURATION_THRESHOLD = 30;
const CEILING_RATIO = 0.08;

export function scoreHydration(pixels: Uint8Array, width: number, height: number): number {
  if (width === 0 || height === 0) return 70;

  const totalPixels = width * height;
  let specularCount = 0;

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];

    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);

    if (min > BRIGHTNESS_THRESHOLD && max - min < SATURATION_THRESHOLD) {
      specularCount++;
    }
  }

  const ratio = specularCount / totalPixels;
  const score = (ratio / CEILING_RATIO) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}
