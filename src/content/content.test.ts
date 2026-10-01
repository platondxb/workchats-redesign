import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { faq } from "./faq";
import { home } from "./home";
import { comingSoon, primaryNav, isNavGroup } from "./navigation";

/** Every piece of copy on the page, as one string. */
function allCopy(): string {
  const dir = path.resolve(import.meta.dirname);
  return readdirSync(dir)
    .filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"))
    .map((file) => readFileSync(path.join(dir, file), "utf8"))
    .join("\n");
}

describe("metadata", () => {
  it("keeps the title within 60 characters and the description within 155", () => {
    expect(home.meta.title.length).toBeLessThanOrEqual(60);
    expect(home.meta.description.length).toBeLessThanOrEqual(155);
  });

  it("states the price per user, as the page does", () => {
    expect(home.meta.description).toContain("per user a month, billed annually");
  });
});

describe("copy rules", () => {
  const copy = allCopy();

  it("has no placeholders or unconfirmed markers", () => {
    expect(copy).not.toMatch(/unconfirmed|needs content|lorem ipsum|\bTODO\b|\bQ\d{1,2}\b/i);
    expect(copy).not.toMatch(/\[[A-Z][A-Z ]{3,}\]/); // e.g. [NEEDS CONTENT]
  });

  it("avoids the banned words", () => {
    for (const word of ["seamless", "supercharge", "unlock", "effortless", "next-level", "game-changer"]) {
      expect(copy.toLowerCase()).not.toContain(word);
    }
  });

  it("says 'No credit card needed' exactly once, next to the hero call to action", () => {
    expect(copy.match(/no credit card needed/gi)).toHaveLength(1);
    expect(home.hero.note).toContain("No credit card needed");
  });

  it("uses action labels instead of 'Get Started Free' or early-access language", () => {
    expect(copy).not.toMatch(/get started free|early access|waitlist|founding member/i);
  });

  it("uses UK spelling", () => {
    expect(copy).not.toMatch(/\borganization|\bcolor\b|\boptimize|\bcenter\b/);
  });

  it("keeps one static headline, the current site's own", () => {
    expect(home.hero.title).toBe("A simpler way to talk with your whole team");
  });
});

describe("unreleased features", () => {
  const unreleased = /social feed|\bevents\b|polls/i;

  it("are never described as available in the page copy", () => {
    expect(JSON.stringify({ home, faq })).not.toMatch(unreleased);
  });

  it("are always flagged as coming soon wherever they are linked", () => {
    const links = [
      ...primaryNav.flatMap((entry) =>
        isNavGroup(entry) ? [...entry.items, ...(entry.aside?.items ?? [])] : [entry],
      ),
      ...comingSoon.items,
    ];
    for (const link of links.filter((item) => unreleased.test(item.label))) {
      expect(link.comingSoon, link.label).toBe(true);
    }
  });
});

describe("the cost calculator", () => {
  it("adds up for the blog's 50-person example, from list prices", () => {
    const { calculator } = home.comparison;
    expect(calculator.seats).toBe(50);
    expect(calculator.fiveTools.total).toBe("£24,744");
    expect(calculator.workchats.total).toBe("£9,000");
    expect(calculator.saving.total).toBe("£15,744");
  });

  it("prices per user, so any team size works, and switches to Max above Pro's limit", () => {
    const { fiveTools, workchats } = home.comparison.calculator;
    expect(fiveTools.perUser).toBe(41.24);
    expect(workchats.pro.perUser).toBe(15); // Pro £3 + Google Workspace £12
    expect(workchats.max.perUser).toBe(17); // Max £5 + Google Workspace £12
    expect(workchats.proLimit).toBe(50);
  });
});
