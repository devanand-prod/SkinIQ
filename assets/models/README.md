# Model weights (not committed to this placeholder state)

This directory needs two files before the app will run real inference:

- `skin_signals.onnx` — EfficientNet-B0, ~0.6MB
  https://huggingface.co/mufasabrownie/glowlytics-skin-models/resolve/main/skin_signals.onnx
- `acne_detector.onnx` — YOLOv8s, ~43MB
  https://huggingface.co/mufasabrownie/glowlytics-skin-models/resolve/main/acne_detector.onnx

Both are MIT-licensed. Download them and place them here with those exact
filenames — `constants/models.ts` references them by static `require()`
path, which Metro needs to resolve at bundle time. Without these two files,
`expo export` / `expo prebuild` / `eas build` will fail to bundle.

Once they're here, `lib/analysis/skinSignals.ts` and
`lib/analysis/acneDetector.ts` will pick them up automatically — no code
changes needed.
