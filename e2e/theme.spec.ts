import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 1024;
const theme = (page: Page) => page.evaluate(() => document.documentElement.getAttribute("data-theme"));
const background = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

/** The header's theme button on desktop, or the phone menu's, opened first. */
async function pressThemeButton(page: Page) {
  if (isMobile(page)) {
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("dialog", { name: "Menu" }).getByRole("button", { name: /theme/i }).click();
    await page.keyboard.press("Escape");
  } else {
    await page
      .getByRole("banner")
      .getByRole("button", { name: /Switch to/ })
      .click();
  }
}

/** Loads the page as a returning visitor who chose light, so nothing but the theme differs from a first visit. */
async function openInLight(page: Page) {
  await page.addInitScript(() => localStorage.setItem("workchats-theme", "light"));
  await page.goto("/");
  expect(await theme(page)).toBe("light");
}

test.describe("the light theme", () => {
  test("is dark until the visitor switches it", async ({ page }) => {
    await page.goto("/");
    expect(await theme(page)).toBe("dark");
    expect(await background(page)).toBe("rgb(11, 18, 32)");
  });

  test("switches to light and back, and renames the button for what it does next", async ({ page }) => {
    test.skip(isMobile(page), "the desktop button; the phone menu has its own test below");
    await page.goto("/");
    const header = page.getByRole("banner");
    await header.getByRole("button", { name: "Switch to light theme" }).click();
    expect(await theme(page)).toBe("light");
    expect(await background(page)).toBe("rgb(245, 248, 252)");
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#f5f8fc");
    await header.getByRole("button", { name: "Switch to dark theme" }).click();
    expect(await theme(page)).toBe("dark");
    expect(await background(page)).toBe("rgb(11, 18, 32)");
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#0b1220");
  });

  test("switches from the phone menu", async ({ page }) => {
    test.skip(!isMobile(page), "phone navigation");
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await dialog.getByRole("button", { name: "Light theme" }).click();
    expect(await theme(page)).toBe("light");
    await expect(dialog.getByRole("button", { name: "Dark theme" })).toBeVisible();
  });

  test("is remembered on the next visit", async ({ page }) => {
    await page.goto("/");
    await pressThemeButton(page);
    expect(await theme(page)).toBe("light");
    await page.reload();
    expect(await theme(page)).toBe("light");
    expect(await background(page)).toBe("rgb(245, 248, 252)");
  });

  test("is already in place when the document gets its body, so the page never flashes dark", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      localStorage.setItem("workchats-theme", "light");
      // Runs before the page's own scripts: note the theme the first moment there is a <body> to paint.
      const watch = new MutationObserver(() => {
        if (!document.body) return;
        watch.disconnect();
        (window as unknown as { themeAtBody: string | null }).themeAtBody =
          document.documentElement.getAttribute("data-theme");
      });
      watch.observe(document, { childList: true, subtree: true });
    });
    const page = await context.newPage();
    await page.goto("/");
    expect(await page.evaluate(() => (window as unknown as { themeAtBody: string | null }).themeAtBody)).toBe(
      "light",
    );
    await context.close();
  });

  test("keeps the page readable: no serious or critical axe violations (WCAG 2.2 A and AA)", async ({
    page,
  }) => {
    await openInLight(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });

  test("keeps the DOM under 1,000 elements", async ({ page }) => {
    await openInLight(page);
    const count = await page.evaluate(() => document.querySelectorAll("*").length);
    expect(count).toBeLessThanOrEqual(1000);
  });

  test("never scrolls sideways", async ({ page }) => {
    await openInLight(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
