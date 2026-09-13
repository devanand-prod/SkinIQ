import type { AnalysisSource, ConditionKey, Tier } from '../types/skin';

export const APP_NAME = 'SkinIQ';

/**
 * Wellness framing, not medical framing. Avoid words like "diagnose",
 * "detect disease", or "treat" anywhere in this file — SkinIQ offers general
 * skincare guidance, it is not a diagnostic or medical device.
 */
export const disclaimer = {
  short: 'General skincare guidance, not a medical diagnosis.',
  long: 'SkinIQ looks at a selfie photo to offer general skincare guidance based on visual patterns. It is a wellness tool, not a medical device, and it does not diagnose or treat any skin condition. If you have a health concern about your skin, talk to a dermatologist.',
};

export const conditionLabels: Record<ConditionKey, string> = {
  darkSpots: 'Dark Spots',
  discoloration: 'Discoloration',
  texture: 'Texture & Tone',
  hydration: 'Hydration',
  pores: 'Pores',
};

export const conditionDescriptions: Record<ConditionKey, string> = {
  darkSpots: 'Areas of visible spotting picked up from local contrast in the photo.',
  discoloration: 'How even your skin tone looks across the visible hue range.',
  texture: 'How smooth and consistent the skin surface looks.',
  hydration: 'A rough read on surface moisture, estimated from highlight patterns.',
  pores: 'How visible pore size and density appear in the photo.',
};

export const tierCopy: Record<ConditionKey, Record<Tier, string>> = {
  darkSpots: {
    good: 'Dark spots are minimal right now. Daily SPF is the best way to keep it that way.',
    mild: 'A few spots are visible. A brightening ingredient like vitamin C could help even things out.',
    attn: 'Several spots stood out in this scan. Consistent SPF plus a targeted brightening step may help over time.',
  },
  discoloration: {
    good: 'Tone looks pretty even overall.',
    mild: 'Some unevenness is visible. A gentle exfoliant a few times a week may help smooth things out.',
    attn: 'Noticeable unevenness in this scan. Consider easing in a brightening or exfoliating step, and always follow with SPF.',
  },
  texture: {
    good: 'Texture looks smooth in this scan.',
    mild: 'Some roughness is visible. A gentle chemical exfoliant can help refine texture over time.',
    attn: 'Texture looks uneven in this scan. Introduce exfoliation slowly and keep the rest of the routine gentle.',
  },
  hydration: {
    good: 'Skin looks well hydrated.',
    mild: 'Hydration looks a little low. Try layering a hydrating serum under your moisturizer.',
    attn: 'This scan suggests low surface hydration. A richer moisturizer and a hydrating serum may help.',
  },
  pores: {
    good: 'Pores look refined in this scan.',
    mild: 'Some visible pores. A gentle clay mask once a week can help.',
    attn: 'Pores are more visible in this scan. Regular gentle exfoliation and non-comedogenic products may help.',
  },
};

export const amRoutineSteps: string[] = [
  'Gentle cleanser',
  'Antioxidant serum (e.g. vitamin C)',
  'Moisturizer',
  'Broad-spectrum SPF 30+',
];

export const pmRoutineSteps: string[] = [
  'Oil or balm cleanse',
  'Water-based cleanser',
  'Treatment serum (matched to your focus areas)',
  'Night moisturizer',
];

/** Rotated through by lib/routine/generateRoutine.ts for the "one small habit" tip. */
export const routineTips: string[] = [
  'Apply SPF every morning, even on cloudy days — it is the single highest-impact habit for most of these conditions.',
  'Double cleanse at night to fully remove sunscreen and makeup before treatment steps.',
  'Introduce one new active ingredient at a time and wait about a week before adding another.',
  'Pat a hydrating toner or essence into damp skin so it absorbs before your moisturizer.',
  'Change your pillowcase weekly to cut down on overnight buildup against your skin.',
];

/** Shown as a banner on the report screen so a fallback never gets
 * presented as if it were a real analysis. */
export const analysisSourceCopy: Record<AnalysisSource, string | null> = {
  model: null,
  partial: 'Partial analysis — one signal could not be read from this photo, so it is estimated.',
  heuristic: 'These are placeholder results — on-device analysis was unavailable for this scan.',
};

export interface ConsentItem {
  id: string;
  label: string;
}

export const consentItems: ConsentItem[] = [
  { id: 'age', label: 'I am 18 years of age or older.' },
  {
    id: 'guidance',
    label: 'I understand SkinIQ provides general skincare guidance, not a medical diagnosis.',
  },
];
