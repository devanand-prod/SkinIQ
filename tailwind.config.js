/**
 * These color/font values must stay in sync with constants/theme.ts, the
 * typed source of truth used inside components. Tailwind's config runs in
 * plain Node before the TS compiler is available, so the tokens are
 * duplicated here rather than imported.
 */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        paper: '#F2ECE3',
        'paper-deep': '#E7DECD',
        ink: '#211F1B',
        'ink-soft': '#726B5D',
        accent: '#4640DE',
        'accent-soft': '#E5E3FB',
        clay: '#DD8A55',
        'clay-soft': '#F6E2CD',
        line: '#DCD2BE',
        white: '#FFFDF8',
      },
      fontFamily: {
        headline: ['Fraunces'],
        'headline-semibold': ['Fraunces-SemiBold'],
        ui: ['SpaceGrotesk'],
        'ui-medium': ['SpaceGrotesk-Medium'],
      },
    },
  },
  plugins: [],
};
