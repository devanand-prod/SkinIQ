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
`skin_signals.onnx` and `acne_detector.onnx` in place, the app fails to
bundle at all (Metro can't resolve the `require()`s in `constants/models.ts`).

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

## On-device model pipeline (new)

Real inference replaces the old flat-70 stub, split across:

- `constants/models.ts` — model asset refs + fixed hyperparameters
  (input sizes, ImageNet mean/std, confidence 0.25, IoU 0.45) as named
  constants, plus the condition-mapping note (see below).
- `lib/analysis/imagePreprocessing.ts` — resize-short-side + center-crop
  for the signals model; YOLO letterbox (scale-to-fit + mid-gray pad) for
  the detector; JPEG→RGBA decode via `jpeg-js`; RGBA→CHW `Float32Array`
  packing. There's no Canvas/ImageData API in RN, so the letterbox pad is
  done as a direct buffer copy in JS (onto a pre-filled mid-gray buffer)
  rather than via GPU compositing — `expo-gl` is still a dependency per the
  task brief, but this pipeline doesn't end up calling it, since the buffer
  copy is simpler and equally correct at 640x640.
- `lib/analysis/nms.ts` — defensive sigmoid + IoU + greedy per-class NMS.
- `lib/analysis/skinSignals.ts` / `acneDetector.ts` — the two model runners,
  reading input/output tensor names off the session at runtime rather than
  hardcoding guessed names (we don't have the real model files to inspect).
- `lib/analysis/session.ts` — caches one `InferenceSession` per model via
  `expo-asset`.
- `lib/analysis/index.ts` — orchestrates both models independently
  (`Promise.allSettled`, one failing doesn't block the other), maps their
  output onto the 5 UI conditions, and returns
  `{ scores, highlights, source }` where `source` is `'model' | 'partial' |
  'heuristic'` depending on which models actually ran. `report.tsx` shows a
  banner (copy in `constants/copy.ts`'s `analysisSourceCopy`) whenever it's
  not `'model'`, so a fallback is never presented as a real analysis.
- `components/PhotoHighlightOverlay.tsx` (new) — draws acne/lesion detection
  boxes over the captured photo on the report screen; renders nothing for
  `undefined` (detector didn't run) same as for `[]` (ran, zero boxes) —
  visually identical, but `report.tsx` and `ScanRecord.highlights` keep the
  two states distinguishable in the data itself.
- **Condition mapping is many-to-one, not 1:1** (documented in
  `constants/models.ts` and `lib/analysis/index.ts`): `darkSpots` comes from
  the acne detector's box count/confidence; `discoloration` from
  `sunDamage`; `texture` **and** `pores` both read the same `structure`
  signal (the model bundles them together); `hydration` is its own signal;
  `overall` averages all 5.
- The original heuristic stubs (`texture.ts`, `darkSpots.ts`,
  `discoloration.ts`, `hydration.ts`, `pores.ts`, all still flat `70`) are
  kept as-is and now serve as the fallback path when a model fails —
  they're what `source: 'heuristic'` or `'partial'` actually falls back to.

### What's verified vs. what isn't

**I could not run any of this on a device or emulator in this session** —
this sandboxed environment has no Android SDK, no `adb`, and no Xcode/iOS
simulator (confirmed by actually running `expo run:android`, not assumed:
it failed on `Failed to resolve the Android SDK path` / `spawn adb ENOENT`).
It also has no network access to huggingface.co (org egress policy, a `403`
confirmed via the proxy status, not a transient error), so the real model
files were never available in this session either — `assets/models/` only
has a README telling you where to get them.

What I *did* verify, and how:
- **Types**: `npx tsc --noEmit` passes cleanly with zero errors against the
  full new pipeline.
- **Bundling**: `npx expo export` gets through Metro dependency resolution
  for all 1145 modules and fails at exactly one place — the two missing
  `.onnx` `require()`s in `constants/models.ts` — confirming everything
  else (new deps, new files, `metro.config.js`'s added `onnx` asset
  extension) resolves correctly.
- **Native linking**: `npx expo prebuild` succeeds and `npx react-native
  config` shows `onnxruntime-react-native` correctly autolinked (iOS
  podspec + Android) — not just "added to package.json".
- **API surface**: I read the actual installed `.d.ts` files for
  `onnxruntime-react-native`/`onnxruntime-common`, `expo-asset`,
  `expo-file-system`, `expo-image-manipulator`, and `jpeg-js` in
  `node_modules` rather than assuming their signatures from memory, and
  matched every call site to them.
- **Pipeline math, numerically**: since the RN-native pieces (file system,
  image manipulator) can't run under plain Node, I extracted and ran the
  *actual* pure-logic functions from the real source files (not
  reimplementations) under Node with `--experimental-strip-types`:
  - NMS/sigmoid against synthetic overlapping boxes — correct suppression,
    correct per-class independence.
  - Letterbox scale/pad/box-remap math — a full-frame box round-trips to
    exactly `[0,0,1,1]`; an off-center box lands where hand-calculated.
  - RGBA→CHW packing, plain and ImageNet-normalized — matches hand-computed
    values.
  - **This caught a real bug**: my hand-rolled base64 decoder (written to
    avoid a dependency, since Hermes doesn't reliably have `atob`/`Buffer`)
    had `c >> 6` instead of `c >> 2` for the middle byte of each 4-character
    group — it silently dropped 2 bits from roughly every third decoded
    byte. Every JPEG this touched would have decoded as visual garbage.
    Fixed and re-verified against `Buffer`-based ground truth across 8
    lengths including padding edge cases.

What is **implemented but genuinely unverified**, because none of it can
run without a device/emulator and the real model files:
- Whether `onnxruntime-react-native`'s actual native inference call behaves
  as the type signatures suggest at runtime.
- The two models' real input/output tensor names, dims, and whether
  `dims[1]`/`dims[2]` detection correctly identifies the acne detector's
  actual export layout (`[1, attrs, N]` vs `[1, N, attrs]`) — I don't have
  the file to inspect.
- Whether the acne detector's raw output values are pre- or
  post-sigmoid in practice (handled defensively, but untested against the
  real model).
- End-to-end timing/memory on an actual phone (a 43MB YOLOv8s model plus a
  640x640 JS-side letterbox buffer copy could be slow on lower-end
  hardware — nothing in this pipeline was profiled).

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
- **Model weights** — not done, see above and `assets/models/README.md`.
  This blocks bundling entirely, not just inference quality.
- **Bundle identifiers** — `app.json`'s `ios.bundleIdentifier` and
  `android.package` are both placeholder (`com.yourcompany.skiniq`).
  Change before building for a device or app store.
- **EAS project ID** — set via `eas init --id <id>` already if you've run
  that; if `extra.eas.projectId` in `app.json` still says
  `YOUR_EAS_PROJECT_ID`, run it before `eas build`.
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
