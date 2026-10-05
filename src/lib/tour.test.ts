import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { home } from "@/content/home";
import { tourScript } from "./tour";

/** The tour's markup, as HeroDevices.tsx renders it, cut down to what the script touches. */
const markup = `
  <div id="hero-tour" class="tour">
    <div role="img">
      ${home.hero.tour.stops.map((stop) => `<div data-stop="${stop}"></div>`).join("")}
    </div>
  </div>`;

/** How long a part stays, and how long after the page has loaded the tour starts. */
const step = 2000;
const startsAfter = 1200;

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
const devices = () => document.querySelector("[role='img']");
const pointer = (type: string, pointerType: string) => {
  const event = new MouseEvent(type);
  Object.defineProperty(event, "pointerType", { value: pointerType });
  return event;
};

/** Stubs an IntersectionObserver that starts off screen and reports whatever the test says. */
function stubOffScreen() {
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
  return (isIntersecting: boolean) => report?.([{ isIntersecting }]);
}

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

  it("starts soon after the page has loaded, with the first part", () => {
    mockMotion(false);
    run();
    expect(root()).not.toHaveAttribute("data-current");
    vi.advanceTimersByTime(startsAfter);
    expect(root()).toHaveAttribute("data-current", "chats");
    // The next part's screens are put in place, invisibly, so their images are ready in time.
    expect(root()).toHaveAttribute("data-preload", "contacts");
  });

  it("goes through the app's parts in the order of its sidebar, and round again", () => {
    mockMotion(false);
    run();
    vi.advanceTimersByTime(startsAfter);
    const seen = [root()?.dataset.current];
    for (let part = 0; part < 5; part++) {
      vi.advanceTimersByTime(step);
      seen.push(root()?.dataset.current);
    }
    expect(seen).toEqual(["chats", "contacts", "schedule", "calls", "tasks", "chats"]);
    expect(root()).toHaveAttribute("data-preload", "contacts");
  });

  it("goes round without end: after a hundred parts it is where the order says it should be", () => {
    mockMotion(false);
    run();
    vi.advanceTimersByTime(startsAfter + 100 * step);
    const { stops } = home.hero.tour;
    expect(root()).toHaveAttribute("data-current", stops[100 % stops.length]);
    expect(root()).toHaveAttribute("data-preload", stops[101 % stops.length]);
  });

  it("is not held by a mouse resting on the devices, or by a touch", () => {
    mockMotion(false);
    run();
    vi.advanceTimersByTime(startsAfter);
    devices()?.dispatchEvent(pointer("pointerenter", "mouse"));
    vi.advanceTimersByTime(step);
    expect(root()).toHaveAttribute("data-current", "contacts");
    devices()?.dispatchEvent(pointer("pointerenter", "touch"));
    vi.advanceTimersByTime(step);
    expect(root()).toHaveAttribute("data-current", "schedule");
  });

  it("plays only while the devices are on screen", () => {
    mockMotion(false);
    const onScreen = stubOffScreen();
    run();
    vi.advanceTimersByTime(startsAfter + step);
    expect(root()).not.toHaveAttribute("data-current");
    expect(root()).not.toHaveAttribute("data-preload");
    onScreen(true);
    expect(root()).toHaveAttribute("data-current", "chats");
    vi.advanceTimersByTime(step);
    expect(root()).toHaveAttribute("data-current", "contacts");
    onScreen(false);
    vi.advanceTimersByTime(3 * step);
    expect(root()).toHaveAttribute("data-current", "contacts");
    onScreen(true);
    vi.advanceTimersByTime(step);
    expect(root()).toHaveAttribute("data-current", "schedule");
  });

  it("does nothing with Save-Data, so no screen is fetched that the visitor did not ask to see", () => {
    mockMotion(false);
    vi.stubGlobal("navigator", { ...navigator, connection: { saveData: true } });
    run();
    vi.advanceTimersByTime(startsAfter + 5 * step);
    expect(root()).not.toHaveAttribute("data-current");
    expect(root()).not.toHaveAttribute("data-preload");
  });

  it("does nothing with reduced motion: the first screen stays", () => {
    mockMotion(true);
    run();
    vi.advanceTimersByTime(startsAfter + 5 * step);
    expect(root()).not.toHaveAttribute("data-current");
    expect(root()).not.toHaveAttribute("data-preload");
  });
});
