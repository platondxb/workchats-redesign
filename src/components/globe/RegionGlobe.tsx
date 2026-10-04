import { HandGrabbing } from "@phosphor-icons/react/ssr";
import type { RegionId } from "@/content/site";
import { cx } from "@/lib/cx";
import { GlobeLoader } from "./GlobeLoader";
import { arcPath, homeCentre, viewOf, type LatLng } from "./globe-math";

export interface GlobeRegion {
  id: RegionId;
  short: string;
  point: LatLng;
}

/** The arcs that join the regions: every pair, so the three read as one network. */
const links = [
  ["gb", "eu"],
  ["eu", "ae"],
  ["ae", "gb"],
] as const satisfies readonly (readonly [RegionId, RegionId])[];

/** Each pin's resting place (globe.css) and the side its label sits on, clear of the arcs and of each
 *  other: the UK's above and to the left, the EU's below and to the left, the UAE's below and to the right. */
const pinClasses = {
  gb: "globe-pin-gb",
  eu: "globe-pin-eu",
  ae: "globe-pin-ae",
} satisfies Record<RegionId, string>;

const labelClasses = {
  gb: "right-3 bottom-1.5 flag-gb",
  eu: "top-1.5 right-3 flag-eu",
  ae: "top-1.5 left-3 flag-ae",
} satisfies Record<RegionId, string>;

/**
 * A planet the visitor can turn, with the regions Workchats is hosted in marked on it and joined by arcs.
 *
 * Everything here is server-rendered: the planet as a picture (the poster, in a dark and a light version),
 * and the arcs, points and labels as SVG and HTML laid over it, drawn for the poster's view by the same
 * maths the live globe uses (globe-math.ts). That is the whole picture without JavaScript, with reduced
 * motion and wherever WebGL isn't up to it. Where it is, GlobeLoader swaps the poster for the live planet
 * (cobe, in a canvas) once it comes near the screen; the runtime then moves the same arcs and labels as
 * the planet turns.
 *
 * It is one image to assistive technology, named by `label`. Turning it is a mouse and touch extra: the
 * region list beside it does the same from the keyboard.
 */
export function RegionGlobe({
  regions,
  label,
  hint,
  className,
}: {
  regions: readonly GlobeRegion[];
  label: string;
  hint: string;
  className?: string;
}) {
  const home = viewOf(homeCentre);
  const place = (id: RegionId) => regions.find((region) => region.id === id)?.point ?? homeCentre;
  return (
    <div
      id="region-globe"
      role="img"
      aria-label={label}
      className={cx(
        "group/globe relative isolate mx-auto aspect-square w-full max-w-globe globe-palette select-none data-[globe=live]:cursor-grab data-[globe=live]:touch-pan-y data-[globe=live]:data-dragging:cursor-grabbing",
        className,
      )}
    >
      <div className="absolute inset-0 z-behind rounded-full globe-glow" />
      <Poster theme="dark" className="in-data-[theme=light]:hidden" />
      <Poster theme="light" className="hidden in-data-[theme=light]:block" />
      <div
        data-globe-canvas
        className="absolute inset-0 opacity-0 transition-opacity duration-slow ease-out group-data-[globe=live]/globe:opacity-100"
      />
      <svg
        viewBox="0 0 1000 1000"
        className="pointer-events-none absolute inset-0 size-full overflow-visible globe-arcs"
      >
        {links.map(([from, to]) => (
          <path
            key={`${from}-${to}`}
            data-from={from}
            data-to={to}
            d={arcPath(place(from), place(to), home)}
            pathLength={1}
            className="globe-arc region-chosen:opacity-30 arc-chosen:stroke-2 arc-chosen:opacity-100"
          />
        ))}
      </svg>
      {regions.map((region) => (
        <span
          key={region.id}
          data-pin={region.id}
          data-lat={region.point[0]}
          data-lng={region.point[1]}
          className={cx("globe-pin", pinClasses[region.id])}
        >
          <span className="globe-dot globe-mark pin-chosen:globe-ping" />
          <span
            className={cx(
              "absolute flex flag items-center gap-1.5 rounded-full border border-night-line bg-night-raised/85 py-1 pr-2.5 pl-1.5 text-micro font-semibold whitespace-nowrap text-on-night globe-mark shadow-raised backdrop-blur-glass group-data-[globe=live]/globe:cursor-pointer pin-chosen:border-accent pin-chosen:bg-accent pin-chosen:text-on-accent",
              labelClasses[region.id],
            )}
          >
            {region.short}
          </span>
        </span>
      ))}
      <p className="pointer-events-none absolute inset-x-0 bottom-0 hidden items-center justify-center gap-2 text-micro text-on-night-subtle group-data-[globe=live]/globe:flex">
        <HandGrabbing aria-hidden="true" className="size-4" />
        {hint}
      </p>
      <GlobeLoader target="region-globe" />
    </div>
  );
}

/**
 * The planet as a picture, drawn by the live globe's own code (scripts/render-globe.mjs): AVIF where the
 * browser takes it, WebP elsewhere. Lazy, so it costs nothing until the globe is near the screen, and only
 * the current theme's is fetched (the other is display: none).
 */
function Poster({ theme, className }: { theme: "dark" | "light"; className: string }) {
  return (
    <picture>
      <source type="image/avif" srcSet={`/globe/planet-${theme}.avif`} />
      <img
        src={`/globe/planet-${theme}.webp`}
        alt=""
        width={1216}
        height={1216}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={cx(
          "absolute inset-0 size-full transition-opacity duration-slow ease-out group-data-[globe=live]/globe:opacity-0",
          className,
        )}
      />
    </picture>
  );
}
