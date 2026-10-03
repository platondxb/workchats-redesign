import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/*
 * The scroll animation the owner supplied (container-scroll-animation.tsx), rebuilt with CSS scroll-driven
 * animations instead of framer-motion. The structure, the names and the props are the same (a Header that
 * lifts and a Card that tilts back and straightens as the page scrolls), but it ships no JavaScript:
 * framer-motion would have added about 30 KB to a first load that has 2.2 KB of budget left (the owner
 * chose this on 3 October 2026).
 *
 * The motion is in globals.css (`cs-title`, `cs-card`, `cs-aside`) and is driven by the page's own scroll
 * position over the first 70% of a screen, so it starts tilted on load and has settled by the time the
 * next section arrives. Like the original, the title rises 100px and the card goes from 20° to flat while
 * scaling from 1.05 (0.92 on phones) to 1. It never changes the scroll speed or direction.
 *
 * Where scroll-driven animations aren't supported (Firefox today), and whenever reduced motion is on, the
 * card is simply shown flat: its resting style is the final frame.
 */

export function ContainerScroll({
  titleComponent,
  children,
  aside,
  label,
  className,
}: {
  titleComponent: ReactNode;
  /** What the card holds: the product, on the screen. */
  children: ReactNode;
  /** Something that sits in front of the card and settles with it, such as a phone beside the laptop. */
  aside?: ReactNode;
  /** What the devices show, in words. The devices are one picture to assistive technology. */
  label: string;
  className?: string;
}) {
  return (
    <div className={cx("relative perspective-stage", className)}>
      <Header>{titleComponent}</Header>
      <div role="img" aria-label={label} className="relative mx-auto mt-12 max-w-window md:mt-16">
        <Card>{children}</Card>
        {aside}
      </div>
    </div>
  );
}

export function Header({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-content cs-title text-center">{children}</div>;
}

/**
 * The screen: a machined edge, a dark bezel, then the display. Below md the card isn't shown and the aside
 * (the phone) takes its place, because a shrunken desktop app on a phone reads as a broken layout.
 */
export function Card({ children }: { children: ReactNode }) {
  return (
    <div
      data-device="laptop"
      className="hidden cs-card rounded-lg bg-(image:--gradient-device-edge) p-1 shadow-device md:block"
    >
      <div className="h-152 rounded-lg bg-device-bezel p-2 lg:h-160 lg:p-3">
        <div className="h-full overflow-hidden rounded-md bg-canvas">{children}</div>
      </div>
    </div>
  );
}
