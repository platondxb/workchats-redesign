import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/*
 * The scroll animation the owner supplied (container-scroll-animation.tsx), rebuilt with CSS scroll-driven
 * animations instead of framer-motion. The structure and the props follow the original (a Header that lifts
 * and a card that tilts back and straightens as the page scrolls), but it ships no JavaScript:
 * framer-motion would have added about 30 KB to a first load that has 2 KB of budget left (the owner chose
 * this on 3 October 2026).
 *
 * The card is the devices (components/product/HeroDevices.tsx): over the first 70% of a screen of
 * scrolling the laptop's lid comes up from leaning back a little on its hinge to square with the viewer, the laptop
 * settles from 104% to its size and the title lifts 100px (globals.css: `cs-title`, `cs-lid`, `cs-settle`).
 * The motion follows the scroll position and never changes the scroll's speed or direction.
 *
 * Where scroll-driven animations aren't supported, and whenever reduced motion is on, the devices are
 * simply shown settled: their resting style is the final frame.
 */

export function ContainerScroll({
  id,
  titleComponent,
  children,
  overlay,
  label,
  className,
}: {
  id?: string;
  titleComponent: ReactNode;
  /** The devices: one picture to assistive technology, described by `label`. */
  children: ReactNode;
  /** A control laid over the devices' box, outside the picture (the tour's pause button). */
  overlay?: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    // suppressHydrationWarning: an inline script marks this element as the hero tour plays.
    <div id={id} className={cx("relative", className)} suppressHydrationWarning>
      <Header>{titleComponent}</Header>
      <div className="relative mx-auto mt-6 max-w-laptop md:mt-8">
        {/* The perspective sits on the tilting devices' own parent: a 3D transform is only seen in depth by
            its parent's perspective, two levels up it is flattened. */}
        <div role="img" aria-label={label} data-tour-hold className="relative perspective-stage">
          {children}
        </div>
        {overlay}
      </div>
    </div>
  );
}

export function Header({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-content cs-title text-center">{children}</div>;
}
