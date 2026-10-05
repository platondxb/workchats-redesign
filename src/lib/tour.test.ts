import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { home } from "@/content/home";
import { tourScript } from "./tour";

/** The tour's markup, as HeroDevices.tsx renders it, cut down to what the script touches. */
const markup = `
  <div id="hero-tour" class="tour">
    <div role="img" data-tour-hold>
      ${home.hero.tour.stops.map((stop) => `<div data-stop="${stop}"></div>`).join("")}
    </div>
    <button type="button" data-tour-toggle aria-label="${home.hero.tour.play}">
      <svg><circle class="tour-ring"></circle></svg>
    </button>
  </div>`;

function mockMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({ matches: reduce && query.includes("reduce"), media: query })),
  );
}

// The same string the hero puts on the page; running that exact string is the point of this test.
const run = () => {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call
  new Function(tourScript)();
};
const root = () => document.getElementById("hero-tour");
const toggle = () => document.querySelector<HTMLButtonElement>("[data-tour-toggle]");
const clockRunsOut = () =>
  document.querySelector(".tour-ring")?.dispatchEvent(new Event("animationend", { bubbles: true }));

describe("the hero tour script", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = markup;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("starts soon after the page has loaded, and names its button for what a press does", () => {
    mockMotion(false);
    run();
    expect(root()).not.toHaveAttribute("data-playing");
    vi.advanceTimersByTime(1200);
    expect(root()).toHaveAttribute("data-playing");
    expect(root()).toHaveAttribute("data-current", "chats");
    expect(toggle()).toHaveAttribute("aria-label", home.hero.tour.pause);
    // The next part's screens are put in place, invisibly, so their images are ready in time.
    expect(root()).toHaveAttribute("data-preload", "contacts");
  });

  it("goes through the app's parts in the order of its sidebar, and round again", () => {
    mockMotion(false);
    run();
    vi.advanceTimersByTime(1200);
    const seen = [root()?.dataset.current];
    for (let step = 0; step < 5; step++) {
      const tick = root()?.dataset.tick;
      clockRunsOut();
      // The ring restarts for every part.
      expect(root()?.dataset.tick).not.toBe(tick);
      seen.push(root()?.dataset.current);
    }
    expect(seen).toEqual(["chats", "contacts", "schedule", "calls", "tasks", "chats"]);
  });

  it("stops and resumes with its button, and stays stopped until pressed again", () => {
    mockMotion(false);
    run();
    vi.advanceTimersByTime(1200);
    clockRunsOut();
    toggle()?.click();
    expect(root()).not.toHaveAttribute("data-playing");
    expect(toggle()).toHaveAttribute("aria-label", home.hero.tour.play);
    clockRunsOut();
    expect(root()).toHaveAttribute("data-current", "contacts");
    toggle()?.click();
    expect(root()).toHaveAttribute("data-playing");
    expect(root()).toHaveAttribute("data-current", "contacts");
  });

  it("holds while a mouse rests on the devices", () => {
    mockMotion(false);
    run();
    const devices = document.querySelector("[data-tour-hold]");
    const pointer = (type: string) => {
      const event = new MouseEvent(type);
      Object.defineProperty(event, "pointerType", { value: "mouse" });
      return event;
    };
    devices?.dispatchEvent(pointer("pointerenter"));
    expect(root()).toHaveAttribute("data-paused");
    devices?.dispatchEvent(pointer("pointerleave"));
    expect(root()).not.toHaveAttribute("data-paused");
  });

  it("plays only while the devices are on screen, and a press on pause outlasts scrolling away", () => {
    mockMotion(false);
    let report: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
          report = callback;
        }
        observe() {
          report?.([{ isIntersecting: false }]);
        }
      },
    );
    run();
    vi.advanceTimersByTime(5000);
    expect(root()).not.toHaveAttribute("data-playing");
    expect(root()).not.toHaveAttribute("data-preload");
    report?.([{ isIntersecting: true }]);
    expect(root()).toHaveAttribute("data-playing");
    report?.([{ isIntersecting: false }]);
    expect(root()).not.toHaveAttribute("data-playing");
    report?.([{ isIntersecting: true }]);
    expect(root()).toHaveAttribute("data-playing");
    toggle()?.click();
    report?.([{ isIntersecting: false }]);
    report?.([{ isIntersecting: true }]);
    expect(root()).not.toHaveAttribute("data-playing");
  });

  it("waits for the play button with Save-Data, so no screen is fetched until the visitor asks", () => {
    mockMotion(false);
    vi.stubGlobal("navigator", { ...navigator, connection: { saveData: true } });
    run();
    vi.advanceTimersByTime(5000);
    expect(root()).not.toHaveAttribute("data-playing");
    expect(root()).not.toHaveAttribute("data-preload");
    toggle()?.click();
    expect(root()).toHaveAttribute("data-playing");
  });

  it("does nothing with reduced motion: the first screen stays, and the button (hidden by CSS) does nothing", () => {
    mockMotion(true);
    run();
    vi.advanceTimersByTime(5000);
    toggle()?.click();
    expect(root()).not.toHaveAttribute("data-playing");
    expect(root()).not.toHaveAttribute("data-current");
  });
});
