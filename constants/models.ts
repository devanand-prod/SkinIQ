/**
 * The acne/lesion detector model asset and its fixed hyperparameters.
 * From https://huggingface.co/mufasabrownie/glowlytics-skin-models (MIT
 * licensed).
 *
 * This is a static `require()` — Metro needs the referenced file to exist
 * on disk at bundle time (registered as a bundleable asset via
 * `resolver.assetExts` in metro.config.js and `assetBundlePatterns` in
 * app.json). See assets/models/README.md.
 *
 * The repo's combined "skin_signals.onnx" (structure/hydration/sunDamage/
 * elasticity in one export) was tried and dropped: it references external
 * weight data that was never published alongside it (confirmed by
 * inspecting the file's raw bytes — one initializer, backbone.conv_stem
 * .weight, points at a companion "skin_signals.onnx.data" file that
 * doesn't exist in the HF repo, so the model can never load). The repo's
 * separate structure_model.onnx loads fine but its outputs are raw,
 * uncalibrated regression values (tested with onnxruntime-node against
 * synthetic inputs: results ranged from -25 to +245 with no documented
 * scale) — not usable as a 0-100 score without real ground truth to
 * calibrate against. hydration_model.onnx additionally requires an
 * undocumented 44-dimensional "handcrafted_features" input we have no spec
 * for. So texture, pores, hydration, and discoloration are all computed by
 * the classical-CV heuristics in texture.ts / pores.ts / hydration.ts /
 * discoloration.ts instead (real per-photo pixel math, not a model, but
 * also not a flat placeholder) — see each file's own doc comment.
 */
export const ACNE_DETECTOR_MODEL_ASSET = require('../assets/models/acne_detector.onnx');

/**
 * YOLOv8s acne/lesion detector. Input: RGB 640x640, plain 0-1 scaled (no
 * mean/std), letterboxed (scale-to-fit + pad with mid-gray) rather than
 * stretched, to match how the model was trained.
 *
 * numClasses is 1, not 4 as originally assumed — confirmed from the real
 * model's output shape [1, 5, 8400] (4 box coords + 1 class score), not
 * inspectable ahead of time since we didn't have the file at design time.
 */
export const ACNE_DETECTOR_CONFIG = {
  inputSize: 640,
  numClasses: 1,
  confidenceThreshold: 0.25,
  iouThreshold: 0.45,
  letterboxPadColor: { r: 114, g: 114, b: 114 },
};
