import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { metaColours } from "@/styles/meta-colours";
import { themeScript, themeStorageKey } from "./theme";

const root = document.documentElement;

describe("the inline theme script", () => {
  // The script listens on `document`, so each run's listeners are collected and removed afterwards.
  const added: [string, EventListenerOrEventListenerObject][] = [];

  beforeEach(() => {
    const add = document.addEventListener.bind(document);
    vi.spyOn(document, "addEventListener").mockImplementation(
      (type: string, listener: EventListenerOrEventListenerObject) => {
        added.push([type, listener]);
        add(type, listener);
      },
    );
    document.head.innerHTML = `<meta name="theme-color" content="${metaColours.night}">`;
    document.body.innerHTML = `<button data-theme-toggle aria-label="Switch to light theme"><svg></svg></button>`;
  });

  afterEach(() => {
    for (const [type, listener] of added.splice(0)) document.removeEventListener(type, listener);
    vi.restoreAllMocks();
    root.removeAttribute("data-theme");
    localStorage.clear();
  });

  // The same string the layout puts in <head>; running that exact string is the point of this test.
  const run = () => {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call
    new Function(themeScript)();
  };
  const toggle = () => document.querySelector<HTMLElement>("[data-theme-toggle]");
  const meta = () => document.querySelector('meta[name="theme-color"]')?.getAttribute("content");

  it("starts dark, before anything paints", () => {
    run();
    expect(root).toHaveAttribute("data-theme", "dark");
  });

  it("starts light for a visitor who chose light before", () => {
    localStorage.setItem(themeStorageKey, "light");
    run();
    expect(root).toHaveAttribute("data-theme", "light");
  });

  it("starts dark when the saved value is anything else, or storage can't be read", () => {
    localStorage.setItem(themeStorageKey, "sepia");
    run();
    expect(root).toHaveAttribute("data-theme", "dark");

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    run();
    expect(root).toHaveAttribute("data-theme", "dark");
  });

  it("flips the theme when a theme button is pressed, remembers it, and flips back", () => {
    run();
    toggle()
      ?.querySelector("svg")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(root).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem(themeStorageKey)).toBe("light");

    toggle()?.click();
    expect(root).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem(themeStorageKey)).toBe("dark");
  });

  it("keeps the browser's theme colour and the button's name in step with the theme", () => {
    run();
    toggle()?.click();
    expect(meta()).toBe(metaColours.day);
    expect(toggle()).toHaveAttribute("aria-label", "Switch to dark theme");

    toggle()?.click();
    expect(meta()).toBe(metaColours.night);
    expect(toggle()).toHaveAttribute("aria-label", "Switch to light theme");
  });

  it("renames the buttons once the page has loaded, for a visitor who starts on light", () => {
    localStorage.setItem(themeStorageKey, "light");
    run();
    document.dispatchEvent(new Event("DOMContentLoaded"));
    expect(toggle()).toHaveAttribute("aria-label", "Switch to dark theme");
    expect(meta()).toBe(metaColours.day);
  });

  it("works for a button that arrives later, such as the one in the phone menu", () => {
    run();
    document.body.insertAdjacentHTML("beforeend", `<button id="late" data-theme-toggle>Light theme</button>`);
    document.getElementById("late")?.click();
    expect(root).toHaveAttribute("data-theme", "light");
  });

  it("ignores everything that is not a theme button, and still switches if storage is blocked", () => {
    run();
    document.body.insertAdjacentHTML("beforeend", `<button id="other">Other</button>`);
    document.getElementById("other")?.click();
    expect(root).toHaveAttribute("data-theme", "dark");

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    toggle()?.click();
    expect(root).toHaveAttribute("data-theme", "light");
  });
});
