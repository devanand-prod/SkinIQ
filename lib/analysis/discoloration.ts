/**
 * Discoloration / tone evenness via hue variance.
 *
 * Ported from the web prototype: convert sampled pixels' RGB to hue,
 * compute the variance of the hue channel across the region, and map that
 * variance to a 0-100 score (lower hue variance -> more even tone -> higher
 * score). Skin-tone hues cluster in a narrow range that doesn't wrap
 * around the 0/360 boundary in a normal photo, so plain (non-circular)
 * variance is fine here.
 *
 * NOTE: CEILING_VARIANCE below is a reasonable default, not calibrated
 * against labeled photos.
 */

const CEILING_VARIANCE = 400;

function rgbToHue(r: number, g: number, b: number): number {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  if (delta === 0) return 0;

  let hue: number;
  if (max === rn) hue = ((gn - bn) / delta) % 6;
  else if (max === gn) hue = (bn - rn) / delta + 2;
  else hue = (rn - gn) / delta + 4;

  hue *= 60;
  if (hue < 0) hue += 360;
  return hue;
}

export function scoreDiscoloration(pixels: Uint8Array, width: number, height: number): number {
  if (width === 0 || height === 0) return 70;

  const totalPixels = width * height;
  const hues = new Float32Array(totalPixels);

  let sum = 0;
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const h = rgbToHue(pixels[idx], pixels[idx + 1], pixels[idx + 2]);
    hues[i] = h;
    sum += h;
  }
  const mean = sum / totalPixels;

  let sqDiffSum = 0;
  for (let i = 0; i < totalPixels; i++) {
    sqDiffSum += (hues[i] - mean) ** 2;
  }
  const variance = sqDiffSum / totalPixels;

  const score = 100 - (variance / CEILING_VARIANCE) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}
