/**
 * Texture & tone evenness via block-local luminance variance.
 *
 * Ported from the web prototype: divide the frame into fixed-size blocks,
 * compute luminance variance *within* each block, then average those
 * per-block variances (not one whole-image variance — that would conflate
 * broad lighting/shading gradients with actual fine texture roughness).
 * Lower average local variance -> smoother texture -> higher score.
 *
 * NOTE: CEILING_VARIANCE below is a reasonable default, not calibrated
 * against labeled photos — there's no ground-truth dataset available to
 * tune it against. Expect to adjust after testing against real scans.
 */

const BLOCK_SIZE = 16;
const CEILING_VARIANCE = 300;

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function scoreTexture(pixels: Uint8Array, width: number, height: number): number {
  if (width === 0 || height === 0) return 70;

  let varianceSum = 0;
  let blockCount = 0;

  for (let by = 0; by < height; by += BLOCK_SIZE) {
    for (let bx = 0; bx < width; bx += BLOCK_SIZE) {
      const blockWidth = Math.min(BLOCK_SIZE, width - bx);
      const blockHeight = Math.min(BLOCK_SIZE, height - by);
      const count = blockWidth * blockHeight;

      let sum = 0;
      for (let y = by; y < by + blockHeight; y++) {
        for (let x = bx; x < bx + blockWidth; x++) {
          const idx = (y * width + x) * 4;
          sum += luminance(pixels[idx], pixels[idx + 1], pixels[idx + 2]);
        }
      }
      const mean = sum / count;

      let sqDiffSum = 0;
      for (let y = by; y < by + blockHeight; y++) {
        for (let x = bx; x < bx + blockWidth; x++) {
          const idx = (y * width + x) * 4;
          const l = luminance(pixels[idx], pixels[idx + 1], pixels[idx + 2]);
          sqDiffSum += (l - mean) ** 2;
        }
      }

      varianceSum += sqDiffSum / count;
      blockCount++;
    }
  }

  const avgVariance = varianceSum / blockCount;
  const score = 100 - (avgVariance / CEILING_VARIANCE) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}
