import { ArrowRight, CaretDown, List, X } from "@phosphor-icons/react/ssr";
import { menuIcons } from "@/components/ui/icons";
import { home } from "@/content/home";
import { isNavGroup, primaryNav, type MenuIcon, type NavGroup, type NavLink } from "@/content/navigation";
import { site } from "@/content/site";
import { cx } from "@/lib/cx";
import { HeaderNav, type HeaderEntry } from "./HeaderNav";
import { Logo } from "./Logo";

/**
 * Sticky header. At the top of the page it sits on the canvas; once the page scrolls it gains a surface,
 * a hairline and a shadow (the header-lift scroll timeline). Menu panels and the phone menu are rendered
 * here on the server and handed to the client component, so their icons never ship as JavaScript.
 */
export function SiteHeader() {
  const entries: HeaderEntry[] = primaryNav.map((entry) =>
    isNavGroup(entry) ? { label: entry.label, panel: <MenuPanel group={entry} /> } : entry,
  );

  return (
    <header className="sticky top-0 z-40 header-lift border-b border-line bg-surface">
      <div className="container-page flex h-(--header-height) items-center">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the only route in this app; see SiteLink */}
        <a href="/" className="inline-flex min-h-11 shrink-0 items-center rounded-sm text-ink">
          <Logo className="h-6 w-auto lg:h-7" />
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
    </header>
  );
}

const panelWidthClasses = {
  1: "w-menu-sm",
  2: "w-menu-md",
  3: "w-menu-lg",
} as const;

function MenuPanel({ group }: { group: NavGroup }) {
  const columns: keyof typeof panelWidthClasses = group.aside ? 3 : group.items.length > 4 ? 1 : 2;
  return (
    <div
      className={cx(
        "pop-in overflow-hidden rounded-md border border-line bg-surface shadow-overlay",
        panelWidthClasses[columns],
      )}
    >
      <div
        className={cx(
          "grid gap-1 p-2",
          group.aside ? "grid-cols-5" : columns === 2 ? "grid-cols-2" : "grid-cols-1",
        )}
      >
        <ul
          className={cx("grid gap-1", group.aside ? "col-span-3" : columns === 2 && "col-span-2 grid-cols-2")}
        >
          {group.items.map((item) => (
            <li key={item.href}>
              <MenuItem item={item} />
            </li>
          ))}
        </ul>
        {group.aside ? (
          <div className="col-span-2 rounded-sm bg-tint p-3">
            <p className="text-micro font-semibold text-ink-muted">{group.aside.title}</p>
            <ul className="mt-2 grid gap-1">
              {group.aside.items.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="block rounded-sm p-2 hover:bg-surface">
                    <span className="block text-small font-semibold text-ink">{item.label}</span>
                    <span className="block text-micro text-ink-muted">{item.description}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      {group.footer ? (
        <a
          href={group.footer.href}
          className="group flex min-h-12 items-center gap-1.5 border-t border-line bg-canvas px-5 text-small font-semibold text-accent-ink hover:bg-tint"
        >
          {group.footer.label}
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-0.5"
          />
        </a>
      ) : null}
    </div>
  );
}

function ItemIcon({ name }: { name: MenuIcon }) {
  const Icon = menuIcons[name];
  return <Icon aria-hidden="true" className="size-5" />;
}

function MenuItem({ item }: { item: NavLink }) {
  return (
    <a href={item.href} className="group flex gap-3 rounded-sm p-3 hover:bg-tint">
      {item.icon ? (
        <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-accent-subtle text-accent-ink transition-colors group-hover:bg-accent group-hover:text-on-accent">
          <ItemIcon name={item.icon} />
        </span>
      ) : null}
      <span className="min-w-0">
        <span className="block text-small font-semibold text-ink">{item.label}</span>
        {item.description ? (
          <span className="block text-micro text-ink-muted">{item.description}</span>
        ) : null}
      </span>
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
                <ul className="grid gap-1 pb-4">
                  {[...entry.items, ...(entry.aside?.items ?? [])].map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="flex min-h-12 items-center gap-3 rounded-sm px-2 hover:bg-tint"
                      >
                        {item.icon ? (
                          <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-accent-subtle text-accent-ink">
                            <ItemIcon name={item.icon} />
                          </span>
                        ) : null}
                        <span className="text-body font-semibold">{item.label}</span>
                        {item.comingSoon ? (
                          <span className="ml-auto rounded-full bg-tint px-2 py-0.5 text-nano font-semibold text-ink-muted">
                            Soon
                          </span>
                        ) : null}
                      </a>
                    </li>
                  ))}
                  {entry.footer ? (
                    <li>
                      <a
                        href={entry.footer.href}
                        className="flex min-h-12 items-center gap-1.5 px-2 text-small font-semibold text-accent-ink"
                      >
                        {entry.footer.label}
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </a>
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
