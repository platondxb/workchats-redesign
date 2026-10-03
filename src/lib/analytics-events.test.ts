import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { analyticsEventsScript } from "./analytics-events";

type Gtag = (command: string, name: string, params: Record<string, unknown>) => void;
const win = window as unknown as { gtag?: Gtag };

beforeAll(() => {
  // Installed once, as the layout's <head> script is. Running the exact inline string is the point here.
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call
  new Function(analyticsEventsScript)();
});

afterEach(() => {
  delete win.gtag;
  document.body.innerHTML = "";
  document.documentElement.removeAttribute("data-os");
});

function click(html: string) {
  document.body.innerHTML = html;
  (document.body.firstElementChild as HTMLElement).click();
}

describe("analytics events", () => {
  it("sends nothing before consent, when gtag hasn't been loaded", () => {
    expect(() => click('<a href="#x" data-cta="hero">Start free</a>')).not.toThrow();
    expect(win.gtag).toBeUndefined();
  });

  it("records a call to action with where it was pressed", () => {
    const gtag = vi.fn<Gtag>();
    win.gtag = gtag;
    click('<a href="#x" data-cta="hero">Start free</a>');
    expect(gtag).toHaveBeenCalledWith("event", "cta_click", { location: "hero", label: "Start free" });
  });

  it("records a download with its platform, and the detected one for the device-aware button", () => {
    const gtag = vi.fn<Gtag>();
    win.gtag = gtag;
    click('<button type="button" data-download="linux" data-location="downloads">Linux</button>');
    expect(gtag).toHaveBeenLastCalledWith("event", "download_click", {
      platform: "linux",
      location: "downloads",
    });
    document.documentElement.setAttribute("data-os", "macos");
    click('<a href="#download" data-download="auto" data-location="hero">Download for macOS</a>');
    expect(gtag).toHaveBeenLastCalledWith("event", "download_click", { platform: "macos", location: "hero" });
  });

  it("records the billing period, the currency and the calculator", () => {
    const gtag = vi.fn<Gtag>();
    win.gtag = gtag;
    document.body.innerHTML = `
      <input type="radio" name="billing" value="monthly">
      <input type="radio" name="currency" value="EUR">
      <input type="radio" name="cost-currency" value="AED">
      <input type="range" id="team-size" min="10" max="200" value="120">`;
    const fire = (selector: string) =>
      document.querySelector(selector)?.dispatchEvent(new Event("change", { bubbles: true }));
    fire('[name="billing"]');
    fire('[name="currency"]');
    fire('[name="cost-currency"]');
    fire("#team-size");
    expect(gtag.mock.calls.map((call) => [call[1], call[2]])).toEqual([
      ["pricing_period_change", { period: "monthly" }],
      ["pricing_currency_change", { currency: "EUR", location: "pricing" }],
      ["pricing_currency_change", { currency: "AED", location: "calculator" }],
      ["calculator_change", { team_size: 120 }],
    ]);
  });

  it("records a question opening in the FAQ", () => {
    const gtag = vi.fn<Gtag>();
    win.gtag = gtag;
    document.body.innerHTML = '<details data-faq="switching" open><summary>Q</summary></details>';
    document.querySelector("details")?.dispatchEvent(new Event("toggle"));
    expect(gtag).toHaveBeenCalledWith("event", "faq_open", { question: "switching" });
  });
});
