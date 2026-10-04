import { AxeBuilder } from "@axe-core/playwright";
import { devices, expect, test, type Page } from "@playwright/test";

/** The pricing actions that are the shiny button: the label each one shows, and where it goes. */
const shinyActions = [
  { cta: "pricing-max", label: "Start with Max" },
  { cta: "pricing-enterprise", label: "Contact sales" },
] as const;

const action = (page: Page, cta: string) => page.locator(`a[data-cta="${cta}"]`);

/** The animations running on the clock on the button and its pseudo-elements, as name:iterations. */
const running = (page: Page, cta: string) =>
  action(page, cta).evaluate((el) =>
    el
      .getAnimations({ subtree: true })
      .filter(
        (animation) => animation.playState === "running" && animation.timeline instanceof DocumentTimeline,
      )
      .map(
        (animation) =>
          `${(animation as CSSAnimation).animationName}:${animation.effect?.getComputedTiming().iterations}`,
      ),
  );

/** The animations on the button and its pseudo-elements that follow its place on the screen, as name:iterations. */
const followingScroll = (page: Page, cta: string) =>
  action(page, cta).evaluate((el) =>
    el
      .getAnimations({ subtree: true })
      .filter((animation) => animation.timeline?.constructor.name === "ViewTimeline")
      .map(
        (animation) =>
          `${(animation as CSSAnimation).animationName}:${animation.effect?.getComputedTiming().iterations}`,
      ),
  );

/** A touch screen has nothing to hover with: that is where the button follows the scroll instead. */
const hasNoHover = (page: Page) => page.evaluate(() => matchMedia("(hover: none)").matches);

/** The page scrolls smoothly, so a scroll would still be under way when the test looks; make it instant. */
const scrollNow = (page: Page, top: number) =>
  page.evaluate((by) => window.scrollBy({ top: by, behavior: "instant" }), top);

for (const { cta, label } of shinyActions) {
  test.describe(`the shiny "${label}" button`, () => {
    test("is still until the visitor points at it: nothing loops by itself", async ({ page }) => {
      await page.goto("/");
      await action(page, cta).scrollIntoViewIfNeeded();
      await page.mouse.move(2, 2);
      expect(await running(page, cta)).toEqual([]);
      // The page-wide rule (WCAG 2.2.2): no animation on the page repeats forever at rest.
      const looping = await page.evaluate(
        () =>
          document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations === Infinity)
            .length,
      );
      expect(looping).toBe(0);
    });

    test("turns its highlight, shimmer and glow while hovered, and stops when the pointer leaves", async ({
      page,
    }) => {
      await page.goto("/");
      test.skip(await hasNoHover(page), "hover is a pointer interaction");
      const button = action(page, cta);
      await button.scrollIntoViewIfNeeded();
      await button.hover();
      await expect
        .poll(() => running(page, cta))
        .toEqual(
          expect.arrayContaining([
            "shiny-angle:Infinity",
            "shiny-shimmer:Infinity",
            "shiny-breathe:Infinity",
          ]),
        );
      await page.mouse.move(2, 2);
      await expect.poll(() => running(page, cta)).toEqual([]);
    });

    test("on a touch screen it turns with the scroll, not the clock, and holds still when the scrolling does", async ({
      page,
    }) => {
      await page.goto("/");
      test.skip(!(await hasNoHover(page)), "only a touch screen follows the scroll");
      await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
      const button = action(page, cta);
      await button.evaluate((el) => el.scrollIntoView({ block: "center" }));
      // The highlight and the shimmer turn once and the glow breathes twice across the screen, each tied to
      // where the button is. Nothing runs on the clock, and nothing repeats for ever.
      expect(await followingScroll(page, cta)).toEqual(
        expect.arrayContaining(["shiny-angle:1", "shiny-shimmer:1", "shiny-breathe:2"]),
      );
      expect(await running(page, cta)).toEqual([]);
      const angle = () => button.evaluate((el) => getComputedStyle(el).getPropertyValue("--shiny-angle"));
      const before = await angle();
      await scrollNow(page, 150);
      await expect.poll(angle).not.toBe(before);
      const after = await angle();
      await page.waitForTimeout(300);
      expect(await angle()).toBe(after);
    });

    test("also runs for keyboard focus, and stops on blur", async ({ page }) => {
      await page.goto("/");
      const button = action(page, cta);
      await button.scrollIntoViewIfNeeded();
      // A key press first, so the browser treats the focus that follows as keyboard focus (:focus-visible).
      await page.keyboard.press("Tab");
      await button.focus();
      await expect(button).toBeFocused();
      await expect.poll(() => running(page, cta)).toContain("shiny-angle:Infinity");
      await button.blur();
      await expect.poll(() => running(page, cta)).toEqual([]);
    });

    test("shows its final state, with no motion at all, under reduced motion", async ({ browser }) => {
      const context = await browser.newContext({
        reducedMotion: "reduce",
        viewport: { width: 1440, height: 900 },
      });
      const page = await context.newPage();
      await page.goto("/");
      const button = action(page, cta);
      await button.scrollIntoViewIfNeeded();
      await button.hover();
      await page.waitForTimeout(300);
      expect(await running(page, cta)).toEqual([]);
      await context.close();
    });

    test("keeps its still frame on a touch screen under reduced motion", async ({ browser }) => {
      const context = await browser.newContext({ ...devices["Pixel 7"], reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto("/");
      const button = action(page, cta);
      await button.scrollIntoViewIfNeeded();
      await scrollNow(page, 100);
      await page.waitForTimeout(200);
      expect(await button.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
      await context.close();
    });

    test("keeps its label readable and its name unchanged, in the light theme", async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("workchats-theme", "light"));
      await page.goto("/");
      await expect(page.getByRole("link", { name: label })).toBeVisible();
      const results = await new AxeBuilder({ page })
        .include(`a[data-cta="${cta}"]`)
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => v.id)).toEqual([]);
    });

    test("is at least 44px tall and as wide as its label", async ({ page }) => {
      await page.goto("/");
      const box = await action(page, cta).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    });
  });
}

test("Contact sales is still a plain link to the contact page", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: "Contact sales" });
  await expect(link).toHaveAttribute("href", "/contact");
  await expect(link).toHaveAttribute("data-cta", "pricing-enterprise");
});
