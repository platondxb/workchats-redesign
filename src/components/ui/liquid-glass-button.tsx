import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { liquidClasses, type LiquidSize, type LiquidTone } from "./button-classes";

/*
 * The liquid glass button the owner supplied (liquid-glass-button.tsx), adapted to this codebase:
 *
 * - It is a Server Component: no "use client" and no hooks, so it adds no JavaScript to the page.
 * - The glass rim and the backdrop distortion are the button's ::before and ::after, not two extra <div>s.
 *   A <div> isn't allowed inside a <button>, and the page has a 1,000-element budget.
 * - Its colours, shadows, radii and timings are tokens (shadow-liquid, shadow-accent-glow, ease-spring,
 *   duration-*). The inline `backdropFilter` style became the `liquid-backdrop` utility in globals.css.
 * - The SVG filter it distorts with is rendered once, in the root layout (<LiquidGlassFilter />), rather
 *   than once per button under a repeated id.
 * - With an `href` it renders a link, so links stay links; Radix Slot and class-variance-authority aren't
 *   needed for that. The unused MetalButton and the shadcn Button from the same file were left out.
 *
 * The distortion needs backdrop-filter: url(), which only Chromium supports today; other browsers show the
 * same glass rim and fill without it.
 */

export { liquidClasses, type LiquidSize, type LiquidTone } from "./button-classes";

interface Common {
  tone?: LiquidTone;
  size?: LiquidSize;
  children: ReactNode;
  className?: string;
}

type AsLink = Common & Omit<ComponentPropsWithoutRef<"a">, "className" | "children"> & { href: string };
type AsButton = Common &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children"> & { href?: undefined };

export function LiquidButton(props: AsLink | AsButton) {
  if (props.href !== undefined) {
    const { tone = "primary", size = "md", className, children, ...rest } = props;
    return (
      <a {...rest} className={liquidClasses(tone, size, className)}>
        {children}
      </a>
    );
  }
  const { tone = "primary", size = "md", className, children, type = "button", ...rest } = props;
  return (
    <button {...rest} type={type} className={liquidClasses(tone, size, className)}>
      {children}
    </button>
  );
}

/**
 * The distortion the glass buttons refract the page through: fractal noise, softened, used as a
 * displacement map. Rendered once in the root layout; `liquid-backdrop` points at #liquid-glass.
 */
export function LiquidGlassFilter() {
  return (
    <svg aria-hidden="true" focusable="false" className="absolute size-0 overflow-hidden">
      <filter id="liquid-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="2" result="softNoise" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softNoise"
          scale="70"
          xChannelSelector="R"
          yChannelSelector="B"
          result="displaced"
        />
        <feGaussianBlur in="displaced" stdDeviation="4" />
      </filter>
    </svg>
  );
}
