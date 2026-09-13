# Model weights

Only one model is used now:

- `acne_detector.onnx` — YOLOv8s, ~43MB (numClasses=1, confirmed from the
  real output shape [1,5,8400])

Source (MIT-licensed): https://huggingface.co/mufasabrownie/glowlytics-skin-models

Re-download if needed:
```
curl -L -o acne_detector.onnx https://huggingface.co/mufasabrownie/glowlytics-skin-models/resolve/main/acne_detector.onnx
```

## Why there's only one model here

The repo's combined `skin_signals.onnx` (structure/hydration/sunDamage/
elasticity in one export) is broken as published — it references external
weight data (`skin_signals.onnx.data`) that was never uploaded to the repo,
confirmed by inspecting the file's raw protobuf bytes. Without it, ONNX
Runtime can't load the model at all (fails on the very first conv layer).

The repo's separate `structure_model.onnx` loads and runs fine, but its
outputs (`pore_count`, `texture_regularity`, `structure_score`) are raw,
uncalibrated regression values with no documented scale — tested with
`onnxruntime-node` against synthetic inputs and got results ranging from
-25 to +245. Using them as a 0-100 score would mean inventing a
calibration with no ground truth to check it against.

`hydration_model.onnx` and `elasticity_model.onnx` additionally require an
undocumented "handcrafted_features" input (44-dim and 14-dim respectively)
with no spec for what those features are.

So `texture`, `pores`, `hydration`, and `discoloration` are computed by
classical-CV pixel math instead (see the doc comments in
`lib/analysis/texture.ts`, `pores.ts`, `hydration.ts`, `discoloration.ts`) —
real per-photo computation, just not a trained model. Only `darkSpots`
(via the acne detector) is ML-based.
