import { ArrowRight, ArrowUpRight, CaretDown, List, X } from "@phosphor-icons/react/ssr";
import { menuIcons } from "@/components/ui/icons";
import { home } from "@/content/home";
import { isNavGroup, primaryNav, type NavGroup, type NavLink } from "@/content/navigation";
import { site } from "@/content/site";
import { cx } from "@/lib/cx";
import { HeaderNav, type HeaderEntry } from "./HeaderNav";
import { Logo } from "./Logo";

/**
 * The floating header: a glass bar, inset from the page edges, sitting over the content. At the top of
 * the page the surface is invisible and the navigation rests on the canvas; as the page scrolls the
 * glass and its halo fade in (the nav-glass scroll timeline). Menu panels and the phone menu are
 * rendered here on the server and handed to the client component, so their icons never ship as JS.
 */
export function SiteHeader() {
  const entries: HeaderEntry[] = primaryNav.map((entry) =>
    isNavGroup(entry) ? { label: entry.label, panel: <MenuPanel group={entry} /> } : entry,
  );

  return (
    <header className="sticky top-0 z-40 py-2">
      <div className="container-nav">
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 nav-glass rounded-md bg-surface-glass shadow-float backdrop-blur-glass"
          />
          <div className="relative flex h-(--header-height) items-center px-3 xs:px-4 lg:px-6">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the only route in this app; see SiteLink */}
            <a href="/" className="inline-flex min-h-11 shrink-0 items-center rounded-sm text-ink">
              <Logo className="h-5 w-auto xs:h-6 lg:h-7" />
            </a>
            <HeaderNav
              entries={entries}
              mobileNav={<MobileNav />}
              signIn={{ label: "Sign in", href: site.links.signIn }}
              demo={home.hero.secondary}
              start={home.hero.primary}
              icons={{
                caret: (
                  <CaretDown
                    aria-hidden="true"
                    className="size-4 text-ink-muted transition-transform group-aria-expanded:rotate-180"
                  />
                ),
                menu: <List aria-hidden="true" className="size-6" />,
                close: <X aria-hidden="true" className="size-6" />,
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * One menu panel: a two-column grid of rich items — an icon, the label and one line on what it does.
 * Unreleased features sit in the same grid, in no special order, and carry a "Coming soon" chip rather
 * than being moved into a column of their own: the flag belongs to the link, not to a corner of the
 * panel. The footer is a single arrow row under a hairline.
 */
function MenuPanel({ group }: { group: NavGroup }) {
  const items = [...group.items, ...(group.aside?.items ?? [])];
  return (
    <div
      className={cx(
        "pop-in overflow-hidden rounded-md border border-line bg-surface shadow-overlay",
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
        <div className="border-t border-line p-2">
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
    <a href={item.href} className="group flex h-full gap-3 rounded-sm p-3 hover:bg-tint">
      {/* The tile holds its colour on hover: the row's background is what responds, not the icon. */}
      <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-accent-subtle text-accent-ink">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-small font-semibold text-ink">{item.label}</span>
          {item.comingSoon ? (
            <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-nano font-semibold text-ink-muted">
              Coming soon
            </span>
          ) : null}
        </span>
        {item.description ? (
          <span className="mt-0.5 block text-micro text-ink-muted">{item.description}</span>
        ) : null}
      </span>
    </a>
  );
}

/** A plain row: the label, then the arrow at the far edge. Used for each panel's footer. */
function MenuRow({ item }: { item: NavLink }) {
  return (
    <a
      href={item.href}
      className="group flex min-h-11 items-center gap-2 rounded-sm px-3 text-small font-semibold text-ink hover:bg-tint"
    >
      {item.label}
      {item.comingSoon ? (
        <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-nano font-semibold text-ink-muted">
          Coming soon
        </span>
      ) : null}
      <ArrowRight
        aria-hidden="true"
        className="ml-auto size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent-ink"
      />
    </a>
  );
}

/** The phone menu's navigation: groups as native disclosures, mounted only once the menu is opened. */
function MobileNav() {
  return (
    <nav aria-label="Main">
      <ul className="divide-y divide-line border-y border-line">
        {primaryNav.map((entry) =>
          isNavGroup(entry) ? (
            <li key={entry.label}>
              <details className="group">
                <summary className="flex min-h-14 items-center justify-between font-display text-heading">
                  {entry.label}
                  <CaretDown
                    aria-hidden="true"
                    className="size-5 text-ink-muted transition-transform group-open:rotate-180"
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
      className="flex min-h-12 items-center gap-3 rounded-sm px-2 text-body font-semibold hover:bg-tint"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-accent-subtle text-accent-ink">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      {item.label}
      {item.comingSoon ? (
        <span className="ml-auto rounded-full border border-line bg-surface px-2 py-0.5 text-nano font-semibold text-ink-muted">
          Coming soon
        </span>
      ) : null}
    </a>
  );
}
