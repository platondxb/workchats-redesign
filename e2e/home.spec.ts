import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 1024;

test.describe("content and rendering", () => {
  test("serves the full page as HTML, readable without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "A simpler way to talk with your whole team",
    );
    const pro = page.getByRole("article", { name: "Pro" });
    await expect(pro.getByText("£3", { exact: true })).toBeVisible();
    // Without JavaScript both pricing switches still work: they're native radios read by CSS.
    await page.locator("label", { hasText: "Monthly" }).click();
    await expect(pro.getByText("£4", { exact: true })).toBeVisible();
    await page.locator("label").filter({ hasText: /^USD$/ }).click();
    await expect(pro.getByText("$5", { exact: true })).toBeVisible();
    await expect(pro.getByText("£4", { exact: true })).toBeHidden();
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
    const summary = page.locator("summary", { hasText: "Is Workchats really free?" });
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(summary.locator("xpath=..")).toHaveAttribute("open", "");
    await expect(page.getByText("5 GB of storage per user").first()).toBeVisible();
    await page.keyboard.press("Space");
    await expect(summary.locator("xpath=..")).not.toHaveAttribute("open", "");
  });

  test("every focusable element shows a visible focus indicator", async ({ page }) => {
    await page.goto("/");
    const missing: string[] = [];
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      const result = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const style = getComputedStyle(el);
        const hasOutline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2;
        return hasOutline ? null : `${el.tagName} "${(el.textContent ?? "").trim().slice(0, 30)}"`;
      });
      if (result) missing.push(result);
    }
    expect(missing).toEqual([]);
  });

  test("reduced motion removes transitions and shows the demo's final frame", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    const duration = await page
      .getByRole("link", { name: "Start free" })
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(duration).toBe("0s");
    const message = page.locator("#hero-demo [class*='animate-demo-message']");
    expect(await message.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    expect(await message.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    // Nothing moves, so there's nothing to pause, and the typing indicator would never resolve.
    await expect(page.locator("label", { hasText: "Pause animation" })).toBeHidden();
    await expect(page.getByText(/is typing/)).toBeHidden();
    await context.close();
  });

  test("the hero animation can be paused (WCAG 2.2.2)", async ({ page }) => {
    await page.goto("/");
    const message = page.locator("#hero-demo [class*='animate-demo-message']");
    expect(await message.evaluate((el) => getComputedStyle(el).animationPlayState)).toBe("running");
    await page.locator("label", { hasText: "Pause animation" }).click();
    await expect(page.getByRole("checkbox", { name: "Pause animation" })).toBeChecked();
    expect(await message.evaluate((el) => getComputedStyle(el).animationPlayState)).toBe("paused");
  });
});

test.describe("interaction", () => {
  test("the billing period switch changes the prices shown", async ({ page }) => {
    await page.goto("/");
    const pro = page.getByRole("article", { name: "Pro" });
    await expect(pro.getByText("£3", { exact: true })).toBeVisible();
    // People click the visible label; the radio itself is visually hidden.
    await page.locator("label", { hasText: "Monthly" }).click();
    await expect(page.getByRole("radio", { name: "Monthly" })).toBeChecked();
    await expect(pro.getByText("£4", { exact: true })).toBeVisible();
    await expect(pro.getByText("£3", { exact: true })).toBeHidden();
    await page.keyboard.press("ArrowLeft");
    await expect(pro.getByText("£3", { exact: true })).toBeVisible();
  });

  test("the currency switch converts prices, is remembered and is announced", async ({ page }) => {
    await page.goto("/");
    const pro = page.getByRole("article", { name: "Pro" });
    await expect(page.getByRole("radio", { name: "Pound sterling (GBP)" })).toBeChecked();
    await page.locator("label").filter({ hasText: /^EUR$/ }).click();
    await expect(pro.getByText("€3.50", { exact: true })).toBeVisible();
    await expect(page.locator("#pricing-status")).toContainText("Pro €3.50");
    await page.reload();
    await expect(page.getByRole("radio", { name: "Euro (EUR)" })).toBeChecked();
    await expect(pro.getByText("€3.50", { exact: true })).toBeVisible();
  });

  test("the cost calculator recalculates and switches to Max above Pro's 50 people", async ({ page }) => {
    await page.goto("/");
    const slider = page.getByRole("slider", { name: "Team size" });
    await expect(slider).toBeVisible();
    await expect(page.locator("#cost-saving")).toHaveText("£15,744");
    await slider.fill("120");
    await expect(page.locator("#team-size-value")).toHaveText("120 people");
    await expect(page.locator("#cost-five")).toHaveText("£59,386");
    await expect(page.locator("#cost-workchats-label")).toHaveText("Workchats Max + Google Workspace");
    await expect(page.locator("#cost-workchats")).toHaveText("£24,480");
    await expect(page.locator("#cost-saving")).toHaveText("£34,906");
  });

  test("the feature switcher shows one feature at a time on larger screens", async ({ page }) => {
    test.skip(isMobile(page), "the switcher is for tablet and desktop; phones show every feature");
    await page.goto("/");
    const messaging = page.getByRole("heading", { name: "Every kind of conversation, in one place" });
    const meetings = page.getByRole("heading", {
      name: "Calls that start where the conversation lives",
    });
    await expect(messaging).toBeVisible();
    await expect(meetings).toBeHidden();
    await page.locator("label", { hasText: "Video and meetings" }).click();
    await expect(meetings).toBeVisible();
    await expect(messaging).toBeHidden();
  });

  test("phones show every feature, one after another", async ({ page }) => {
    test.skip(!isMobile(page), "phones only");
    await page.goto("/");
    for (const name of [
      "Every kind of conversation, in one place",
      "Calls that start where the conversation lives",
      "Share a file once. Find it forever.",
    ]) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }
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

  test("the phone menu is a dialog that leads with the free sign-up", async ({ page }) => {
    test.skip(!isMobile(page), "phone navigation");
    await page.goto("/");
    await expect(page.getByRole("banner").getByRole("link", { name: "Start free" })).toBeVisible();
    await page.getByRole("button", { name: "Menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Start free" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
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
            !el.closest("dialog:not([open])") && !el.closest("[hidden]") && !el.classList.contains("sr-only"),
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
