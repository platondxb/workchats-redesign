import { expect, test, type Page } from "@playwright/test";

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 1024;
const tour = (page: Page) => page.locator("#hero-tour");
const current = (page: Page) =>
  page.evaluate(() => document.getElementById("hero-tour")?.dataset.current ?? "");

/** The tour plays while the devices are on screen: on a phone they start just below the fold. */
async function showDevices(page: Page) {
  await page.getByRole("img", { name: /^Workchats on a laptop and a phone/ }).scrollIntoViewIfNeeded();
}

/** The source of the image a device shows now, whichever part and theme that is. */
const showing = (page: Page, device: "laptop" | "phone") =>
  page.evaluate((selector) => {
    const image = [...document.querySelectorAll<HTMLImageElement>(`${selector} [data-stop] img`)].find(
      (img) =>
        img.getClientRects().length > 0 &&
        getComputedStyle(img.closest("[data-stop]") ?? img).opacity !== "0",
    );
    return image?.currentSrc ?? "";
  }, `[data-device="${device}"]`);

test.describe("the hero's product tour", () => {
  test("shows the app's parts in turn, chats first, on both devices and in the visitor's theme", async ({
    page,
  }) => {
    await page.goto("/");
    await showDevices(page);
    const device = isMobile(page) ? "phone" : "laptop";
    await expect.poll(() => showing(page, device)).toMatch(/-chats-dark-/);
    await expect.poll(() => current(page), { timeout: 10_000 }).toBe("contacts");
    await expect.poll(() => showing(page, device)).toMatch(/-contacts-dark-/);
    if (!isMobile(page)) await expect.poll(() => showing(page, "phone")).toMatch(/phone-contacts-dark-/);
    // The light theme shows the app's light screens.
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
    await expect.poll(() => showing(page, device)).toMatch(/-light-/);
  });

  test("has no control for the tour: nothing to press on or beside the devices", async ({ page }) => {
    await page.goto("/");
    await showDevices(page);
    await expect(page.getByRole("button", { name: /product tour/i })).toHaveCount(0);
    await expect(page.locator("[data-tour-toggle]")).toHaveCount(0);
  });

  test("with reduced motion it stays on chats", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForTimeout(3_000);
    await expect(tour(page)).not.toHaveAttribute("data-current");
    const device = (page.viewportSize()?.width ?? 1440) < 768 ? "phone" : "laptop";
    await expect(page.locator(`[data-device="${device}"] [data-stop="chats"]`)).toBeVisible();
    await context.close();
  });

  test("shows the chats screen without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    const device = (page.viewportSize()?.width ?? 1440) < 768 ? "phone" : "laptop";
    await expect(page.locator(`[data-device="${device}"] [data-stop="chats"]`)).toBeVisible();
    await expect(page.locator(`[data-device="${device}"] [data-stop="calls"]`)).toBeHidden();
    await context.close();
  });

  test("loads only the first part's screens with the page", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    const screens: string[] = [];
    page.on("request", (request) => {
      if (/\/(screens|devices)\/(desktop|phone)-/.test(request.url())) screens.push(request.url());
    });
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1_000);
    expect(screens.length).toBeGreaterThan(0);
    for (const url of screens) expect(url).toMatch(/-chats-dark-/);
    await context.close();
  });
});
