import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { isNavGroup, primaryNav } from "@/content/navigation";
import { HeaderNav, type HeaderEntry } from "./HeaderNav";

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
  // jsdom can't navigate; keep link clicks on the page so the menus' close-on-click can be observed.
  document.addEventListener("click", (event) => {
    if ((event.target as HTMLElement).closest("a")) event.preventDefault();
  });
});

// Stand-ins for the server-rendered panels: the same links, without the styling.
const entries: HeaderEntry[] = primaryNav.map((entry) =>
  isNavGroup(entry)
    ? {
        label: entry.label,
        panel: (
          <ul>
            {entry.items.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        ),
      }
    : entry,
);

function setup() {
  // The header's markup around the nav: the glass pill the panels are kept inside once the header has gathered.
  render(
    <header>
      <div data-nav-glass="" aria-hidden="true" />
      <HeaderNav
        entries={entries}
        mobileNav={
          <nav aria-label="Main">
            <a href="/pricing">Pricing</a>
          </nav>
        }
        actions={{
          desktop: (
            <>
              <a href="https://app.workchats.com/">Sign in</a>
              <a href="#download">Download</a>
              <a href="/book-a-demo">Book a demo</a>
            </>
          ),
          primary: <a href="https://admin.workchats.com/signup/">Start free</a>,
          menu: (
            <>
              <a href="https://admin.workchats.com/signup/">Start free</a>
              <a href="#download">Download</a>
              <a href="/book-a-demo">Book a demo</a>
              <a href="https://app.workchats.com/">Sign in</a>
            </>
          ),
        }}
        icons={{ caret: <span />, menu: <span />, close: <span /> }}
      />
    </header>,
  );
}

function button(name: string): HTMLElement {
  const [found] = screen.getAllByRole("button", { name });
  if (!found) throw new Error(`no ${name} button`);
  return found;
}

describe("desktop menus", () => {
  it("keep their panels out of the DOM until first opened", () => {
    setup();
    expect(screen.queryByText("Video and meetings")).toBeNull();
  });

  it("open on click, expose aria-expanded and show their links", async () => {
    const user = userEvent.setup();
    setup();
    const features = button("Features");
    expect(features).toHaveAttribute("aria-expanded", "false");
    await user.click(features);
    expect(features).toHaveAttribute("aria-expanded", "true");
    const panel = document.getElementById(features.getAttribute("aria-controls") ?? "");
    expect(panel).toBeVisible();
    expect(panel).toHaveTextContent("Video and meetings");
  });

  it("open with Enter and close with Escape, returning focus to the button", async () => {
    const user = userEvent.setup();
    setup();
    const solutions = button("Solutions");
    solutions.focus();
    await user.keyboard("{Enter}");
    expect(solutions).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(solutions).toHaveAttribute("aria-expanded", "false");
    expect(solutions).toHaveFocus();
  });

  it("keep only one menu open at a time", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(button("Features"));
    await user.click(button("Resources"));
    expect(button("Features")).toHaveAttribute("aria-expanded", "false");
    expect(button("Resources")).toHaveAttribute("aria-expanded", "true");
  });

  it("open on mouse hover and close when the pointer leaves", async () => {
    const user = userEvent.setup();
    setup();
    const features = button("Features");
    await user.hover(features);
    await waitFor(() => expect(features).toHaveAttribute("aria-expanded", "true"));
    await user.unhover(features);
    await waitFor(() => expect(features).toHaveAttribute("aria-expanded", "false"));
  });

  it("close when a link in the panel is followed", async () => {
    const user = userEvent.setup();
    setup();
    const features = button("Features");
    await user.click(features);
    await user.click(screen.getByRole("link", { name: "Video and meetings" }));
    expect(features).toHaveAttribute("aria-expanded", "false");
  });
});

/**
 * jsdom has no layout, so the boxes are given: the glass pill, and the open panel where it hangs when it is
 * simply centred under its button.
 */
function box(left: number, right: number): DOMRect {
  return { left, right, width: right - left, top: 0, bottom: 0, x: left, y: 0, height: 0 } as DOMRect;
}

async function openFeatures(pill: [number, number], panel: [number, number]) {
  const user = userEvent.setup();
  setup();
  const glass = document.querySelector<HTMLElement>("[data-nav-glass]");
  const features = button("Features");
  const wrapper = document.getElementById(features.getAttribute("aria-controls") ?? "");
  if (!glass || !wrapper) throw new Error("the header's markup is missing");
  const glassBox = vi.spyOn(glass, "getBoundingClientRect").mockReturnValue(box(...pill));
  const panelBox = vi.spyOn(wrapper, "getBoundingClientRect").mockReturnValue(box(...panel));
  await user.click(features);
  return { user, wrapper, features, glassBox, panelBox };
}

const overhang = (wrapper: HTMLElement | null) => wrapper?.style.getPropertyValue("--menu-overhang");

describe("desktop menu panels and the glass pill", () => {
  afterEach(() => vi.restoreAllMocks());

  it("measure how far they stick out past the pill's left end", async () => {
    const { wrapper } = await openFeatures([100, 900], [50, 754]);
    expect(overhang(wrapper)).toBe("50px");
  });

  it("measure how far they stick out past its right end too", async () => {
    const { wrapper } = await openFeatures([100, 900], [400, 1104]);
    expect(overhang(wrapper)).toBe("-204px");
  });

  it("measure nothing when they already fit", async () => {
    const { wrapper } = await openFeatures([100, 900], [150, 854]);
    expect(overhang(wrapper)).toBe("0px");
  });

  it("line up with the pill's left end when they are wider than the pill", async () => {
    const { wrapper } = await openFeatures([100, 500], [50, 754]);
    expect(overhang(wrapper)).toBe("50px");
  });

  it("measure where the panel hangs when centred, whatever the scroll has moved it by", async () => {
    // The CSS moves the panel by a share of the overhang as the page scrolls; the measure has to start from
    // the centred position, so the overhang is reset to nothing while it is taken.
    const { wrapper, panelBox } = await openFeatures([100, 900], [50, 754]);
    const seen: (string | undefined)[] = [];
    panelBox.mockImplementation(() => {
      seen.push(overhang(wrapper));
      return box(50, 754);
    });
    window.dispatchEvent(new Event("resize"));
    expect(seen).toEqual(["0px"]);
    expect(overhang(wrapper)).toBe("50px");
  });

  it("are measured again when the window is resized while they are open", async () => {
    const { wrapper, glassBox } = await openFeatures([100, 900], [50, 754]);
    expect(overhang(wrapper)).toBe("50px");
    glassBox.mockReturnValue(box(20, 900));
    window.dispatchEvent(new Event("resize"));
    expect(overhang(wrapper)).toBe("0px");
  });

  it("don't read anything as the page scrolls: the CSS does that part", async () => {
    const { wrapper, glassBox, panelBox } = await openFeatures([100, 900], [50, 754]);
    const reads = glassBox.mock.calls.length + panelBox.mock.calls.length;
    window.dispatchEvent(new Event("scroll"));
    expect(glassBox.mock.calls.length + panelBox.mock.calls.length).toBe(reads);
    expect(overhang(wrapper)).toBe("50px");
  });

  it("give the position back when they close", async () => {
    const { user, wrapper } = await openFeatures([100, 900], [50, 754]);
    expect(overhang(wrapper)).toBe("50px");
    await user.keyboard("{Escape}");
    expect(overhang(wrapper)).toBe("");
  });
});

describe("phone menu", () => {
  it("opens a labelled dialog with the navigation and every action", async () => {
    const user = userEvent.setup();
    setup();
    const trigger = screen.getByRole("button", { name: "Menu" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    const links = Array.from(dialog.querySelectorAll("a")).map((a) => a.textContent);
    expect(links).toEqual(
      expect.arrayContaining(["Pricing", "Start free", "Download", "Book a demo", "Sign in"]),
    );
  });

  it("closes with the close button and when a link is followed", async () => {
    const user = userEvent.setup();
    setup();
    const trigger = screen.getByRole("button", { name: "Menu" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    const pricing = Array.from(dialog.querySelectorAll("a")).find((a) => a.textContent === "Pricing");
    if (!pricing) throw new Error("no Pricing link in the menu");
    await user.click(pricing);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
