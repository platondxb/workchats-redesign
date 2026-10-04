import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { findCompetitorNames } from "./competitors";
import { faq } from "./faq";
import { home } from "./home";
import { comingSoon, primaryNav, isNavGroup } from "./navigation";
import { quotas } from "./pricing";
import { hostingRegions } from "./site";

/** Every piece of copy on the page, as one string (the competitor list itself is left out). */
function allCopy(): string {
  const dir = path.resolve(import.meta.dirname);
  return readdirSync(dir)
    .filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts") && file !== "competitors.ts")
    .map((file) => readFileSync(path.join(dir, file), "utf8"))
    .join("\n");
}

/** The copy as rendered strings only, without source comments. */
const renderedCopy = JSON.stringify({ home, faq });

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

  it("avoids the brief's banned words", () => {
    for (const word of [
      "seamless",
      "elevate",
      "unleash",
      "supercharge",
      "next-gen",
      "game-changer",
      "effortless",
      "all-in-one solution",
      "unlock",
      "next-level",
    ]) {
      expect(renderedCopy.toLowerCase()).not.toContain(word);
    }
  });

  it("says 'No credit card needed' once, beside the hero's action, and nowhere else mentions a card", () => {
    expect(renderedCopy.match(/no credit card needed/gi)).toHaveLength(1);
    expect(renderedCopy.match(/credit card|card details/gi)).toHaveLength(1);
    expect(home.hero.caption).toContain("No credit card needed");
  });

  it("asks no rhetorical questions in section headings", () => {
    const titles = [
      home.regions.title,
      home.freePlan.title,
      home.day.title,
      home.download.title,
      home.cost.title,
      home.pricing.title,
      home.faq.title,
      home.finalCta.title,
    ];
    for (const title of titles) expect(title).not.toMatch(/\?$/);
    expect(titles.join(" ")).not.toMatch(/\. Nothing |^Not .+, but /);
  });

  it("uses action labels instead of 'Get Started Free' or early-access language", () => {
    expect(renderedCopy).not.toMatch(/get started free|early access|waitlist|founding member/i);
  });

  it("uses UK spelling", () => {
    expect(copy).not.toMatch(/\borganization|\bcolor\b|\boptimize|\bcenter\b/);
  });

  it("never names a competing product in anything the page renders", () => {
    expect(findCompetitorNames(renderedCopy)).toEqual([]);
  });
});

describe("the hero", () => {
  it("says what Workchats is, then what trying it costs", () => {
    expect(home.hero.title).toEqual([
      "Team chat, calls and files.",
      `Free for up to ${quotas.free.members} people.`,
    ]);
  });

  it("pairs the action with the free plan and the price of the next step", () => {
    expect(home.hero.caption).toMatch(/no time limit/);
    expect(home.hero.caption).toContain("Pro is £3 a person a month");
  });
});

describe("unreleased features", () => {
  const unreleased = /social feed|\bevents\b|polls/i;

  it("are never described as available in the page copy", () => {
    expect(renderedCopy).not.toMatch(unreleased);
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

describe("where the data lives", () => {
  it("names the three hosting regions, in the owner's approved words", () => {
    expect(home.regions.title).toBe("Hosted in the UK, the EU or the UAE");
    expect(home.regions.compliance).toMatch(/^GDPR compliant, with audit logs and data export/);
  });

  it("keeps the security facts beside the regions, so the business case starts in the first two screens", () => {
    expect(home.regions.intro).toContain("end-to-end encrypted");
    expect(home.regions.intro).toContain("99.9% uptime SLA on Pro and above");
  });

  it("describes the globe in words, naming every region", () => {
    for (const region of hostingRegions) expect(home.regions.globeLabel).toContain(region.name);
  });
});

describe("the free plan", () => {
  it("prices the sixth person from the Pro list price", () => {
    expect(home.freePlan.sixth.price).toBe("6 people on Pro: £18 a month, billed annually.");
  });
});

describe("the cost calculator", () => {
  const { calculator, stack } = home.cost;

  it("adds up for the cost breakdown's 50-person example, from list prices", () => {
    expect(calculator.seats).toBe(50);
    expect(calculator.stack.totalGbp).toBe(24744);
    expect(calculator.workchats.totalGbp).toBe(9000);
    expect(calculator.saving.totalGbp).toBe(15744);
  });

  it("prices per person, so any team size works, and switches to Max above Pro's limit", () => {
    expect(calculator.stack.perUser).toBe(41.24);
    expect(calculator.workchats.pro.perUser).toBe(15); // Pro £3 + the office suite £12
    expect(calculator.workchats.max.perUser).toBe(17); // Max £5 + the office suite £12
    expect(calculator.workchats.proLimit).toBe(50);
  });

  it("names categories, not products, keeps the office suite and dates the prices", () => {
    expect(stack).toHaveLength(5);
    expect(stack.filter((item) => item.kept).map((item) => item.category)).toEqual(["An office suite"]);
    expect(home.cost.title).toBe("A typical team pays for five tools. Workchats replaces four.");
    expect(calculator.note).toMatch(
      /List prices per person, billed annually, before VAT, checked [A-Z][a-z]+ \d{4}\./,
    );
  });
});
