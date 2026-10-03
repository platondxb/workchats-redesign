import { ArrowRight, ArrowUpRight, CaretDown, DownloadSimple, List, X } from "@phosphor-icons/react/ssr";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { menuIcons } from "@/components/ui/icons";
import { home } from "@/content/home";
import { isNavGroup, primaryNav, type NavGroup, type NavLink } from "@/content/navigation";
import { site } from "@/content/site";
import { cx } from "@/lib/cx";
import { HeaderNav, type HeaderEntry } from "./HeaderNav";
import { Logo } from "./Logo";

/**
 * The header, adapted from the owner's reference: at the top of the page it is wide and transparent, the
 * links set between the logo and the actions; as content moves under it, the bar gathers into a
 * floating glass pill the width of the content (the nav-* utilities in globals.css, transform and opacity
 * only). Without scroll timelines, or with reduced motion, it is simply the pill.
 *
 * Actions: Sign in, Download (to the platforms on this page), Book a demo, and Start free as the primary.
 * Menu panels, the phone menu and every action are rendered here on the server and handed to the client
 * component, so their icons and buttons never ship as JavaScript.
 */
export function SiteHeader() {
  const entries: HeaderEntry[] = primaryNav.map((entry) =>
    isNavGroup(entry) ? { label: entry.label, panel: <MenuPanel group={entry} /> } : entry,
  );

  const signIn = { label: "Sign in", href: site.links.signIn };
  const demo = { label: "Book a demo", href: site.links.bookDemo };
  const start = home.hero.primary;

  return (
    <header className="sticky top-0 z-header py-2">
      <div className="container-nav">
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute nav-glass inset-y-0 rounded-md border border-night-line bg-night-glass shadow-float backdrop-blur-glass"
          />
          <div className="relative nav-inset">
            <div className="flex h-(--header-height) items-center justify-between gap-4 px-3 xs:px-4 lg:gap-3 lg:px-4 xl:px-5">
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the only route in this app; see SiteLink */}
              <a
                href="/"
                className="inline-flex min-h-11 shrink-0 nav-gather-start items-center rounded-sm text-on-night"
              >
                <Logo className="h-5 w-auto xs:h-6 xl:h-7" />
              </a>
              <HeaderNav
                entries={entries}
                mobileNav={<MobileNav />}
                actions={{
                  desktop: (
                    <>
                      <a
                        href={signIn.href}
                        className="inline-flex min-h-11 items-center rounded-full px-2 text-small font-semibold whitespace-nowrap text-on-night-muted hover:text-on-night xl:px-3"
                      >
                        {signIn.label}
                      </a>
                      <LiquidButton
                        href={home.hero.download.href}
                        tone="glass"
                        size="sm"
                        data-download="auto"
                        data-location="header"
                        aria-label="Download"
                        className="max-xl:px-3"
                      >
                        <DownloadSimple aria-hidden="true" className="size-4.5" />
                        <span aria-hidden="true" className="max-xl:sr-only">
                          Download
                        </span>
                      </LiquidButton>
                      <LiquidButton
                        href={demo.href}
                        tone="glass"
                        size="sm"
                        data-cta="header-demo"
                        className="max-xl:px-4"
                      >
                        {demo.label}
                      </LiquidButton>
                    </>
                  ),
                  primary: (
                    <LiquidButton href={start.href} size="sm" data-cta="header" className="lg:max-xl:px-4">
                      {start.label}
                    </LiquidButton>
                  ),
                  menu: (
                    <>
                      <LiquidButton href={start.href} data-cta="menu">
                        {start.label}
                      </LiquidButton>
                      <LiquidButton
                        href={home.hero.download.href}
                        tone="glass"
                        data-download="auto"
                        data-location="menu"
                      >
                        <DownloadSimple aria-hidden="true" className="size-5" />
                        Download
                      </LiquidButton>
                      <LiquidButton href={demo.href} tone="glass" data-cta="menu-demo">
                        {demo.label}
                      </LiquidButton>
                      <a
                        href={signIn.href}
                        className="inline-flex min-h-12 items-center justify-center rounded-full text-body font-semibold text-on-night-muted hover:text-on-night"
                      >
                        {signIn.label}
                      </a>
                    </>
                  ),
                }}
                icons={{
                  caret: (
                    <CaretDown
                      aria-hidden="true"
                      className="size-4 text-on-night-subtle transition-transform duration-fast group-aria-expanded:rotate-180"
                    />
                  ),
                  menu: <List aria-hidden="true" className="size-6" />,
                  close: <X aria-hidden="true" className="size-6" />,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * One menu panel: a two-column grid of rich items — an icon, the label and one line on what it does.
 * Unreleased features sit in the same grid and carry a "Coming soon" chip rather than being moved into a
 * column of their own: the flag belongs to the link, not to a corner of the panel. The footer is a single
 * arrow row under a hairline.
 */
function MenuPanel({ group }: { group: NavGroup }) {
  const items = [...group.items, ...(group.aside?.items ?? [])];
  return (
    <div
      className={cx(
        "pop-in overflow-hidden rounded-md border border-night-line bg-night-raised shadow-overlay",
        items.length >= 5 ? "w-menu-lg" : "w-menu-md",
      )}
    >
      <ul className="grid grid-cols-1 gap-1 p-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.href}>
            <MenuCard item={item} />
          </li>
        ))}
      </ul>
      {group.footer ? (
        <div className="border-t border-night-line p-2">
          <MenuRow item={group.footer} />
        </div>
      ) : null}
    </div>
  );
}

/** A menu item: icon tile, label, an optional status chip, then the line that says what it does. */
function MenuCard({ item }: { item: NavLink }) {
  const Icon = item.icon ? menuIcons[item.icon] : ArrowUpRight;
  return (
    <a href={item.href} className="group flex h-full gap-3 rounded-sm p-3 hover:bg-night-overlay">
      {/* The tile holds its colour on hover: the row's background is what responds, not the icon. */}
      <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-night-overlay text-accent-on-night">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-small font-semibold text-on-night">{item.label}</span>
          {item.comingSoon ? <ComingSoon /> : null}
        </span>
        {item.description ? (
          <span className="mt-0.5 block text-micro text-on-night-muted">{item.description}</span>
        ) : null}
      </span>
    </a>
  );
}

function ComingSoon() {
  return (
    <span className="rounded-full border border-night-line px-2 py-0.5 text-nano font-semibold text-on-night-muted">
      Coming soon
    </span>
  );
}

/** A plain row: the label, then the arrow at the far edge. Used for each panel's footer. */
function MenuRow({ item }: { item: NavLink }) {
  return (
    <a
      href={item.href}
      className="group flex min-h-11 items-center gap-2 rounded-sm px-3 text-small font-semibold text-on-night hover:bg-night-overlay"
    >
      {item.label}
      {item.comingSoon ? <ComingSoon /> : null}
      <ArrowRight
        aria-hidden="true"
        className="ml-auto size-4 shrink-0 text-on-night-subtle transition-transform duration-fast group-hover:translate-x-0.5 group-hover:text-accent-on-night"
      />
    </a>
  );
}

/** The phone menu's navigation: groups as native disclosures, mounted only once the menu is opened. */
function MobileNav() {
  return (
    <nav aria-label="Main">
      <ul className="divide-y divide-night-line border-y border-night-line">
        {primaryNav.map((entry) =>
          isNavGroup(entry) ? (
            <li key={entry.label}>
              <details className="group">
                <summary className="flex min-h-14 items-center justify-between font-display text-heading">
                  {entry.label}
                  <CaretDown
                    aria-hidden="true"
                    className="size-5 text-on-night-subtle transition-transform duration-fast group-open:rotate-180"
                  />
                </summary>
                <ul className="grid gap-0.5 pb-4">
                  {[...entry.items, ...(entry.aside?.items ?? [])].map((item) => (
                    <li key={item.href}>
                      <MobileRow item={item} />
                    </li>
                  ))}
                  {entry.footer ? (
                    <li>
                      <MobileRow item={entry.footer} />
                    </li>
                  ) : null}
                </ul>
              </details>
            </li>
          ) : (
            <li key={entry.label}>
              <a href={entry.href} className="flex min-h-14 items-center font-display text-heading">
                {entry.label}
              </a>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}

/**
 * A phone menu item. Same icon, label and status chip as the desktop card, at menu-sized text and on a
 * full-width tap target; the one-line description is left out, because on a phone the list is long
 * enough without it.
 */
function MobileRow({ item }: { item: NavLink }) {
  const Icon = item.icon ? menuIcons[item.icon] : ArrowUpRight;
  return (
    <a
      href={item.href}
      className="flex min-h-12 items-center gap-3 rounded-sm px-2 text-body font-semibold hover:bg-night-overlay"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-night-overlay text-accent-on-night">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      {item.label}
      {item.comingSoon ? (
        <span className="ml-auto">
          <ComingSoon />
        </span>
      ) : null}
    </a>
  );
}
