# SkinIQ

Selfie-based skin analysis and routine app. Wellness guidance, not a medical
device — no diagnostic claims anywhere in copy or code (see
`constants/copy.ts`).

Expo (managed, TypeScript) + expo-router (file-based nav) + NativeWind. See
`constants/theme.ts` for design tokens and `types/skin.ts` for the core data
model.

## Setup

```
npm install
```

**Model weights required first** — see `assets/models/README.md`. Without
`acne_detector.onnx` in place, the app fails to bundle at all (Metro can't
resolve the `require()` in `constants/models.ts`).

**Expo Go no longer works for this app.** Adding `onnxruntime-react-native`
(a native module) means the JS-only Expo Go client can't load it — you need
a custom dev client or a full build:

```
npx expo prebuild
npx expo run:android   # or run:ios, if you have Xcode
```

or an EAS build (`npm run build:preview`).

## What's wired up

- **Navigation** — full expo-router tree: onboarding stack → capture →
  processing → tab group (Report / Routine / Progress / Scan). The Scan tab
  intercepts its own press to push the capture screen instead of rendering
  a tab.
- **Capture flow** — `app/capture.tsx` requests camera permission via
  `expo-camera`, shows a face-guide oval overlay, and takes a photo. If
  permission is denied, it falls back to an `expo-image-picker` library
  picker automatically — that fallback button is also always available
  alongside the shutter. Captured/picked photos are resized via
  `expo-image-manipulator` before being handed off.
- **Scan persistence** — `lib/storage/scanHistory.ts` reads/writes scan
  records to `AsyncStorage` so history survives app restarts (a real
  upgrade over the in-memory-only web prototype).
- **Screens** — `report.tsx` (score ring + metric bars from the latest
  scan), `routine.tsx` (focus chips + AM/PM cards + rotating tip),
  `progress.tsx` (bar chart + per-condition deltas, with a dedicated
  "one scan so far" empty state).
- **Design tokens & copy** — colors/type/spacing in `constants/theme.ts`,
  all user-facing condition/tier/routine strings centralized in
  `constants/copy.ts` so none of it is hardcoded in components.
- **Typed data model** — `types/skin.ts` (`ConditionKey`, `Tier`,
  `ScanScores`, `ScanRecord`).
- **Fonts** — real Fraunces (Regular/SemiBold) and Space Grotesk
  (Regular/Medium) `.ttf` files are included under `assets/fonts/` and
  loaded in `app/_layout.tsx` via `expo-font`, so headline/UI type actually
  renders out of the box.

## On-device analysis pipeline

Only **darkSpots** is a real ML model. The other four conditions are real
classical-CV pixel math, not a model — see "why only one model" below for
why that's the honest end state given what's actually available upstream.

- `constants/models.ts` — the acne detector's asset ref + hyperparameters
  (confidence 0.25, IoU 0.45, numClasses 1) as named constants, plus a
  detailed note on why the other signals aren't ML-based.
- `lib/analysis/imagePreprocessing.ts` — YOLO letterbox (scale-to-fit +
  mid-gray pad) for the detector; a resize+center-crop decode shared by the
  four classical-CV functions; JPEG→RGBA decode via `jpeg-js`; RGBA→CHW
  `Float32Array` packing for the detector's tensor. No Canvas/ImageData API
  in RN, so the letterbox pad is a direct buffer copy in JS onto a
  pre-filled mid-gray buffer rather than GPU compositing.
- `lib/analysis/nms.ts` — defensive sigmoid + IoU + greedy per-class NMS.
- `lib/analysis/acneDetector.ts` — the one real model runner, reading
  input/output tensor names off the session at runtime rather than
  hardcoding guessed names.
- `lib/analysis/session.ts` — caches the `InferenceSession` via
  `expo-asset`.
- `lib/analysis/texture.ts` / `pores.ts` / `hydration.ts` /
  `discoloration.ts` — real classical-CV algorithms (block-local luminance
  variance, gradient-magnitude, specular-highlight ratio, hue-variance
  respectively), each with a doc comment flagging that its score-scale
  constants are reasonable defaults, not calibrated against labeled photos.
- `lib/analysis/index.ts` — decodes the photo once, runs the four
  classical-CV functions against it and the acne detector independently
  (`Promise.allSettled` — one failing doesn't block the other), and
  returns `{ scores, highlights, source, errors }`. `source` is
  `'model' | 'partial' | 'heuristic'` depending on whether photo-decode and
  the acne detector both succeeded; `errors` carries the actual failure
  message(s) so a bad run is diagnosable from the device itself (shown in
  `report.tsx`'s banner) without needing adb/logcat.
- `components/PhotoHighlightOverlay.tsx` — draws acne/lesion detection
  boxes over the captured photo; renders nothing for `undefined` (detector
  didn't run) same as for `[]` (ran, zero boxes) — visually identical, but
  `ScanRecord.highlights` keeps the two states distinguishable in the data.

### Why only one model — what actually happened wiring this up

This was built through several real EAS builds installed on a physical
Android device, not just static review. In order, what broke and what the
device logs actually said:

1. **`android.minSdkVersion` in `app.json` was silently ignored.** Gradle
   failed at the manifest-merger step: `onnxruntime-android:1.29.0`
   requires minSdk 24, but the generated project was still at 23. That
   `app.json` field is deprecated in current Expo prebuild — fixed via the
   `expo-build-properties` config plugin instead.
2. **The combined `skin_signals.onnx` doesn't load at all.** The real
   device error: `External data path validation failed for initializer:
   backbone.conv_stem.weight ... does not exist:
   ".../skin_signals.onnx.data"`. Inspecting the file's raw protobuf bytes
   confirmed one initializer was exported with external data whose
   companion file was never published to the Hugging Face repo — this
   model can never load for anyone, not just us.
3. **The acne detector's real output shape is `[1, 5, 8400]`**, not the
   assumed `[1, 8, 8400]` — meaning 1 class, not 4. Fixed
   `numClasses: 4 → 1`.
4. **Investigated whether the repo's separate `structure_model.onnx` could
   replace the broken combined model.** It loads fine, but running it (via
   `onnxruntime-node`, with synthetic inputs) produced raw, unbounded
   outputs (-25 to +245, no [0,1] range) with no documented scale —
   unusable as a score without invented calibration.
   `hydration_model.onnx`/`elasticity_model.onnx` additionally need an
   undocumented "handcrafted_features" input. None of the three were used.
5. Given (2) and (4), `texture`/`pores`/`hydration`/`discoloration` were
   reimplemented as classical-CV (the original web prototype's actual
   algorithms), since that's real and honest where an uncalibrated or
   broken model would not be.

### What's verified, and how

- **Types**: `npx tsc --noEmit` passes cleanly at every step.
- **Bundling**: `npx expo export` resolves the full dependency graph.
- **Native linking**: `npx expo prebuild` + `npx react-native config` show
  `onnxruntime-react-native` correctly autolinked.
- **API surface**: matched every call site against the actual installed
  `.d.ts` files, not memory.
- **Pipeline math, numerically**: NMS/sigmoid, letterbox scale/pad/box-remap
  round-tripping, RGBA→CHW packing, and all four classical-CV functions
  were run against synthetic test buffers with known expected results
  (uniform images → 100, high-frequency/noisy synthetic images → clamped
  low) using the actual source files under Node
  (`--experimental-strip-types`), not reimplementations. This caught two
  real bugs before they ever reached a device: a base64 decoder bit-shift
  error (`c >> 6` instead of `c >> 2`, silently corrupting ~1/3 of decoded
  bytes) and the acne detector's class-count assumption.
- **On-device, for real**: multiple full EAS builds installed on a
  physical Android device, iterating against actual runtime errors (not
  simulated) until the pipeline ran end-to-end.

### Still open

- The classical-CV score-scale constants (e.g. hydration's specular-ratio
  ceiling, texture's block-variance ceiling) are reasonable defaults, not
  calibrated against any labeled dataset — expect them to need tuning once
  tested against a range of real photos.
- No labeled test set exists to validate the acne detector's real
  precision/recall, or whether its raw scores are pre- or post-sigmoid in
  practice (handled defensively either way, but unconfirmed).
- End-to-end performance (a 43MB model load + 640x640 tensor packing) on
  lower-end devices hasn't been profiled.

## What's still just placeholder copy

- **Routine content** — `generateRoutine.ts` logic (picking the two
  lowest-scoring conditions, rotating a tip) is real, but the AM/PM steps
  and tip copy in `constants/copy.ts` are placeholder text, not sourced
  product/ingredient data.
- **Icons/branding** — `TabIcon` in `app/(tabs)/_layout.tsx` renders text
  glyphs as a placeholder; swap for real `react-native-svg` icons.
  `welcome.tsx`'s hero illustration and the face-map graphic mentioned in
  the brief are also unbuilt placeholders (see inline `TODO`s).
- **Processing animation** — `processing.tsx` cycles static status text on
  an interval; no real loading animation yet.

## Before this runs on a device

- **App icons/splash** — done. `assets/icons/icon.png`, `adaptive-icon.png`,
  and `splash.png` are simple generated placeholders (an accent-colored
  mark), not final branding — swap them for real assets whenever ready.
- **Model weights** — done, `acne_detector.onnx` is committed (see
  `assets/models/README.md`).
- **Bundle identifiers / EAS project ID** — done (`com.devanand.skiniq`,
  real project ID set in `app.json`).
- **Camera/photo permissions** — already filled in and should work as-is:
  - iOS: `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`,
    `NSPhotoLibraryAddUsageDescription` in `app.json`'s `ios.infoPlist`.
  - Android: `CAMERA`, `READ_EXTERNAL_STORAGE`, `READ_MEDIA_IMAGES` in
    `android.permissions`, plus the `expo-camera` / `expo-image-picker`
    config plugins (which also inject their own permission strings).
  Double-check the copy in those descriptions matches your actual App
  Store / Play Store listing before submitting.
- **NativeWind/Tailwind tokens** — `tailwind.config.js` duplicates the hex
  values from `constants/theme.ts` (Tailwind's config runs before
  TypeScript is available, so it can't import that file directly). If you
  change a token, update both places.
