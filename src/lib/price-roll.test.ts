import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { priceRollScript } from "./price-roll";

/*
 * jsdom has no layout, so the parts of the script that ask the browser where things are (offsetParent,
 * offsetLeft, getBoundingClientRect) are given simple answers: a figure is "shown" unless it is marked
 * hidden, and everything is on screen. What is under test is the script's own logic: which characters roll,
 * when a roll may start, and that it cleans up after itself. The pixels are checked in e2e/price-roll.spec.ts.
 */

describe("the inline price-roll script", () => {
  // The script listens on `document`, so each run's listeners are collected and removed afterwards.
  const added: [string, EventListenerOrEventListenerObject][] = [];
  let frames: FrameRequestCallback[] = [];

  beforeEach(() => {
    const add = document.addEventListener.bind(document);
    vi.spyOn(document, "addEventListener").mockImplementation(
      (type: string, listener: EventListenerOrEventListenerObject) => {
        added.push([type, listener]);
        add(type, listener);
      },
    );
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback));
    Object.defineProperty(HTMLElement.prototype, "offsetParent", {
      configurable: true,
      get(this: HTMLElement) {
        return this.hasAttribute("data-off") ? null : document.body;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "offsetLeft", { configurable: true, get: () => 0 });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 140,
    } as DOMRect);
    document.body.innerHTML = `
      <input type="radio" name="currency" id="usd">
      <input type="range" id="slider" min="1" max="500" value="50">
      <p id="host" data-roll="">
        <span data-currency="GBP">£3</span><span data-currency="EUR" data-off="">€3.50</span>
      </p>`;
  });

  afterEach(() => {
    for (const [type, listener] of added.splice(0)) document.removeEventListener(type, listener);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    frames = [];
  });

  const run = () => {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call
    new Function(priceRollScript)();
  };
  const host = () => document.getElementById("host")!;
  const overlay = () => host().querySelector<HTMLElement>(".price-roll");
  const cells = () => host().querySelectorAll(".price-roll-cell");
  /** Shows one figure, as the CSS does when a switch changes. */
  const show = (code: string, text?: string) => {
    for (const figure of host().querySelectorAll<HTMLElement>("[data-currency]")) {
      if (figure.dataset.currency === code) {
        figure.removeAttribute("data-off");
        if (text) figure.textContent = text;
      } else figure.setAttribute("data-off", "");
    }
  };
  const flush = () => {
    const pending = frames;
    frames = [];
    for (const frame of pending) frame(0);
  };
  /** A switch is flipped: a radio's change event, and the browser's next frame. */
  const flip = () => {
    document.getElementById("usd")?.dispatchEvent(new Event("change", { bubbles: true }));
    flush();
  };
  const switchTo = (code: string, text?: string) => {
    show(code, text);
    flip();
  };
  /** Changes the one figure that is shown, as a billing switch does. */
  const reprice = (text: string) => {
    host().firstElementChild!.textContent = text;
    flip();
  };
  const finish = () => {
    // Every cell has two animations, one per pseudo-element, and the roll ends after the last.
    const ending = overlay();
    const animations = cells().length * 2;
    for (let i = 0; i < animations; i++) ending?.dispatchEvent(new Event("animationend"));
  };

  it("is plain ES5, which every browser runs", () => {
    expect(priceRollScript).not.toMatch(
      /=>|\blet\b|\bconst\b|`|\.find\(|\.includes\(|\.startsWith\(|\.padStart\(/,
    );
    run();
  });

  it("builds nothing at rest, or when the page loads", () => {
    run();
    expect(overlay()).toBeNull();
    expect(host()).not.toHaveClass("price-rolling");
  });

  it("rolls only the characters that changed, and keeps the rest still", () => {
    run();
    switchTo("EUR");
    // £3 to €3.50: the symbol, and ".50" arriving; the 3 stays.
    expect(cells()).toHaveLength(4);
    // The 3 that stays is plain text in the copy, not an element of its own.
    expect(overlay()?.children).toHaveLength(4);
    expect(overlay()?.textContent).toBe("3");
    expect(cells()[0]).toHaveAttribute("data-old", "£");
    expect(cells()[0]).toHaveAttribute("data-new", "€");
    expect(cells()[1]).not.toHaveAttribute("data-old");
    expect(cells()[1]).toHaveAttribute("data-new", ".");
  });

  it("hides itself from assistive technology and hides the real figure only while it rolls", () => {
    run();
    switchTo("EUR");
    expect(overlay()).toHaveAttribute("aria-hidden", "true");
    expect(host()).toHaveClass("price-rolling");
    finish();
    expect(overlay()).toBeNull();
    expect(host()).not.toHaveClass("price-rolling");
  });

  it("removes the roll even if the browser never says its animations have ended", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    run();
    switchTo("EUR");
    expect(overlay()).not.toBeNull();
    vi.advanceTimersByTime(2500);
    expect(overlay()).toBeNull();
    expect(host()).not.toHaveClass("price-rolling");
    vi.useRealTimers();
  });

  it("aligns a changing amount from its last digit, with the symbol and the commas still", () => {
    host().innerHTML = `<span data-currency="GBP">£9,000</span>`;
    run();
    reprice("£15,744");
    // 9,000 against 15,744, from the right: every digit rolls, the comma stays, and so does the £.
    expect(cells()).toHaveLength(5);
    expect(overlay()?.textContent).toBe("£,");
    expect(overlay()?.style.getPropertyValue("--dir")).toBe("1");
  });

  it("rolls down when the same currency's amount falls", () => {
    host().innerHTML = `<span data-currency="GBP">£4</span>`;
    run();
    reprice("£3");
    expect(overlay()?.style.getPropertyValue("--dir")).toBe("-1");
  });

  it("restarts a roll when a switch is flipped again before it has finished", () => {
    run();
    switchTo("EUR");
    const first = overlay();
    switchTo("GBP");
    expect(host().querySelectorAll(".price-roll")).toHaveLength(1);
    expect(overlay()).not.toBe(first);
    finish();
    expect(overlay()).toBeNull();
    expect(host()).not.toHaveClass("price-rolling");
  });

  it("doesn't roll a figure that is off screen, and leaves nothing behind", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 5000,
      bottom: 5040,
    } as DOMRect);
    run();
    switchTo("EUR");
    expect(overlay()).toBeNull();
    expect(host()).not.toHaveClass("price-rolling");
  });

  it("rolls however many elements the page has: it is not held back by the page's size", () => {
    run();
    // The dev server's page has more elements than the production build's; the roll must not depend on it.
    const filler = document.createElement("div");
    filler.innerHTML = "<i></i>".repeat(1500);
    document.body.append(filler);
    switchTo("EUR");
    expect(overlay()).not.toBeNull();
    expect(cells()).toHaveLength(4);
  });

  it("ignores a range input: a slider moving a figure changes it without rolling", () => {
    host().innerHTML = `<span data-currency="GBP">£1,000</span>`;
    run();
    host().firstElementChild!.textContent = "£2,000";
    document.getElementById("slider")?.dispatchEvent(new Event("input", { bubbles: true }));
    flush();
    expect(overlay()).toBeNull();
    expect(host()).not.toHaveClass("price-rolling");
    expect(added.filter(([type]) => type === "input")).toHaveLength(0);
  });

  it("does nothing under reduced motion: the figure just changes", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    run();
    switchTo("EUR");
    expect(overlay()).toBeNull();
    expect(host()).not.toHaveClass("price-rolling");
    expect(added.filter(([type]) => type === "change" || type === "input")).toHaveLength(0);
  });
});
