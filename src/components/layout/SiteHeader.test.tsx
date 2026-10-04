import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./SiteHeader";

beforeAll(() => {
  // jsdom implements neither matchMedia nor modal dialogs.
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

/** Opens a desktop menu and returns its panel. */
async function openMenu(name: string): Promise<HTMLElement> {
  const user = userEvent.setup();
  const trigger = screen.getByRole("button", { name });
  await user.click(trigger);
  const panel = document.getElementById(trigger.getAttribute("aria-controls") ?? "");
  if (!panel) throw new Error(`no panel for ${name}`);
  return panel;
}

describe("SiteHeader", () => {
  it("gathers into a floating glass bar as the page scrolls", () => {
    const { container } = render(<SiteHeader />);
    const glass = container.querySelector("header [aria-hidden='true']");
    expect(glass).toHaveClass("nav-glass", "bg-night-glass", "shadow-float", "backdrop-blur-glass");
    // The logo and the actions start wide and slide in as the glass appears (transform only).
    expect(container.querySelector(".nav-gather-start")).toHaveAttribute("href", "/");
    expect(container.querySelector(".nav-gather-end")).not.toBeNull();
  });

  it("keeps Sign in and Download beside Start free, and has no Book a demo", () => {
    render(<SiteHeader />);
    for (const name of ["Sign in", "Download", "Start free"]) {
      expect(screen.getByRole("link", { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole("link", { name: "Book a demo" })).not.toBeInTheDocument();
    // Download goes to the platforms on this page and reports the visitor's platform.
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute("href", "#download");
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute("data-download", "auto");
    expect(screen.getByRole("link", { name: "Start free" })).toHaveAttribute("data-cta", "header");
  });

  it("puts one theme button just before Download, named for what it does next", () => {
    render(<SiteHeader />);
    const buttons = screen.getAllByRole("button", { name: "Switch to light theme" });
    expect(buttons).toHaveLength(1);
    const [theme] = buttons;
    expect(theme).toHaveAttribute("data-theme-toggle");
    expect(theme).toHaveAttribute("type", "button");
    // Both icons are in the HTML and CSS shows one, so the right one is there before the first paint.
    expect(theme?.querySelectorAll("svg")).toHaveLength(2);
    const download = screen.getByRole("link", { name: "Download" });
    expect(theme?.compareDocumentPosition(download)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    const signIn = screen.getByRole("link", { name: "Sign in" });
    expect(signIn.compareDocumentPosition(theme as Node)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("lays the Features menu out as one grid of rich items, unreleased ones flagged in place", async () => {
    render(<SiteHeader />);
    const panel = await openMenu("Features");
    // Six features in one grid, then the panel's footer.
    const rows = within(panel).getAllByRole("link");
    expect(rows).toHaveLength(7);
    // Every item carries an icon, so a row is recognisable before it is read.
    for (const row of rows.slice(0, 6)) {
      expect(row.querySelector("svg")).not.toBeNull();
    }
    // The one line that says what the feature does.
    expect(panel).toHaveTextContent("One place for every team conversation.");
    // The three unreleased features sit in the same grid, each with its own chip.
    expect(within(panel).getAllByText("Coming soon")).toHaveLength(3);
    expect(within(panel).getByRole("link", { name: "Explore all features" })).toBeInTheDocument();
  });
});
