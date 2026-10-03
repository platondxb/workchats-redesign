import { cx } from "@/lib/cx";

/*
 * The liquid glass button's classes, in a module with no JSX so client components (the consent banner)
 * can use the same look without pulling the server-rendered button or its SVG filter into the browser.
 * See liquid-glass-button.tsx for where the design comes from and how it was adapted.
 *
 * States: hover (lifts on a spring, the primary glows), focus-visible (the global ring), active (presses
 * in), disabled, and loading (aria-busy). Every size is at least 44px tall.
 */

export type LiquidTone = "primary" | "glass";
export type LiquidSize = "sm" | "md" | "lg";

const toneClasses: Record<LiquidTone, string> = {
  // The main action: solid brand blue under the glass rim, so the hierarchy doesn't depend on the effect.
  primary: "bg-accent text-on-accent hover:shadow-accent-glow",
  glass:
    "bg-glass-fill text-on-night hover:bg-glass-fill-hover after:pointer-events-none after:absolute after:inset-0 after:z-behind after:overflow-hidden after:rounded-full after:liquid-backdrop",
};

const sizeClasses: Record<LiquidSize, string> = {
  sm: "min-h-11 px-5 text-small",
  md: "min-h-12 px-6 text-body",
  lg: "min-h-14 px-8 text-body",
};

export function liquidClasses(tone: LiquidTone, size: LiquidSize, className?: string): string {
  return cx(
    "group/button relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap",
    "transition-[scale,box-shadow,background-color] duration-base ease-spring",
    "hover:scale-104 active:scale-97 active:duration-instant",
    "disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress aria-busy:opacity-80",
    "before:pointer-events-none before:absolute before:inset-0 before:z-behind before:rounded-full before:shadow-liquid",
    toneClasses[tone],
    sizeClasses[size],
    className,
  );
}
