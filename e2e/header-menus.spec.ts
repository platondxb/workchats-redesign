import { expect, test, type Page } from "@playwright/test";

const menus = ["Features", "Solutions", "Resources"] as const;
const widths = [1024, 1280, 1440] as const;

/** Opens a menu and returns where its panel, its button and the glass pill are, in CSS pixels. */
async function openMenu(page: Page, name: string) {
  await page.mouse.move(2, 400);
  const button = page.locator("header nav button[aria-expanded]").filter({ hasText: name });
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  // The panel has settled once its slide-in has finished.
  await page.waitForTimeout(350);
  return button.evaluate((trigger) => {
    const item = trigger.closest("li");
    const wrapper = item?.querySelector<HTMLElement>("[id]:not([hidden])");
    const glass = document.querySelector("header [data-nav-glass]");
    if (!item || !wrapper || !glass) throw new Error("the header's markup is missing");
    const panel = wrapper.getBoundingClientRect();
    const pill = glass.getBoundingClientRect();
    const own = trigger.getBoundingClientRect();
    return {
      panel: {
        left: panel.left,
        right: panel.right,
        top: wrapper.firstElementChild?.getBoundingClientRect().top ?? 0,
      },
      pill: { left: pill.left, right: pill.right, bottom: pill.bottom },
      button: { centre: own.left + own.width / 2 },
      shift: wrapper.style.getPropertyValue("--menu-shift"),
    };
  });
}

async function openPage(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/");
  // The page scrolls smoothly, which would leave a scroll under way when the test measures.
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
}

test.describe("the header's menu panels", () => {
  test.beforeEach(({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024, "the menus are the desktop layout");
  });

  test("stay inside the glass pill, and on screen, once the header has gathered into it", async ({
    page,
  }) => {
    for (const width of widths) {
      await openPage(page, width);
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(200);
      for (const name of menus) {
        const { panel, pill } = await openMenu(page, name);
        const where = `${name} at ${width}px`;
        expect(panel.left, `${where}: left of the pill`).toBeGreaterThanOrEqual(pill.left - 1);
        expect(panel.right, `${where}: right of the pill`).toBeLessThanOrEqual(pill.right + 1);
        expect(panel.left, `${where}: on screen`).toBeGreaterThanOrEqual(0);
        // And it still starts right where the navigation ends.
        expect(Math.abs(panel.top - pill.bottom), `${where}: under the pill`).toBeLessThanOrEqual(2);
        await page.keyboard.press("Escape");
      }
    }
  });

  test("hang centred under their button at the top of the page, as they always did", async ({ page }) => {
    await openPage(page, 1440);
    for (const name of menus) {
      const { panel, button, shift } = await openMenu(page, name);
      expect(Math.abs((panel.left + panel.right) / 2 - button.centre), name).toBeLessThanOrEqual(1);
      expect(shift, name).toBe("0px");
      await page.keyboard.press("Escape");
    }
  });

  test("move in as the page scrolls while one is open, and back out at the top", async ({ page }) => {
    await openPage(page, 1440);
    const open = await openMenu(page, "Features");
    // At the top the pill is not drawn, so the panel is where it is centred: past the pill's left end.
    expect(open.panel.left).toBeLessThan(open.pill.left);
    await page.evaluate(() => window.scrollTo(0, 300));
    await expect
      .poll(() =>
        page
          .locator("header [data-menu-item]")
          .first()
          .evaluate((li) => {
            const wrapper = li.querySelector<HTMLElement>("[id]");
            const glass = document.querySelector("header [data-nav-glass]");
            return (wrapper?.getBoundingClientRect().left ?? 0) - (glass?.getBoundingClientRect().left ?? 0);
          }),
      )
      .toBeGreaterThanOrEqual(-1);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect
      .poll(() =>
        page
          .locator("header [data-menu-item]")
          .first()
          .evaluate((li) => {
            const wrapper = li.querySelector<HTMLElement>("[id]");
            const glass = document.querySelector("header [data-nav-glass]");
            return (wrapper?.getBoundingClientRect().left ?? 0) - (glass?.getBoundingClientRect().left ?? 0);
          }),
      )
      .toBeLessThan(-40);
  });

  test("give the position back when they close", async ({ page }) => {
    await openPage(page, 1440);
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(200);
    const open = await openMenu(page, "Features");
    expect(open.shift).not.toBe("0px");
    await page.keyboard.press("Escape");
    const left = await page
      .locator("header [data-menu-item]")
      .first()
      .evaluate((li) => li.querySelector<HTMLElement>("[id]")?.style.getPropertyValue("--menu-shift"));
    expect(left).toBe("");
  });
});
