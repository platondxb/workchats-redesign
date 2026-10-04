import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/*
 * The scroll animation the owner supplied (container-scroll-animation.tsx), rebuilt with CSS scroll-driven
 * animations instead of framer-motion. The structure, the names and the props are the same (a Header that
 * lifts and a Card that tilts back and straightens as the page scrolls), but it ships no JavaScript:
 * framer-motion would have added about 30 KB to a first load that has 2.2 KB of budget left (the owner
 * chose this on 3 October 2026).
 *
 * The Card is a laptop: a vector render of the lid and the base (public/devices, drawn by
 * scripts/render-devices.mjs) with the live screen behind the lid's glass. Over the first 70% of a screen
 * of scrolling the lid comes up from leaning back on its hinge to square with the viewer, the laptop
 * settles from 104% to its size and the title lifts 100px (globals.css: `cs-title`, `cs-lid`,
 * `cs-settle`). The motion follows the scroll position and never changes the scroll's speed or direction.
 *
 * Where scroll-driven animations aren't supported (Firefox today), and whenever reduced motion is on, the
 * laptop is simply shown open and square to the viewer: its resting style is the final frame.
 */

export function ContainerScroll({
  titleComponent,
  children,
  aside,
  label,
  className,
}: {
  titleComponent: ReactNode;
  /** What the laptop's screen shows: the product. */
  children: ReactNode;
  /** Something that stands in front of the laptop and settles with it, such as a phone. */
  aside?: ReactNode;
  /** What the devices show, in words. The devices are one picture to assistive technology. */
  label: string;
  className?: string;
}) {
  return (
    <div className={cx("relative", className)}>
      <Header>{titleComponent}</Header>
      {/* The perspective sits on the tilting devices' own parent: a 3D transform is only seen in depth by
          its parent's perspective, two levels up it is flattened. */}
      <div
        role="img"
        aria-label={label}
        className="relative mx-auto mt-12 max-w-laptop perspective-stage md:mt-14"
      >
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
 * The laptop. The screen sits behind the lid's frame, whose display area is transparent, so the app is as
 * sharp as the page's own text and the glass reflection lies over it. Below md the laptop isn't shown and
 * the aside (the phone) takes its place: a shrunken desktop app on a phone reads as a broken layout.
 */
export function Card({ children }: { children: ReactNode }) {
  return (
    <div data-device="laptop" className="relative hidden cs-settle perspective-stage md:block">
      <div data-device-part="lid" className="relative device-lid cs-lid">
        <div className="laptop-screen overflow-hidden bg-canvas">{children}</div>
        {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG frame: next/image would add client JS */}
        <img
          src="/devices/laptop-lid.svg"
          alt=""
          width={2000}
          height={1366}
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 size-full select-none"
        />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- as above */}
      <img
        src="/devices/laptop-base.svg"
        alt=""
        width={2400}
        height={104}
        className="pointer-events-none relative device-base block w-full select-none"
      />
    </div>
  );
}
