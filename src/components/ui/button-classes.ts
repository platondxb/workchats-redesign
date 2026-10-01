import { cx } from "@/lib/cx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse" | "inverse-outline";
export type ButtonSize = "sm" | "md";

/**
 * Button styles, shared by <Button>, <ButtonLink> and the header (a client component, which imports
 * this file rather than Button.tsx so no icon code reaches the browser).
 * States: hover, focus-visible (global outline), active, disabled and loading (aria-busy).
 * Both sizes are at least 44px tall. "inverse" variants sit on the brand-blue band.
 */
export function buttonClasses(variant: ButtonVariant, size: ButtonSize, className?: string): string {
  return cx(
    "group/button inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition",
    "active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress aria-busy:opacity-80",
    size === "sm" ? "min-h-11 px-5 text-small" : "min-h-12 px-6 text-body",
    variant === "primary" && "bg-accent text-on-accent shadow-raised hover:bg-accent-hover",
    variant === "secondary" && "border border-line-strong bg-surface text-ink hover:border-ink",
    variant === "ghost" && "text-ink hover:bg-tint",
    variant === "inverse" && "bg-surface text-accent-ink hover:bg-accent-subtle",
    variant === "inverse-outline" &&
      "border border-on-accent/70 text-on-accent hover:border-on-accent hover:bg-on-accent/10",
    className,
  );
}
