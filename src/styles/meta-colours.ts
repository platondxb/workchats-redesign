/**
 * Colours for places that can't read the CSS tokens: the browser's theme-color meta tag. `night` mirrors
 * --color-night in tokens.css and `day` the same token on the light theme; scripts/check-tokens.mjs allows
 * literal colours in this file only (with the link preview image), so a second copy can't drift in
 * somewhere else.
 */
export const metaColours = {
  night: "#0b1220",
  day: "#f5f8fc",
} as const;
