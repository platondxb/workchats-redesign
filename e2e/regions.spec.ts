import { expect, test, type Page } from "@playwright/test";

const globe = (page: Page) => page.locator("#region-globe");

/** The live globe needs WebGL 2; a runner without it keeps the poster, which the other tests cover. */
const hasWebGL2 = (page: Page) =>
  page.evaluate(() => Boolean(document.createElement("canvas").getContext("webgl2")));

/** Scrolls the globe into view and waits for the live planet to settle after its intro. */
async function settledGlobe(page: Page) {
  await page.goto("/");
  test.skip(!(await hasWebGL2(page)), "no WebGL 2 in this browser");
  const root = globe(page);
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute("data-globe", "live", { timeout: 15_000 });
  await expect(root).not.toHaveAttribute("data-intro", /./, { timeout: 15_000 });
  return root;
}

/** Where a region's pin is, as a share of the globe's box. */
const pinAt = (page: Page, id: string) =>
  globe(page)
    .locator(`[data-pin="${id}"]`)
    .evaluate((pin) => {
      const box = pin.getBoundingClientRect();
      const frame = pin.parentElement?.getBoundingClientRect() ?? box;
      return { x: (box.left - frame.left) / frame.width, y: (box.top - frame.top) / frame.height };
    });

test.describe("the region globe", () => {
  test("shows the regions, their arcs and their labels without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    const root = globe(page);
    await expect(root).toHaveAttribute("role", "img");
    await expect(root).toHaveAttribute(
      "aria-label",
      /United Kingdom, European Union and United Arab Emirates/,
    );
    await expect(root.locator("path[data-from]")).toHaveCount(3);
    for (const label of ["UK", "EU", "UAE"])
      await expect(root.getByText(label, { exact: true })).toBeVisible();
    // The list beside it is native radios read by CSS, so choosing a region still lights it on the poster.
    const uae = root.locator('[data-pin="ae"]').getByText("UAE", { exact: true });
    const idle = await uae.evaluate((label) => getComputedStyle(label).backgroundColor);
    await page.locator("#regions label", { hasText: "United Arab Emirates" }).click();
    await expect(page.getByRole("radio", { name: /^United Arab Emirates/ })).toBeChecked();
    await expect.poll(() => uae.evaluate((label) => getComputedStyle(label).backgroundColor)).not.toBe(idle);
    await context.close();
  });

  test("keeps the still poster under reduced motion: no canvas and no planet code", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    const scripts: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() === "script") scripts.push(request.url());
    });
    await page.goto("/");
    const root = globe(page);
    await root.scrollIntoViewIfNeeded();
    const poster = root.locator("img").first();
    await expect(poster).toBeVisible();
    await expect
      .poll(() => poster.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth))
      .toBe(1216);
    await page.waitForTimeout(1000);
    await expect(root.locator("canvas")).toHaveCount(0);
    await expect(root).not.toHaveAttribute("data-globe", "live");
    const loaded = scripts.length;
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(500);
    expect(scripts).toHaveLength(loaded);
    await context.close();
  });

  test("becomes a live planet that follows a drag and turns to a chosen region", async ({ page }) => {
    const root = await settledGlobe(page);
    await expect(root.locator("canvas")).toHaveCount(1);
    const arc = root.locator('path[data-from="ae"]');
    const before = await arc.getAttribute("d");

    const box = await root.boundingBox();
    if (!box) throw new Error("The globe has no box");
    await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.5, { steps: 8 });
    await page.mouse.up();
    await expect.poll(() => arc.getAttribute("d")).not.toBe(before);

    // Choosing the UAE turns the globe to put it front and centre, a little above the middle.
    await page.locator("#regions label", { hasText: "United Arab Emirates" }).click();
    await expect
      .poll(async () => {
        const pin = await pinAt(page, "ae");
        return Math.abs(pin.x - 0.5) < 0.01 && pin.y < 0.45;
      })
      .toBe(true);
    // Its arcs are lit and the one between the other two regions steps back.
    const opacity = (selector: string) =>
      root.locator(selector).evaluate((path) => Number(getComputedStyle(path).opacity));
    await expect.poll(() => opacity('path[data-from="eu"][data-to="ae"]')).toBe(1);
    await expect.poll(() => opacity('path[data-from="gb"][data-to="eu"]')).toBeLessThan(0.5);
  });

  test("a press on a label on the globe chooses that region in the list", async ({ page }) => {
    const root = await settledGlobe(page);
    await root.locator('[data-pin="ae"]').getByText("UAE", { exact: true }).click();
    await expect(page.getByRole("radio", { name: /^United Arab Emirates/ })).toBeChecked();
  });

  test("stands still once it has settled (WCAG 2.2.2)", async ({ page }) => {
    const root = await settledGlobe(page);
    const arc = root.locator('path[data-from="eu"]');
    // Nothing turns it but the visitor: once still, it stays still.
    let settled = await arc.getAttribute("d");
    await expect
      .poll(async () => {
        const now = await arc.getAttribute("d");
        const still = now === settled;
        settled = now;
        return still;
      })
      .toBe(true);
    await page.waitForTimeout(1500);
    expect(await arc.getAttribute("d")).toBe(settled);
    expect(await root.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
  });

  test("loads the planet from this site only", async ({ page }) => {
    const origins = new Set<string>();
    page.on("request", (request) => {
      if (!request.url().startsWith("data:")) origins.add(new URL(request.url()).origin);
    });
    await settledGlobe(page);
    expect([...origins]).toEqual([new URL(page.url()).origin]);
  });
});
