import { cx } from "@/lib/cx";

/*
 * The liquid glass button's classes, in a module with no JSX so client components (the consent banner)
 * can use the same look without pulling the server-rendered button or its SVG filter into the browser.
 * See liquid-glass-button.tsx for where the design comes from and how it was adapted.
 *
 * States: hover (lifts on a spring, the primary glows), focus-visible (the global ring), active (presses
 * in), disabled, and loading (aria-busy). Every size is at least 44px tall.
 */

export type LiquidTone = "primary" | "glass" | "shiny";
export type LiquidSize = "sm" | "md" | "lg" | "icon";

const toneClasses: Record<LiquidTone, string> = {
  // The main action: the glass tone's construction (a translucent fill and the same rim), tinted blue. On the
  // dark page the tint is brand blue at 75%, see-through and still vivid over the dark backdrop. On the light
  // theme it is the solid accent blue, because a see-through blue picks up a pale backdrop and the white label
  // loses its contrast (5.1:1 solid), so there the rim is the Download button's dark one (shadow-liquid-ink).
  // No refraction layer (liquid-backdrop): browsers that composite on the GPU pull pixels from outside the
  // pill into its corners when they displace the backdrop, and on a fill this far from the page's colour that
  // shows as a pale blob (a dark one on the dark theme). Over a near-opaque fill there is nothing to refract.
  primary:
    "bg-brand/75 text-on-accent before:shadow-liquid hover:bg-brand/85 hover:shadow-accent-glow theme-light:bg-accent theme-light:before:shadow-liquid-ink theme-light:hover:bg-accent-hover",
  // The distortion sits on the same ::before as the rim, so the rim is painted after the backdrop is
  // distorted. As a separate layer under the rim it was refracted too, which smeared it into cloudy
  // patches and washed it out. On the light theme the rim is drawn in shade (shadow-liquid-ink).
  glass:
    "bg-glass-fill text-on-night before:shadow-liquid before:liquid-backdrop hover:bg-glass-fill-hover theme-light:before:shadow-liquid-ink",
  // A dark pill with a conic highlight for a border and a shimmer inside (shiny-cta in globals.css). It
  // brings its own pseudo-elements and transitions, so liquidClasses leaves out the rim and the spring.
  shiny: "shiny-cta",
};

const sizeClasses: Record<LiquidSize, string> = {
  sm: "min-h-11 px-5 text-small",
  md: "min-h-12 px-6 text-body",
  lg: "min-h-14 px-8 text-body",
  // A square button that holds one icon, as tall as a small one.
  icon: "size-11",
};

export function liquidClasses(tone: LiquidTone, size: LiquidSize, className?: string): string {
  if (tone === "shiny") {
    return cx(
      "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-semibold whitespace-nowrap",
      "disabled:pointer-events-none disabled:opacity-50",
      toneClasses[tone],
      sizeClasses[size],
      className,
    );
  }
  return cx(
    "group/button relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap",
    "transition-[scale,box-shadow,background-color] duration-base ease-spring",
    "hover:scale-104 active:scale-97 active:duration-instant",
    "disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress aria-busy:opacity-80",
    "before:pointer-events-none before:absolute before:inset-0 before:z-behind before:rounded-full",
    toneClasses[tone],
    sizeClasses[size],
    className,
  );
}
