import { home } from "@/content/home";
import { cx } from "@/lib/cx";

/*
 * The hero's devices. The laptop is a vector render (public/devices/laptop-lid.svg and laptop-base.svg) with
 * the camera notch over its display; the app's screen sits behind the lid's glass, so it stays as sharp as
 * the page's text, and the lid opens as the page scrolls (globals.css, cs-lid). The phone is a studio render
 * of a self-made model with its screens rendered in (scripts/devices).
 *
 * The screens are the real app's layout in both themes, with a fictional team (scripts/screens), and they
 * take turns: chats, contacts, schedule, calls, tasks, in the order of the app's own sidebar, on both
 * devices at once (lib/tour.ts, styles/tour.css). Only the first one's images load with the page; each
 * next one loads a step ahead. Without JavaScript, or with reduced motion, the chats screen stays. There is
 * no control for the tour: it is a picture of the app, and it goes round for as long as the page is open.
 */

type StopId = (typeof home.hero.tour.stops)[number];

const themes = ["dark", "light"] as const;
/** The dark image is the default; the light one replaces it under data-theme="light". */
const themeClasses = { dark: "theme-light:hidden", light: "hidden theme-light:block" } as const;

const sizes = {
  laptopScreen: "(min-width: 76rem) 57rem, 78vw",
  phone: "(min-width: 80rem) 16rem, (min-width: 64rem) 14rem, 15rem",
} as const;

/** A render in two sizes and two formats: AVIF where the browser takes it, WebP elsewhere. */
function Render({
  path,
  widths,
  height,
  sizes: sizesAttribute,
  eager = false,
  className,
}: {
  path: string;
  widths: readonly [number, number];
  height: number;
  sizes: string;
  eager?: boolean;
  className?: string;
}) {
  const set = (format: string) => widths.map((width) => `${path}-${width}.${format} ${width}w`).join(", ");
  return (
    <picture>
      <source type="image/avif" srcSet={set("avif")} sizes={sizesAttribute} />
      <img
        src={`${path}-${widths[1]}.webp`}
        srcSet={set("webp")}
        sizes={sizesAttribute}
        alt=""
        width={widths[1]}
        height={height}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
        draggable={false}
        className={cx("pointer-events-none select-none", className)}
      />
    </picture>
  );
}

/** One screen per stop and theme, stacked; styles/tour.css shows the current stop's. */
function Screens({
  device,
  widths,
  height,
  sizes: sizesAttribute,
}: {
  device: "desktop" | "phone";
  widths: readonly [number, number];
  height: number;
  sizes: string;
}) {
  const folder = device === "desktop" ? "screens" : "devices";
  return home.hero.tour.stops.map((stop: StopId, index) => (
    <div key={stop} data-stop={stop} className="absolute inset-0 tour-screen">
      {themes.map((theme) => (
        <Render
          key={theme}
          path={`/${folder}/${device}-${stop}-${theme}`}
          widths={widths}
          height={height}
          sizes={sizesAttribute}
          eager={index === 0 && theme === "dark"}
          className={cx("size-full", themeClasses[theme])}
        />
      ))}
    </div>
  ));
}

/**
 * The laptop. Below md it isn't shown and the phone takes its place: a shrunken desktop app on a phone
 * reads as a broken layout.
 */
export function Laptop() {
  return (
    <div data-device="laptop" className="relative hidden cs-settle perspective-stage md:block">
      <div data-device-part="lid" className="relative device-lid cs-lid">
        <div className="laptop-screen overflow-hidden bg-night">
          <Screens device="desktop" widths={[900, 1800]} height={1142} sizes={sizes.laptopScreen} />
        </div>
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

export function Phone({ className }: { className?: string }) {
  return (
    <div data-device="phone" className={cx("relative device-phone drop-shadow-device", className)}>
      <Screens device="phone" widths={[450, 900]} height={1856} sizes={sizes.phone} />
    </div>
  );
}
