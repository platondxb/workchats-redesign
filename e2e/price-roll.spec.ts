import { expect, test, type Locator, type Page } from "@playwright/test";

/** The paragraph that holds a plan's figure: the real price, and, while it rolls, the rolling digits. */
const priceLine = (page: Page, plan: string): Locator =>
  page.locator(`#pricing [data-plan-price="${plan}"] > p`).first();

const currency = (page: Page, code: string): Locator =>
  page.locator("#pricing label").filter({ hasText: new RegExp(`^${code}$`) });

const rollingCells = (page: Page, plan: string): Locator => priceLine(page, plan).locator(".price-roll-cell");

/**
 * Freezes every roll inside `host` on its last frame and photographs the host, lets the rolls finish and
 * photographs it again with the real figure alone, and returns the share of pixels that differ: how far the
 * hand-over from the rolling digits to the real figure would be seen.
 */
async function handOver(page: Page, host: Locator): Promise<number> {
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      const target = (animation.effect as KeyframeEffect | null)?.target;
      if (!target?.closest(".price-roll")) continue;
      animation.pause();
      animation.currentTime = (animation.effect?.getComputedTiming().endTime as number) - 1;
    }
  });
  const frozen = await host.screenshot();
  // Let them finish and go, then photograph the same box: the real figure on its own.
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      if ((animation.effect as KeyframeEffect | null)?.target?.closest(".price-roll")) animation.finish();
    }
  });
  await expect(page.locator(".price-roll")).toHaveCount(0);
  const real = await host.screenshot();
  return page.evaluate(
    async ({ a, b }) => {
      const draw = async (base64: string) => {
        const image = new Image();
        image.src = `data:image/png;base64,${base64}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d")!;
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, image.width, image.height).data;
      };
      const [x, y] = [await draw(a), await draw(b)];
      let count = 0;
      for (let i = 0; i < x.length; i += 4) {
        const delta = Math.max(
          Math.abs((x[i] ?? 0) - (y[i] ?? 0)),
          Math.abs((x[i + 1] ?? 0) - (y[i + 1] ?? 0)),
          Math.abs((x[i + 2] ?? 0) - (y[i + 2] ?? 0)),
        );
        if (delta > 48) count++;
      }
      return count / (x.length / 4);
    },
    { a: frozen.toString("base64"), b: real.toString("base64") },
  );
}

/**
 * Opens the page with the whole pricing section on screen, from its heading. A price only rolls while it can be
 * seen, and on a phone the cards stack, so the Pro price sits more than a screen below the currency switch; a
 * tall viewport keeps both in view without changing what is being tested. The page scrolls smoothly, which would
 * leave a scroll under way when the next step looks at where things are, so it is made instant here.
 */
async function open(page: Page) {
  await page.setViewportSize({ width: page.viewportSize()?.width ?? 1440, height: 2600 });
  await page.goto("/");
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
  await page.locator("#pricing-title").evaluate((el) => el.scrollIntoView({ block: "start" }));
  await page.mouse.move(2, 2);
}

test.describe("a price that changes rolls", () => {
  test("builds nothing while the page is at rest", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".price-roll")).toHaveCount(0);
    await expect(page.locator(".price-rolling")).toHaveCount(0);
  });

  test("rolls only the characters that changed, and hides itself from assistive technology", async ({
    page,
  }) => {
    await open(page);
    // £3 to €3.50: the symbol and ".50" change, the 3 stays where it is.
    await currency(page, "EUR").click();
    const line = priceLine(page, "Pro");
    const overlay = line.locator(".price-roll");
    await expect(overlay).toHaveAttribute("aria-hidden", "true");
    await expect(rollingCells(page, "Pro")).toHaveCount(4);
    await expect(overlay).toHaveText("3");
    // The real figure waits underneath, and the rolling digits leave nothing behind.
    await expect(line).toHaveClass(/price-rolling/);
    await expect(line.locator('[data-currency="EUR"]').first()).toBeHidden();
    await expect(line.locator('[data-currency="EUR"]').first()).toHaveText("€3.50");
    await expect(page.locator(".price-roll")).toHaveCount(0);
    await expect(page.locator(".price-rolling")).toHaveCount(0);
    await expect(line.getByText("€3.50", { exact: true })).toBeVisible();
  });

  test("rolls when the billing period changes too, down when the price falls", async ({ page }) => {
    await open(page);
    const dir = () =>
      priceLine(page, "Pro")
        .locator(".price-roll")
        .evaluate((el) => (el as HTMLElement).style.getPropertyValue("--dir"));
    await page.locator("#pricing label", { hasText: "Monthly" }).click();
    expect(await dir()).toBe("1"); // £3 to £4: up
    await expect(page.locator(".price-roll")).toHaveCount(0);
    await page.locator("#pricing label", { hasText: "Annually" }).click();
    expect(await dir()).toBe("-1"); // £4 to £3: down
    await expect(page.locator(".price-roll")).toHaveCount(0);
    await expect(priceLine(page, "Pro").getByText("£3", { exact: true })).toBeVisible();
  });

  test("ends exactly where the real figure is: its last frame matches the figure pixel for pixel", async ({
    page,
  }) => {
    await open(page);
    for (const code of ["AED", "RUB", "EUR", "GBP"]) {
      await currency(page, code).click();
      await expect(priceLine(page, "Pro")).toHaveClass(/price-rolling/);
      expect(await handOver(page, priceLine(page, "Pro")), code).toBeLessThan(0.01);
    }
  });

  test("survives being switched again before it has finished", async ({ page }) => {
    await open(page);
    for (const code of ["USD", "EUR", "AED", "RUB", "GBP"]) await currency(page, code).click();
    await expect(page.locator(".price-roll")).toHaveCount(0);
    await expect(page.locator(".price-rolling")).toHaveCount(0);
    await expect(priceLine(page, "Pro").getByText("£3", { exact: true })).toBeVisible();
    await expect(page.locator("#pricing-status")).toContainText("Pro £3");
  });

  test("keeps the whole page under 1,000 elements, even while it rolls", async ({ page }) => {
    await page.setViewportSize({ width: page.viewportSize()?.width ?? 1440, height: 2600 });
    await page.goto("/");
    await page.locator("#pricing-title").scrollIntoViewIfNeeded();
    await currency(page, "AED").click();
    await expect(page.locator(".price-rolling").first()).toBeAttached();
    const count = await page.evaluate(() => document.querySelectorAll("*").length);
    expect(count).toBeLessThanOrEqual(1000);
  });

  test("builds nothing under reduced motion, and the price still changes", async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 1440, height: 1100 },
    });
    const page = await context.newPage();
    await open(page);
    await currency(page, "USD").click();
    await expect(page.locator(".price-roll")).toHaveCount(0);
    await expect(page.locator(".price-rolling")).toHaveCount(0);
    await expect(priceLine(page, "Pro").getByText("$4", { exact: true })).toBeVisible();
    await context.close();
  });

  test("doesn't roll prices that are off screen, and still changes them", async ({ page }) => {
    await page.goto("/");
    // The switch is flipped from far above the cards (as the calculator's switch does), so nothing is visible.
    await page.evaluate(() => {
      const radio = document.getElementById("currency-usd") as HTMLInputElement;
      radio.checked = true;
      radio.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await expect(page.locator(".price-roll")).toHaveCount(0);
    await expect(page.locator(".price-rolling")).toHaveCount(0);
    await priceLine(page, "Pro").scrollIntoViewIfNeeded();
    await expect(priceLine(page, "Pro").getByText("$4", { exact: true })).toBeVisible();
  });

  test("still works with JavaScript off: the price changes, without the roll", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await currency(page, "USD").click();
    await expect(priceLine(page, "Pro").getByText("$4", { exact: true })).toBeVisible();
    await expect(page.locator(".price-roll")).toHaveCount(0);
    await context.close();
  });
});

test.describe("the calculator's totals", () => {
  test("change with the currency and the team size, without rolling", async ({ page }) => {
    await page.setViewportSize({ width: page.viewportSize()?.width ?? 1440, height: 2600 });
    await page.goto("/");
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
    await page.locator("#cost-title").evaluate((el) => el.scrollIntoView({ block: "start" }));
    await page.locator("#cost label").filter({ hasText: /^AED$/ }).click();
    await page.getByRole("slider", { name: "Team size" }).fill("120");
    await expect(page.locator("#cost .price-roll")).toHaveCount(0);
    await expect(page.locator("#cost .price-rolling")).toHaveCount(0);
    await expect(page.locator('#cost-saving [data-currency="AED"]')).toBeVisible();
    await expect(page.locator('#cost-saving [data-currency="AED"]')).toHaveText("Dh 162,660");
  });
});
