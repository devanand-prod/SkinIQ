import type { Tier } from '../types/skin';

/**
 * Design tokens. These hex values must stay in sync with tailwind.config.js
 * (Tailwind's config can't import this TS module directly at build time).
 * Use these constants — not raw hex — in component styles and inline SVG,
 * where NativeWind's `className` utilities don't reach (e.g. react-native-svg
 * `stroke`/`fill` props).
 */
export const colors = {
  paper: '#F2ECE3',
  paperDeep: '#E7DECD',
  ink: '#211F1B',
  inkSoft: '#726B5D',
  accent: '#4640DE',
  accentSoft: '#E5E3FB',
  clay: '#DD8A55',
  claySoft: '#F6E2CD',
  line: '#DCD2BE',
  white: '#FFFDF8',
} as const;

export const fonts = {
  headline: 'Fraunces',
  headlineSemiBold: 'Fraunces-SemiBold',
  ui: 'SpaceGrotesk',
  uiMedium: 'SpaceGrotesk-Medium',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const tierColors: Record<Tier, { bg: string; fg: string }> = {
  good: { bg: colors.accentSoft, fg: colors.accent },
  mild: { bg: colors.paperDeep, fg: colors.inkSoft },
  attn: { bg: colors.claySoft, fg: colors.clay },
};
