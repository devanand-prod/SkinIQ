/**
 * Texture & tone evenness.
 *
 * Ported (structure only) from the web prototype's block-local luminance
 * variance method: divide the frame into fixed-size blocks, compute
 * luminance variance within each block, then map the aggregate variance to
 * a 0-100 score (lower variance -> smoother texture -> higher score).
 *
 * TODO: React Native has no built-in Canvas/ImageData API, so there is no
 * direct equivalent of the web prototype's `getImageData()` yet. Before the
 * block-variance math below can run on a real photo, `pixels` needs to be a
 * real RGBA byte buffer decoded from the captured JPEG via one of:
 *   - expo-gl (render to an offscreen GL context and `readPixels`), or
 *   - a JPEG-decoding library (e.g. jpeg-js) run against the file bytes, or
 *   - a small native module that exposes decoded pixel data to JS.
 * Once that exists, port the actual block-variance loop from the prototype
 * into this function.
 */
export function scoreTexture(pixels: Uint8Array, width: number, height: number): number {
  // Stub: no real pixel analysis yet. Neutral placeholder score.
  return 70;
}
