"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { buttonClasses } from "@/components/ui/button-classes";

/** A top-level entry: a plain link, or a group whose menu panel is rendered on the server. */
export type HeaderEntry = { label: string; href: string } | { label: string; panel: ReactNode };

interface HeaderLink {
  label: string;
  href: string;
}

interface HeaderNavProps {
  entries: HeaderEntry[];
  /** The phone menu's navigation, rendered on the server. */
  mobileNav: ReactNode;
  signIn: HeaderLink;
  demo: HeaderLink;
  start: HeaderLink;
  /** Icons are rendered on the server and passed in, so no icon code ships to the browser. */
  icons: { caret: ReactNode; menu: ReactNode; close: ReactNode };
}

/**
 * Header navigation.
 *
 * Desktop: disclosure menus (a button and a panel of links). They open on click, Enter or Space, and
 * on hover with a short delay for mouse users; Escape, a click outside, or moving focus or the pointer
 * away closes them. Panels are rendered on the server and only mounted once first opened, which keeps
 * them out of the initial DOM.
 *
 * Phones: a modal <dialog>, which gives focus trapping, Escape to close and an inert page behind it.
 */
export function HeaderNav({ entries, mobileNav, signIn, demo, start, icons }: HeaderNavProps) {
  return (
    <>
      <DesktopNav entries={entries} caret={icons.caret} />
      <div className="ml-auto flex items-center gap-2 lg:gap-3">
        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={signIn.href}
            className="inline-flex min-h-11 items-center rounded-full px-3 text-small font-semibold whitespace-nowrap text-ink hover:bg-tint xl:px-4"
          >
            {signIn.label}
          </a>
          <a href={demo.href} className={buttonClasses("secondary", "sm")}>
            {demo.label}
          </a>
        </div>
        <a href={start.href} className={buttonClasses("primary", "sm")}>
          {start.label}
        </a>
        <MobileMenu nav={mobileNav} signIn={signIn} demo={demo} start={start} icons={icons} />
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
    <nav ref={navRef} aria-label="Main" className="ml-4 hidden lg:block xl:ml-8">
      <ul className="flex items-center gap-1">
        {entries.map((entry, index) => {
          if (!("panel" in entry)) {
            return (
              <li key={entry.label}>
                <a
                  href={entry.href}
                  className="inline-flex min-h-11 items-center rounded-full px-3 text-small font-semibold text-ink hover:bg-tint xl:px-4"
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
                className="group inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-small font-semibold text-ink hover:bg-tint aria-expanded:bg-tint xl:px-4"
              >
                {entry.label}
                {caret}
              </button>
              <div id={panelId} hidden={!isOpen} className="absolute top-full left-0 z-50 pt-3">
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
  signIn,
  demo,
  start,
  icons,
}: {
  nav: ReactNode;
  signIn: HeaderLink;
  demo: HeaderLink;
  start: HeaderLink;
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
        className="inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-tint lg:hidden"
      >
        {icons.menu}
        <span className="sr-only">Menu</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-0 h-dvh max-h-dvh w-full max-w-full sheet overflow-y-auto bg-canvas p-0 text-ink backdrop:bg-ink/40"
      >
        {/* Mounted on first open only, so the menu adds nothing to the initial DOM. */}
        {mounted ? (
          <div className="flex min-h-full flex-col px-(--gutter) pb-8">
            <div className="flex h-(--header-height) shrink-0 items-center justify-between">
              <h2 id={titleId} className="text-small font-semibold text-ink-muted">
                Menu
              </h2>
              <button
                type="button"
                onClick={close}
                className="inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-tint"
              >
                {icons.close}
                <span className="sr-only">Close menu</span>
              </button>
            </div>

            {nav}

            <div className="mt-auto grid gap-3 pt-8">
              <a href={start.href} className={buttonClasses("primary", "md")}>
                {start.label}
              </a>
              <a href={demo.href} className={buttonClasses("secondary", "md")}>
                {demo.label}
              </a>
              <a href={signIn.href} className={buttonClasses("ghost", "md")}>
                {signIn.label}
              </a>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
