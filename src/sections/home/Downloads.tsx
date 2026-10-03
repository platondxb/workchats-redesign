import { CalendarCheck } from "@phosphor-icons/react/ssr";
import { platformIcons } from "@/components/ui/icons";
import { home } from "@/content/home";
import { platforms, type Platform, type PlatformId } from "@/content/site";
import { cx } from "@/lib/cx";

/*
 * Every platform Workchats runs on, with the visitor's own first and marked "This device". The platform is
 * read before the first paint (lib/platform.ts sets data-os on <html>), so the order and the marker are in
 * place on arrival and nothing moves; without it, the order below stands and nothing is marked.
 *
 * In this MVP the owner asked for download buttons that take a press and do nothing else (3 Oct 2026).
 * Each one is a real <button> with hover, focus and press states, and records `download_click` with its
 * platform once analytics is accepted. Give a platform an `href` in content/site.ts and its button becomes
 * a link.
 */
const orderClasses = {
  macos: "os-macos:order-first",
  windows: "os-windows:order-first",
  linux: "os-linux:order-first",
  ios: "os-ios:order-first",
  android: "os-android:order-first",
  web: "os-web:order-first",
} satisfies Record<PlatformId, string>;

const deviceClasses = {
  macos: "os-macos:border-accent-on-night os-macos:bg-night-overlay",
  windows: "os-windows:border-accent-on-night os-windows:bg-night-overlay",
  linux: "os-linux:border-accent-on-night os-linux:bg-night-overlay",
  ios: "os-ios:border-accent-on-night os-ios:bg-night-overlay",
  android: "os-android:border-accent-on-night os-android:bg-night-overlay",
  web: "os-web:border-accent-on-night os-web:bg-night-overlay",
} satisfies Record<PlatformId, string>;

const markerClasses = {
  macos: "os-macos:inline-flex",
  windows: "os-windows:inline-flex",
  linux: "os-linux:inline-flex",
  ios: "os-ios:inline-flex",
  android: "os-android:inline-flex",
  web: "os-web:inline-flex",
} satisfies Record<PlatformId, string>;

export function Downloads() {
  const { download } = home;
  return (
    <section id="download" aria-labelledby="download-title" className="py-section">
      <div className="container-page">
        <div className="max-w-180">
          <h2 id="download-title" className="font-display text-title">
            {download.title}
          </h2>
          <p className="mt-4 max-w-text text-lead text-on-night-muted">{download.intro}</p>
        </div>
        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((platform) => (
            <li key={platform.id} className={cx("flex", orderClasses[platform.id])}>
              <PlatformButton platform={platform} />
            </li>
          ))}
        </ul>
        <p className="mt-8 flex items-center gap-2.5 text-small text-on-night-muted">
          <CalendarCheck aria-hidden="true" className="size-5 shrink-0 text-accent-on-night" />
          {download.calendars}
        </p>
      </div>
    </section>
  );
}

function PlatformButton({ platform }: { platform: Platform }) {
  const Icon = platformIcons[platform.id];
  const classes = cx(
    "group flex min-h-20 w-full cursor-pointer items-center gap-4 rounded-md border border-night-line bg-night-raised px-5 py-4 text-left transition-[background-color,border-color,scale] duration-base ease-spring",
    "hover:border-night-line-strong hover:bg-night-overlay active:scale-98 active:duration-instant",
    deviceClasses[platform.id],
  );
  const content = (
    <>
      <Icon aria-hidden="true" className="size-7 shrink-0 text-on-night-muted group-hover:text-on-night" />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-on-night">{platform.label}</span>
        <span className="block text-small text-on-night-subtle">{platform.detail}</span>
      </span>
      <span
        className={cx(
          "hidden shrink-0 items-center rounded-full bg-accent px-2.5 py-0.5 text-nano font-semibold text-on-accent",
          markerClasses[platform.id],
        )}
      >
        {home.download.thisDevice}
      </span>
    </>
  );
  if (platform.href) {
    return (
      <a href={platform.href} className={classes} data-download={platform.id} data-location="downloads">
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={classes} data-download={platform.id} data-location="downloads">
      {content}
    </button>
  );
}
