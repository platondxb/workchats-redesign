import { describe, expect, it } from "vitest";
import { plans, type Plan } from "@/content/pricing";
import {
  annualSaving,
  convert,
  formatDisplayPrice,
  gbpPrice,
  lowestPaidPrice,
  maxAnnualSaving,
} from "./pricing";

function plan(id: Plan["id"]): Plan {
  const found = plans.find((p) => p.id === id);
  if (!found) throw new Error(`no plan ${id}`);
  return found;
}

describe("pricing data", () => {
  it("matches the published prices (GBP, per user a month)", () => {
    expect(gbpPrice(plan("free"), "monthly")).toBe(0);
    expect(gbpPrice(plan("pro"), "monthly")).toBe(4);
    expect(gbpPrice(plan("pro"), "annual")).toBe(3);
    expect(gbpPrice(plan("max"), "monthly")).toBe(7);
    expect(gbpPrice(plan("max"), "annual")).toBe(5);
    expect(gbpPrice(plan("enterprise"), "annual")).toBeNull();
  });

  it("matches the annual totals in the Terms (Pro £36, Max £60 per user a year)", () => {
    expect((gbpPrice(plan("pro"), "annual") ?? 0) * 12).toBe(36);
    expect((gbpPrice(plan("max"), "annual") ?? 0) * 12).toBe(60);
  });

  it("gives every tier its own action, and Enterprise a conversation rather than a free sign-up", () => {
    const labels = plans.map((p) => p.cta.label);
    expect(new Set(labels).size).toBe(plans.length);
    expect(plan("enterprise").cta).toMatchObject({ label: "Contact sales", href: "/contact" });
    expect(plans.filter((p) => p.cta.variant === "primary").map((p) => p.id)).toEqual(["free"]);
  });

  it("lists what each tier includes", () => {
    for (const p of plans) expect(p.features.length).toBeGreaterThanOrEqual(5);
  });
});

describe("display currencies", () => {
  it("converts with the current site's rates, rounded to the nearest half unit", () => {
    const pro = plan("pro");
    const max = plan("max");
    const shown = (p: Plan, currency: Parameters<typeof convert>[1]) => [
      convert(gbpPrice(p, "monthly") ?? 0, currency),
      convert(gbpPrice(p, "annual") ?? 0, currency),
    ];
    expect(shown(pro, "USD")).toEqual([5, 4]);
    expect(shown(max, "USD")).toEqual([9, 6.5]);
    expect(shown(pro, "EUR")).toEqual([4.5, 3.5]);
    expect(shown(max, "EUR")).toEqual([8, 6]);
    expect(shown(pro, "AED")).toEqual([18.5, 14]);
    expect(shown(max, "AED")).toEqual([32.5, 23.5]);
    expect(shown(pro, "RUB")).toEqual([420, 315]);
    expect(shown(max, "RUB")).toEqual([735, 525]);
  });

  it("leaves pounds and zero untouched", () => {
    expect(convert(3, "GBP")).toBe(3);
    expect(convert(0, "USD")).toBe(0);
  });

  it("formats with the symbol first and decimals only when needed", () => {
    expect(formatDisplayPrice(3, "GBP")).toBe("£3");
    expect(formatDisplayPrice(6.5, "USD")).toBe("$6.50");
    expect(formatDisplayPrice(14, "AED")).toBe("Dh 14");
    expect(formatDisplayPrice(24744, "GBP")).toBe("£24,744");
    expect(() => formatDisplayPrice(-1, "GBP")).toThrow(RangeError);
    expect(() => formatDisplayPrice(Number.NaN, "GBP")).toThrow(RangeError);
  });
});

describe("annual savings", () => {
  it("rounds down, so the page never overstates the saving", () => {
    expect(annualSaving(plan("pro"))).toBe(25);
    expect(annualSaving(plan("max"))).toBe(28); // 28.57%
    expect(maxAnnualSaving(plans)).toBe(28);
  });

  it("is not defined for free or custom plans", () => {
    expect(annualSaving(plan("free"))).toBeNull();
    expect(annualSaving(plan("enterprise"))).toBeNull();
  });
});

describe("lowestPaidPrice", () => {
  it("finds the entry price used in the meta description", () => {
    expect(lowestPaidPrice(plans, "annual")).toMatchObject({ amount: 3, plan: { id: "pro" } });
    expect(lowestPaidPrice(plans, "monthly")).toMatchObject({ amount: 4, plan: { id: "pro" } });
  });
});
