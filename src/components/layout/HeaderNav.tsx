"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

/** A top-level entry: a plain link, or a group whose menu panel is rendered on the server. */
export type HeaderEntry = { label: string; href: string } | { label: string; panel: ReactNode };

interface HeaderNavProps {
  entries: HeaderEntry[];
  /** The phone menu's navigation, rendered on the server. */
  mobileNav: ReactNode;
  /**
   * The header's actions, rendered on the server: `desktop` beside the links from lg, `primary` (Start free)
   * at every width, and `menu`, the stacked actions at the foot of the phone menu.
   */
  actions: { desktop: ReactNode; primary: ReactNode; menu: ReactNode };
  /** Icons are rendered on the server and passed in, so no icon code ships to the browser. */
  icons: { caret: ReactNode; menu: ReactNode; close: ReactNode };
}

/**
 * Header navigation.
 *
 * Desktop: disclosure menus (a button and a panel of links), between the logo and the actions.
 * They open on click, Enter or Space, and on hover with a short delay for mouse users; Escape, a click
 * outside, or moving focus or the pointer away closes them. Panels are rendered on the server and only
 * mounted once first opened, which keeps them out of the initial DOM.
 *
 * Phones: a modal <dialog>, which gives focus trapping, Escape to close and an inert page behind it.
 */
export function HeaderNav({ entries, mobileNav, actions, icons }: HeaderNavProps) {
  return (
    <>
      <DesktopNav entries={entries} caret={icons.caret} />
      <div className="flex shrink-0 nav-gather-end items-center gap-2">
        <div className="hidden items-center gap-2 lg:flex">{actions.desktop}</div>
        {actions.primary}
        <MobileMenu nav={mobileNav} actions={actions.menu} icons={icons} />
      </div>
    </>
  );
}

const HOVER_OPEN_DELAY = 80;
const HOVER_CLOSE_DELAY = 180;

function DesktopNav({ entries, caret }: { entries: HeaderEntry[]; caret: ReactNode }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState<ReadonlySet<number>>(() => new Set());
  const navRef = useRef<HTMLElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const openedByHoverAt = useRef(0);
  const baseId = useId();

  const open = useCallback((index: number | null) => {
    window.clearTimeout(hoverTimer.current);
    setOpenIndex(index);
    if (index !== null)
      setMounted((previous) => (previous.has(index) ? previous : new Set(previous).add(index)));
  }, []);

  useEffect(() => {
    if (openIndex === null) return;
    const openItem = () => navRef.current?.querySelector<HTMLElement>(`[data-menu-item="${openIndex}"]`);
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) open(null);
    };
    // Close when keyboard focus moves out of the open menu (to another item or out of the header).
    const onFocusIn = (event: FocusEvent) => {
      if (!openItem()?.contains(event.target as Node)) open(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const button = openItem()?.querySelector<HTMLButtonElement>("button");
      open(null);
      button?.focus();
    };
    // Following a link inside the panel closes it.
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("a") && openItem()?.contains(target)) open(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
    };
  }, [openIndex, open]);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  return (
    <nav ref={navRef} aria-label="Main" className="hidden lg:block">
      <ul className="flex items-center xl:gap-1">
        {entries.map((entry, index) => {
          if (!("panel" in entry)) {
            return (
              <li key={entry.label}>
                <a
                  href={entry.href}
                  className="inline-flex min-h-11 items-center rounded-full px-2.5 text-small font-semibold text-on-night-muted hover:text-on-night xl:px-4"
                >
                  {entry.label}
                </a>
              </li>
            );
          }
          const isOpen = openIndex === index;
          const panelId = `${baseId}-menu-${index}`;
          return (
            <li
              key={entry.label}
              className="relative"
              data-menu-item={index}
              onPointerEnter={(event) => {
                if (event.pointerType !== "mouse") return;
                window.clearTimeout(hoverTimer.current);
                hoverTimer.current = window.setTimeout(() => {
                  openedByHoverAt.current = Date.now();
                  open(index);
                }, HOVER_OPEN_DELAY);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType !== "mouse") return;
                window.clearTimeout(hoverTimer.current);
                hoverTimer.current = window.setTimeout(() => {
                  setOpenIndex((current) => (current === index ? null : current));
                }, HOVER_CLOSE_DELAY);
              }}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => {
                  // A click right after a hover-open confirms the menu rather than closing it again.
                  if (isOpen && Date.now() - openedByHoverAt.current < 600) return;
                  open(isOpen ? null : index);
                }}
                className="group inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 text-small font-semibold text-on-night-muted hover:text-on-night aria-expanded:text-on-night xl:px-4"
              >
                {entry.label}
                {caret}
              </button>
              <div
                id={panelId}
                hidden={!isOpen}
                className="absolute top-full left-1/2 z-menu -translate-x-1/2 pt-3"
              >
                {mounted.has(index) ? entry.panel : null}
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobileMenu({
  nav,
  actions,
  icons,
}: {
  nav: ReactNode;
  actions: ReactNode;
  icons: HeaderNavProps["icons"];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const close = useCallback(() => dialogRef.current?.close(), []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setOpen(false);
    // A click on the backdrop lands on the <dialog> element itself; a click on any link closes the menu.
    const onClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target === dialog || target.closest("a")) dialog.close();
    };
    // Close if the viewport grows into the desktop layout while the menu is open.
    const desktop = window.matchMedia("(width >= 64rem)");
    const onResize = () => {
      if (desktop.matches) dialog.close();
    };
    dialog.addEventListener("close", onClose);
    dialog.addEventListener("click", onClick);
    desktop.addEventListener("change", onResize);
    return () => {
      dialog.removeEventListener("close", onClose);
      dialog.removeEventListener("click", onClick);
      desktop.removeEventListener("change", onResize);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("overflow-hidden", open);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setMounted(true);
          setOpen(true);
          dialogRef.current?.showModal();
        }}
        className="inline-flex size-11 items-center justify-center rounded-full text-on-night hover:bg-glass-fill lg:hidden"
      >
        {icons.menu}
        <span className="sr-only">Menu</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-0 h-dvh max-h-dvh w-full max-w-full sheet overflow-y-auto bg-night p-0 text-on-night backdrop:bg-night/70"
      >
        {/* Mounted on first open only, so the menu adds nothing to the initial DOM. */}
        {mounted ? (
          <div className="flex min-h-full flex-col px-(--gutter) pb-8">
            <div className="flex h-(--header-height) shrink-0 items-center justify-between">
              <h2 id={titleId} className="text-small font-semibold text-on-night-muted">
                Menu
              </h2>
              <button
                type="button"
                onClick={close}
                className="inline-flex size-11 items-center justify-center rounded-full text-on-night hover:bg-glass-fill"
              >
                {icons.close}
                <span className="sr-only">Close menu</span>
              </button>
            </div>

            {nav}

            <div className="mt-auto grid gap-3 pt-8">{actions}</div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
