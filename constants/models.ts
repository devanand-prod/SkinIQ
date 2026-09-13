/**
 * Model assets and their fixed hyperparameters. Both models are from
 * https://huggingface.co/mufasabrownie/glowlytics-skin-models (MIT licensed).
 *
 * These are static `require()`s — Metro needs the referenced files to exist
 * on disk at bundle time (registered as bundleable assets via
 * `resolver.assetExts` in metro.config.js and `assetBundlePatterns` in
 * app.json). See assets/models/README.md for how to get the real weights;
 * until they're in place, anything that imports this module will fail to
 * bundle.
 */
export const SKIN_SIGNALS_MODEL_ASSET = require('../assets/models/skin_signals.onnx');
export const ACNE_DETECTOR_MODEL_ASSET = require('../assets/models/acne_detector.onnx');

/**
 * EfficientNet-B0 skin-signals model. Input: RGB 224x224, ImageNet-normalized.
 * Preprocessing: resize short side to `resizeShortSide`, then center-crop to
 * `inputSize` x `inputSize`, then per-channel (value/255 - mean) / std.
 * Output: 4 floats in [0,1], in `outputOrder`.
 */
export const SKIN_SIGNALS_CONFIG = {
  inputSize: 224,
  resizeShortSide: 256,
  mean: [0.485, 0.456, 0.406] as [number, number, number],
  std: [0.229, 0.224, 0.225] as [number, number, number],
  outputOrder: ['structure', 'hydration', 'sunDamage', 'elasticity'] as const,
};

export type SkinSignalKey = (typeof SKIN_SIGNALS_CONFIG.outputOrder)[number];

/**
 * YOLOv8s acne/lesion detector. Input: RGB 640x640, plain 0-1 scaled (no
 * mean/std), letterboxed (scale-to-fit + pad with mid-gray) rather than
 * stretched, to match how the model was trained.
 */
export const ACNE_DETECTOR_CONFIG = {
  inputSize: 640,
  numClasses: 4,
  confidenceThreshold: 0.25,
  iouThreshold: 0.45,
  letterboxPadColor: { r: 114, g: 114, b: 114 },
};

/**
 * How the model's 4 raw signals + acne detections map onto our 5 UI
 * conditions. This is a deliberate many-to-one mapping, not a 1:1 model
 * output — texture and pores both read the model's single "structure"
 * signal (it bundles pore visibility and texture uniformity together),
 * and darkSpots is derived from acne/lesion box count + confidence rather
 * than a dedicated signal. Ported as-is from the web prototype.
 */
export const CONDITION_MAPPING_NOTE =
  'darkSpots <- acne detector boxes; discoloration <- sunDamage; ' +
  'texture <- structure; pores <- structure (same signal, reused); ' +
  'hydration <- hydration; overall <- average of the 5 above.';
