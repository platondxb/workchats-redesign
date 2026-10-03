/**
 * Colours for places that can't read the CSS tokens: the browser's theme-color meta tag. Mirrors
 * --color-night in tokens.css; scripts/check-tokens.mjs allows literal colours in this file only (with the
 * link preview image), so a second copy can't drift in somewhere else.
 */
export const metaColours = {
  night: "#0b1220",
} as const;
