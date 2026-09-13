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
npx expo start
```

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

## What's stubbed

- **`lib/analysis/*.ts`** — the actual pixel math. Each file
  (`texture.ts`, `darkSpots.ts`, `discoloration.ts`, `hydration.ts`,
  `pores.ts`) has the ported function signature and a `// TODO` explaining
  *why*: React Native has no Canvas/`ImageData` API like the web prototype
  used, so there's no way yet to turn a captured photo into a raw pixel
  buffer. Each stub currently returns a flat placeholder score (`70`).
  Before real scoring can happen, `lib/analysis/index.ts`'s `analyzeCapture`
  needs a decode step — pick one of:
  - `expo-gl` (render the photo into an offscreen GL context, `readPixels`)
  - a JPEG-decode library (e.g. `jpeg-js`) run against file bytes from
    `expo-file-system`
  - a small native module that returns decoded pixel data to JS

  Once `{ pixels, width, height }` is real, port each condition's specific
  math from the web prototype (documented per-file: block-local luminance
  variance for texture, high-pass thresholding for dark spots, hue-variance
  for discoloration, specular-highlight ratio for hydration,
  gradient-magnitude for pores).
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

- **App icons/splash** — `app.json` points at
  `assets/icons/icon.png`, `adaptive-icon.png`, and `splash.png`, none of
  which exist yet (only a `.gitkeep` is there). Add real image assets at
  those paths before running `expo prebuild` / building — Expo Go will
  mostly tolerate missing icons for local dev, but a real build won't.
- **Bundle identifiers** — `app.json`'s `ios.bundleIdentifier` and
  `android.package` are both placeholder (`com.yourcompany.skiniq`).
  Change before building for a device or app store.
- **EAS project ID** — `extra.eas.projectId` is a placeholder; set it if
  you plan to use EAS Build.
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
