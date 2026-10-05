import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { findCompetitorNames } from "../src/content/competitors";

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 1024;

const userAgents = {
  macos:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  windows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  unknown: "Mozilla/5.0 (compatible; ExampleBot/1.0)",
};

/** Records the events the page sends, as GA4's gtag would receive them once a visitor has accepted. */
async function stubGtag(page: Page) {
  await page.addInitScript(() => {
    const events: unknown[][] = [];
    Object.assign(window, { __events: events, gtag: (...args: unknown[]) => events.push(args) });
  });
}

const sentEvents = (page: Page) =>
  page.evaluate(() => (window as unknown as { __events?: unknown[][] }).__events ?? []);

test.describe("content and rendering", () => {
  test("serves the full page as HTML, readable without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Team chat, calls and files. Free for up to 5 people.",
    );
    const pro = page.getByRole("article", { name: "Pro" });
    const pricing = page.locator("#pricing");
    await expect(pro.getByText("£3", { exact: true })).toBeVisible();
    // Without JavaScript both pricing switches still work: they're native radios read by CSS.
    await pricing.locator("label", { hasText: "Monthly" }).click();
    await expect(pro.getByText("£4", { exact: true })).toBeVisible();
    await pricing.locator("label").filter({ hasText: /^USD$/ }).click();
    await expect(pro.getByText("$5", { exact: true })).toBeVisible();
    await expect(pro.getByText("£4", { exact: true })).toBeHidden();
    // The calculator's currency switch is CSS-driven too, so its server-rendered totals still convert.
    await expect(page.locator('#cost-stack [data-currency="GBP"]')).toBeVisible();
    await page.locator("#cost label").filter({ hasText: /^USD$/ }).click();
    await expect(page.locator('#cost-stack [data-currency="USD"]')).toBeVisible();
    await expect(page.locator('#cost-stack [data-currency="GBP"]')).toBeHidden();
    // The hero's download keeps its neutral label when the platform can't be read.
    await expect(page.getByRole("link", { name: /^Download the app/ })).toBeVisible();
    await context.close();
  });

  test("has one static h1 and a logical heading order", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    const levels = await page
      .locator("main h1, main h2, main h3")
      .evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
    for (let i = 1; i < levels.length; i++) {
      expect((levels[i] ?? 0) - (levels[i - 1] ?? 0)).toBeLessThanOrEqual(1);
    }
    const first = await page.locator("h1").textContent();
    await page.waitForTimeout(4000);
    await expect(page.locator("h1")).toHaveText(first ?? "");
  });

  test("keeps the DOM under 1,000 elements", async ({ page }) => {
    await page.goto("/");
    const count = await page.evaluate(() => document.querySelectorAll("*").length);
    expect(count).toBeLessThanOrEqual(1000);
  });

  test("never names a competing product, in the HTML, the metadata or the structured data", async ({
    page,
    request,
  }) => {
    const html = await (await request.get("/")).text();
    expect(findCompetitorNames(html)).toEqual([]);
    await page.goto("/");
    expect(findCompetitorNames(await page.locator("body").innerText())).toEqual([]);
  });

  test("publishes structured data that matches the page and claims nothing extra", async ({ page }) => {
    await page.goto("/");
    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(raw ?? "{}") as { "@graph": Record<string, unknown>[] };
    const app = data["@graph"].find((node) => node["@type"] === "SoftwareApplication");
    const prices = (app?.offers as { price: string }[]).map((offer) => offer.price);
    expect(prices).toEqual(expect.arrayContaining(["0.00", "3.00", "4.00", "5.00", "7.00"]));
    const faqPage = data["@graph"].find((node) => node["@type"] === "FAQPage");
    await expect(page.locator("main details")).toHaveCount((faqPage?.mainEntity as unknown[]).length);
    expect(raw).not.toContain("aggregateRating");
    expect(raw).not.toContain("PreOrder");
  });

  test("shows no placeholder or unconfirmed markers", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).not.toContainText(/unconfirmed|needs content|\bQ\d{1,2}\b|lorem/i);
  });

  test("presents every platform as current: nothing is beta and nothing is in review", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).not.toContainText(/beta|in review/i);
    await expect(page.locator("#download").getByRole("button")).toHaveCount(6);
  });

  test("says what Workchats is and that 5 people use it free, beside the first action", async ({ page }) => {
    await page.goto("/");
    const height = page.viewportSize()?.height ?? 900;
    for (const locator of [
      page.getByText("Free for up to 5 people.", { exact: true }),
      page.locator('main [data-cta="hero"]'),
    ]) {
      const box = await locator.boundingBox();
      expect(box && box.y + box.height).toBeLessThanOrEqual(height);
    }
  });

  test("puts the business case inside the first two screens on a desktop", async ({ page }) => {
    test.skip(isMobile(page), "the brief's two-screen rule is for desktop");
    await page.goto("/");
    const twoScreens = 2 * (page.viewportSize()?.height ?? 900);
    // This measures the bottom of a heading after ~1800px of accumulated layout, and the font metrics of
    // the machine the page was built on differ from CI's Linux runner by about 22px over that distance.
    // The assertion guards a regression at the scale of a screen, so it allows that much slack: a
    // sub-pixel boundary here would flip between platforms without catching anything real.
    const renderingSlack = 48;
    // Cost, encryption and the free plan are in the hero; where the data lives opens the next section, and
    // its intro, with the uptime SLA, follows straight after.
    const heading = page.getByRole("heading", { name: "Hosted in the UK, the EU or the UAE" });
    const box = await heading.boundingBox();
    expect(box && box.y + box.height).toBeLessThan(twoScreens + renderingSlack);
    const intro = page
      .getByRole("region", { name: "Hosted in the UK, the EU or the UAE" })
      .getByText(/^Choose where/);
    await expect(intro).toContainText("end-to-end encrypted");
    await expect(intro).toContainText("99.9% uptime SLA on Pro and above");
  });

  test("has link-preview tags and a 1200 × 630 preview image", async ({ page, request }) => {
    await page.goto("/");
    const image = await page.locator('meta[property="og:image"]').getAttribute("content");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /^https:\/\/www\.workchats\.com\/?$/,
    );
    expect(image).toBeTruthy();
    const path = new URL(image ?? "").pathname;
    const response = await request.get(path);
    expect(response.headers()["content-type"]).toBe("image/png");
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  });
});

test.describe("privacy and security", () => {
  test("makes no third-party request and sets no cookie", async ({ page, context }) => {
    const origins = new Set<string>();
    page.on("request", (req) => origins.add(new URL(req.url()).origin));
    await page.goto("/");
    await page.mouse.wheel(0, 4000);
    await page.waitForLoadState("networkidle");
    const base = new URL(page.url()).origin;
    expect([...origins].filter((origin) => origin !== base && !origin.startsWith("data:"))).toEqual([]);
    expect(await context.cookies()).toEqual([]);
  });

  test("sends security headers", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("sends no analytics event before consent, when gtag hasn't loaded", async ({ page }) => {
    await page.goto("/");
    await page.locator("#download").getByRole("button").first().click();
    await page.locator("#pricing label", { hasText: "Monthly" }).click();
    expect(await page.evaluate(() => "gtag" in window)).toBe(false);
  });
});

test.describe("accessibility", () => {
  test("has no serious or critical axe violations (WCAG 2.2 A and AA)", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });

  test("the skip link is the first stop and moves focus to the content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("FAQ answers open and close from the keyboard", async ({ page }) => {
    await page.goto("/");
    const summary = page.locator("summary", { hasText: "Is the Free plan really free?" });
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(summary.locator("xpath=..")).toHaveAttribute("open", "");
    await expect(page.getByText("5 GB of storage per person").first()).toBeVisible();
    await page.keyboard.press("Space");
    await expect(summary.locator("xpath=..")).not.toHaveAttribute("open", "");
  });

  test("every focusable element shows a visible focus indicator", async ({ page }) => {
    await page.goto("/");
    const missing: string[] = [];
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press("Tab");
      const result = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const hasRing = (node: HTMLElement) => {
          const style = getComputedStyle(node);
          return style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2;
        };
        // Visually hidden controls (the radio switches) draw their ring on the visible label around them.
        const target = el.closest("label") ?? el;
        return hasRing(target) ? null : `${el.tagName} "${(el.textContent ?? "").trim().slice(0, 30)}"`;
      });
      if (result) missing.push(result);
    }
    expect(missing).toEqual([]);
  });

  test("nothing moves on its own for more than five seconds (WCAG 2.2.2)", async ({ page }) => {
    await page.goto("/");
    // Every animation is either scroll-linked (the visitor drives it) or a short reply to an action.
    const looping = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().iterations === Infinity)
        .map((animation) => (animation as CSSAnimation).animationName),
    );
    expect(looping).toEqual([]);
  });

  test("reduced motion removes transitions and shows every device in its settled state", async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    const duration = await page
      .locator('main [data-cta="hero"]')
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(duration).toBe("0s");
    // The lid is open and square, the title hasn't moved, and nothing animates, the tour included.
    const settled = await page.evaluate(() => {
      const card = document.querySelector('[data-device-part="lid"]');
      return {
        card: card ? getComputedStyle(card).transform : "missing",
        animations: document.getAnimations().length,
      };
    });
    expect(settled).toEqual({ card: "none", animations: 0 });
    // The header's glass is simply on, so the bar is legible over content without the scroll effect.
    await expect(page.locator("header .nav-glass")).toHaveCSS("opacity", "1");
    await context.close();
  });
});

test.describe("interaction", () => {
  test("every platform takes a press and leaves the page as it was, as the owner asked for this MVP", async ({
    page,
  }) => {
    await page.goto("/");
    const downloads = page.locator("#download");
    for (const name of ["Web", "macOS", "Windows", "Linux", "iPhone and iPad", "Android"]) {
      await expect(downloads.getByRole("button", { name: new RegExp(`^${name}`) })).toBeAttached();
    }
    const urlBefore = page.url();
    const textBefore = await downloads.innerText();
    for (const name of ["Windows", "iPhone and iPad", "Web"]) {
      await downloads.getByRole("button", { name: new RegExp(`^${name}`) }).click();
    }
    expect(page.url()).toBe(urlBefore);
    expect(await downloads.innerText()).toBe(textBefore);
  });

  test("records calls to action, downloads, pricing, the calculator and the FAQ once gtag exists", async ({
    page,
  }) => {
    await stubGtag(page);
    await page.goto("/");
    // A press on Start free is recorded before the browser leaves; keep the page here to read it.
    await page.locator('main [data-cta="hero"]').evaluate((el) => {
      el.addEventListener("click", (event) => event.preventDefault(), { once: true });
      (el as HTMLElement).click();
    });
    await page
      .locator("#download")
      .getByRole("button", { name: /^Linux/ })
      .click();
    await page.locator("#pricing label", { hasText: "Monthly" }).click();
    await page.locator("#pricing label").filter({ hasText: /^EUR$/ }).click();
    await page.getByRole("slider", { name: "Team size" }).fill("120");
    await page.locator("summary", { hasText: "Can we move over" }).click();
    // A disclosure's toggle event is queued, so it lands a moment after the click.
    await expect.poll(async () => (await sentEvents(page)).some((call) => call[1] === "faq_open")).toBe(true);
    const names = (await sentEvents(page)).map((call) => [call[1], call[2]]);
    expect(names).toEqual(
      expect.arrayContaining([
        ["cta_click", { location: "hero", label: "Start free" }],
        ["download_click", { platform: "linux", location: "downloads" }],
        ["pricing_period_change", { period: "monthly" }],
        ["pricing_currency_change", { currency: "EUR", location: "pricing" }],
        ["calculator_change", { team_size: 120 }],
        ["faq_open", { question: "switching" }],
      ]),
    );
  });

  test("the billing period switch changes the prices shown", async ({ page }) => {
    await page.goto("/");
    const pro = page.getByRole("article", { name: "Pro" });
    await expect(pro.getByText("£3", { exact: true })).toBeVisible();
    // People click the visible label; the radio itself is visually hidden.
    await page.locator("#pricing label", { hasText: "Monthly" }).click();
    await expect(page.getByRole("radio", { name: "Monthly" })).toBeChecked();
    await expect(pro.getByText("£4", { exact: true })).toBeVisible();
    await expect(pro.getByText("£3", { exact: true })).toBeHidden();
    await page.keyboard.press("ArrowLeft");
    await expect(pro.getByText("£3", { exact: true })).toBeVisible();
  });

  test("the currency switch converts prices, is remembered and is announced", async ({ page }) => {
    await page.goto("/");
    const pro = page.getByRole("article", { name: "Pro" });
    const pricing = page.locator("#pricing");
    await expect(pricing.getByRole("radio", { name: "Pound sterling (GBP)" })).toBeChecked();
    await pricing.locator("label").filter({ hasText: /^EUR$/ }).click();
    await expect(pro.getByText("€3.50", { exact: true })).toBeVisible();
    await expect(page.locator("#pricing-status")).toContainText("Pro €3.50");
    // One choice for the whole page: the calculator follows the pricing cards.
    await expect(page.locator("#cost").getByRole("radio", { name: "Euro (EUR)" })).toBeChecked();
    await expect(page.locator('#cost-saving [data-currency="EUR"]')).toBeVisible();
    await page.reload();
    await expect(pricing.getByRole("radio", { name: "Euro (EUR)" })).toBeChecked();
    await expect(pro.getByText("€3.50", { exact: true })).toBeVisible();
  });

  test("the calculator's own currency switch converts the totals and carries back to pricing", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator('#cost-saving [data-currency="GBP"]')).toHaveText("£15,744");
    await page.locator("#cost label").filter({ hasText: /^AED$/ }).click();
    await expect(page.locator('#cost-saving [data-currency="AED"]')).toHaveText("Dh 73,367");
    await expect(page.locator("#pricing").getByRole("radio", { name: "UAE dirham (AED)" })).toBeChecked();
    await expect(
      page.getByRole("article", { name: "Pro" }).getByText("Dh 14", { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(page.locator('#cost-saving [data-currency="AED"]')).toBeVisible();
    await expect(page.locator("#cost").getByRole("radio", { name: "UAE dirham (AED)" })).toBeChecked();
  });

  test("a changed price rises in, and the figure it replaced leaves the line", async ({ page }) => {
    await page.goto("/");
    await page.locator("#pricing").scrollIntoViewIfNeeded();
    const mid = await page.evaluate(async () => {
      const label = [...document.querySelectorAll("#pricing label")].find(
        (element) => element.textContent?.trim() === "USD",
      );
      (label as HTMLElement).click();
      await new Promise((resolve) => setTimeout(resolve, 60));
      const usd = document.querySelector('#pricing [data-currency="USD"]')!;
      const gbp = document.querySelector('#pricing [data-currency="GBP"]')!;
      return {
        opacity: Number(getComputedStyle(usd).opacity),
        translate: getComputedStyle(usd).translate,
        gbpDisplay: getComputedStyle(gbp).display,
      };
    });
    expect(mid.opacity).toBeLessThan(1);
    expect(mid.translate).not.toBe("0px");
    expect(mid.gbpDisplay).toBe("none");
    await expect(page.locator('#pricing [data-currency="USD"]').first()).toHaveCSS("opacity", "1");
  });

  test("the calculator totals keep the 'a year' beside the figure", async ({ page }) => {
    await page.goto("/");
    await page.locator("#cost").scrollIntoViewIfNeeded();
    await page.locator("#cost label").filter({ hasText: /^EUR$/ }).click();
    // The suffix sits beside the figure on screen, not beside the widest currency on the page.
    const gap = await page.evaluate(() => {
      const value = document.querySelector("#cost-saving")!;
      const year = value.nextElementSibling!;
      return Math.round(year.getBoundingClientRect().left - value.getBoundingClientRect().right);
    });
    expect(gap).toBeLessThan(16);
  });

  test("the cost calculator recalculates and switches to Max above Pro's 50 people", async ({ page }) => {
    await page.goto("/");
    const slider = page.getByRole("slider", { name: "Team size" });
    await expect(slider).toBeVisible();
    const saving = page.locator('#cost-saving [data-currency="GBP"]');
    await expect(saving).toHaveText("£15,744");
    await slider.fill("120");
    await expect(page.locator("#team-size-value")).toHaveText("120 people");
    await expect(page.locator('#cost-stack [data-currency="GBP"]')).toHaveText("£59,386");
    await expect(page.locator("#cost-workchats-label")).toHaveText("Workchats Max + your office suite");
    await expect(page.locator('#cost-workchats [data-currency="GBP"]')).toHaveText("£24,480");
    await expect(saving).toHaveText("£34,906");
  });

  test("the header gathers into a floating glass bar as the page scrolls", async ({ page }) => {
    test.skip(isMobile(page), "the desktop bar");
    await page.goto("/");
    const glass = page.locator("header .nav-glass");
    const logo = page.locator("header .nav-gather-start");
    // Wide and transparent at the top of the page: the logo sits out at the wide position.
    await expect(glass).toHaveCSS("opacity", "0");
    const wide = await logo.evaluate((el) => getComputedStyle(el).translate);
    expect(wide).not.toBe("none");
    await page.mouse.wheel(0, 400);
    await expect(glass).toHaveCSS("opacity", "1");
    await expect(glass).toHaveCSS("backdrop-filter", "blur(16px)");
    await expect.poll(() => logo.evaluate((el) => getComputedStyle(el).translate)).toMatch(/^(none|0px)/);
  });

  test("the header keeps Sign in and Download beside Start free, with the theme button before Download", async ({
    page,
  }) => {
    test.skip(isMobile(page), "desktop header");
    await page.goto("/");
    const header = page.getByRole("banner");
    for (const name of ["Sign in", "Download", "Start free"]) {
      await expect(header.getByRole("link", { name })).toBeVisible();
    }
    await expect(header.getByRole("link", { name: "Book a demo" })).toHaveCount(0);
    const theme = header.getByRole("button", { name: "Switch to light theme" });
    await expect(theme).toBeVisible();
    const themeBox = await theme.boundingBox();
    const downloadBox = await header.getByRole("link", { name: "Download" }).boundingBox();
    expect(themeBox && downloadBox && themeBox.x + themeBox.width <= downloadBox.x).toBe(true);
  });

  test("the laptop's lid leans back at the top of the page and comes up square as it scrolls", async ({
    page,
  }) => {
    test.skip(isMobile(page), "the desktop card");
    await page.goto("/");
    const card = page.locator('[data-device-part="lid"]');
    const flat = () => card.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).isIdentity);
    expect(await card.evaluate((el) => getComputedStyle(el).transform)).toContain("matrix3d");
    expect(await flat()).toBe(false);
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await expect.poll(flat).toBe(true);
  });

  test("a menu item is an icon, a label, its one line and a status chip", async ({ page }) => {
    test.skip(isMobile(page), "desktop menus");
    await page.goto("/");
    const features = page.getByRole("button", { name: "Features" });
    await features.click();
    const panel = page.locator(`#${await features.getAttribute("aria-controls")}`);
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("link")).toHaveCount(7);
    await expect(panel.getByRole("link", { name: /Messaging and channels/ })).toContainText(
      "One place for every team conversation.",
    );
    await expect(panel.getByRole("link", { name: /Social feed Coming soon/ })).toBeVisible();
    await expect(panel.getByText("Coming soon")).toHaveCount(3);
  });

  test("desktop menus open on hover for mouse users", async ({ page }) => {
    test.skip(isMobile(page), "desktop navigation");
    await page.goto("/");
    const solutions = page.getByRole("button", { name: "Solutions" });
    await solutions.hover();
    await expect(solutions).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: /Healthcare teams/ }).first()).toBeVisible();
    await page.mouse.move(700, 600);
    await expect(solutions).toHaveAttribute("aria-expanded", "false");
  });

  test("desktop menus open with the keyboard and close with Escape", async ({ page }) => {
    test.skip(isMobile(page), "desktop navigation");
    await page.goto("/");
    const features = page.getByRole("button", { name: "Features" });
    await features.focus();
    await page.keyboard.press("Enter");
    await expect(features).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: /Video and meetings/ }).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(features).toHaveAttribute("aria-expanded", "false");
    await expect(features).toBeFocused();
  });

  test("phones show the phone, not a shrunken laptop", async ({ page }) => {
    test.skip(!isMobile(page), "phones only");
    await page.goto("/");
    await expect(page.locator('[data-device="phone"]')).toBeVisible();
    await expect(page.locator('[data-device="laptop"]')).toBeHidden();
    const box = await page.locator('[data-device="phone"]').boundingBox();
    expect((box?.height ?? 0) / (box?.width ?? 1)).toBeGreaterThan(1.6);
  });

  test("desktop shows the laptop, with the phone as the second screen", async ({ page }) => {
    test.skip(isMobile(page), "desktop only");
    await page.goto("/");
    await expect(page.locator('[data-device="laptop"]')).toBeVisible();
    await expect(page.locator('[data-device="phone"]')).toBeVisible();
  });

  test("the phone menu is a dialog that leads with the free sign-up and keeps the actions", async ({
    page,
  }) => {
    test.skip(!isMobile(page), "phone navigation");
    await page.goto("/");
    await expect(page.getByRole("banner").getByRole("link", { name: "Start free" })).toBeVisible();
    await page.getByRole("button", { name: "Menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    for (const name of ["Start free", "Download", "Sign in"]) {
      await expect(dialog.getByRole("link", { name })).toBeVisible();
    }
    await expect(dialog.getByRole("link", { name: "Book a demo" })).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Light theme" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});

test.describe("device-aware downloads", () => {
  const visit = async (browser: Browser, userAgent: string) => {
    const context = await browser.newContext({ userAgent, viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("/");
    return { context, page };
  };

  test("promotes the visitor's own platform, in the hero and in the platforms", async ({ browser }) => {
    const { context, page } = await visit(browser, userAgents.windows);
    await expect(page.locator('main [data-download="auto"]')).toHaveText("Download for Windows", {
      useInnerText: true,
    });
    const windows = page.locator("#download").getByRole("button", { name: /^Windows/ });
    await expect(windows.getByText("This device")).toBeVisible();
    // Moved to the front of the list: the first row, the first column.
    const boxes = await page
      .locator("#download button")
      .evaluateAll((buttons) =>
        buttons.map((b) => [
          b.textContent ?? "",
          b.getBoundingClientRect().top,
          b.getBoundingClientRect().left,
        ]),
      );
    const [first] = [...boxes].sort((a, b) => Number(a[1]) - Number(b[1]) || Number(a[2]) - Number(b[2]));
    expect(String(first?.[0])).toMatch(/^Windows/);
    await context.close();
  });

  test("falls back to neutral labels when the platform can't be told", async ({ browser }) => {
    const context = await browser.newContext({ userAgent: userAgents.unknown });
    // Chromium also reports a platform through userAgentData; take that away too.
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "userAgentData", { get: () => undefined });
      Object.defineProperty(navigator, "platform", { get: () => "" });
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator('main [data-download="auto"]')).toHaveText("Download the app", {
      useInnerText: true,
    });
    await expect(page.locator("#download").getByText("This device")).toHaveCount(6);
    for (const marker of await page.locator("#download").getByText("This device").all()) {
      await expect(marker).toBeHidden();
    }
    await context.close();
  });

  test("labels the button before the first paint, so nothing shifts", async ({ browser }) => {
    const { context, page } = await visit(browser, userAgents.macos);
    await expect(page.locator('main [data-download="auto"]')).toHaveText("Download for macOS", {
      useInnerText: true,
    });
    const shift = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as (PerformanceEntry & { value: number })[])
              total += entry.value;
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(total), 500);
        }),
    );
    expect(shift).toBe(0);
    await context.close();
  });
});

test.describe("layout", () => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    test(`never scrolls sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  }

  for (const width of [320, 360, 390, 768, 1024, 1280]) {
    test(`the header contents never collide at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      // Scrolled, so the bar has gathered to its narrowest.
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(200);
      const gaps = await page.evaluate(() => {
        const header = document.querySelector("header")!;
        const logo = header.querySelector('a[href="/"]')!.getBoundingClientRect();
        const actions = header.querySelector(".nav-gather-end")!.getBoundingClientRect();
        const nav = header.querySelector("nav")!.getBoundingClientRect();
        const glass = header.querySelector(".nav-glass")!.getBoundingClientRect();
        const visibleNav = nav.width > 0;
        return {
          // The actions stay inside the glass bar, never past its edge.
          overhang: Math.round(actions.right - glass.right),
          logoToActions: Math.round(actions.left - logo.right),
          logoToNav: visibleNav ? Math.round(nav.left - logo.right) : null,
          navToActions: visibleNav ? Math.round(actions.left - nav.right) : null,
        };
      });
      expect(gaps.logoToActions).toBeGreaterThanOrEqual(8);
      expect(gaps.overhang).toBeLessThanOrEqual(0);
      if (gaps.logoToNav !== null) expect(gaps.logoToNav).toBeGreaterThanOrEqual(8);
      if (gaps.navToActions !== null) expect(gaps.navToActions).toBeGreaterThanOrEqual(8);
    });
  }

  for (const width of [1024, 1280, 1440]) {
    test(`the hero's laptop and phone stay on screen at ${width}px`, async ({ page }) => {
      test.skip(isMobile(page), "desktop widths");
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      for (const device of ['[data-device="laptop"]', '[data-device="phone"]']) {
        const box = await page.locator(device).boundingBox();
        expect(box?.x ?? -1, device).toBeGreaterThanOrEqual(0);
        expect((box?.x ?? 0) + (box?.width ?? 0), device).toBeLessThanOrEqual(width);
      }
    });
  }

  test("tap targets on phones are at least 44 × 44 px", async ({ page }) => {
    test.skip(!isMobile(page), "phones only");
    await page.goto("/");
    const small = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("a, button, summary, label")]
        .filter((el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden")
        // Links inside a sentence are exempt (WCAG 2.5.8 inline exception).
        .filter((el) => getComputedStyle(el).display !== "inline")
        .filter(
          (el) =>
            !el.closest("dialog:not([open])") &&
            !el.closest("[hidden]") &&
            !el.closest("[inert]") &&
            !el.classList.contains("sr-only"),
        )
        .map((el) => ({ el, box: el.getBoundingClientRect() }))
        .filter(({ box }) => box.width > 0 && (box.width < 44 || box.height < 44))
        .map(
          ({ el, box }) =>
            `${el.tagName} "${(el.textContent ?? "").trim().slice(0, 24)}" ${Math.round(box.width)}×${Math.round(box.height)}`,
        ),
    );
    expect(small).toEqual([]);
  });
});
