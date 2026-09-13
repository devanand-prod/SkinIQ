/**
 * Pore visibility via gradient-magnitude.
 *
 * Ported from the web prototype: run a Sobel gradient filter over the
 * luminance channel to pick up small, high-frequency detail (pores show up
 * as dense small dark dots), then map the density of high-gradient pixels
 * to a 0-100 score (lower density -> less visible pores -> higher score).
 *
 * NOTE: GRADIENT_THRESHOLD / CEILING_DENSITY below are reasonable defaults,
 * not calibrated against labeled photos.
 */

const GRADIENT_THRESHOLD = 40;
const CEILING_DENSITY = 0.12;

export function scorePores(pixels: Uint8Array, width: number, height: number): number {
  if (width === 0 || height === 0) return 70;

  // Precompute luminance once so the Sobel convolution isn't recomputing it
  // 6-8x per pixel.
  const luminance = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    luminance[i] = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
  }

  let highFrequencyCount = 0;
  let sampledCount = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const tl = luminance[(y - 1) * width + (x - 1)];
      const t = luminance[(y - 1) * width + x];
      const tr = luminance[(y - 1) * width + (x + 1)];
      const l = luminance[y * width + (x - 1)];
      const r = luminance[y * width + (x + 1)];
      const bl = luminance[(y + 1) * width + (x - 1)];
      const b = luminance[(y + 1) * width + x];
      const br = luminance[(y + 1) * width + (x + 1)];

      const gx = tr + 2 * r + br - (tl + 2 * l + bl);
      const gy = bl + 2 * b + br - (tl + 2 * t + tr);
      const magnitude = Math.sqrt(gx * gx + gy * gy);

      if (magnitude > GRADIENT_THRESHOLD) highFrequencyCount++;
      sampledCount++;
    }
  }

  const density = sampledCount === 0 ? 0 : highFrequencyCount / sampledCount;
  const score = 100 - (density / CEILING_DENSITY) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}
