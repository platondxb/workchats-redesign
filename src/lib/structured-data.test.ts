import { describe, expect, it } from "vitest";
import { faq } from "@/content/faq";
import { plans } from "@/content/pricing";
import { gbpPrice } from "./pricing";
import { faqEntities, homeJsonLd, planOffers } from "./structured-data";

describe("structured data", () => {
  const data = homeJsonLd();
  const json = JSON.stringify(data);

  it("asserts nothing the page doesn't show", () => {
    expect(json).not.toContain("aggregateRating");
    expect(json).not.toContain("PreOrder");
    expect(json).not.toMatch(/waitlist|early access/i);
    expect(json).not.toMatch(/unconfirmed|needs content/i);
  });

  it("builds offers from the same prices the pricing cards render, in the billing currency", () => {
    const offers = planOffers();
    for (const plan of plans) {
      if (plan.price.kind !== "perUser") continue;
      for (const period of ["annual", "monthly"] as const) {
        expect(offers).toContainEqual(
          expect.objectContaining({ price: gbpPrice(plan, period)?.toFixed(2), priceCurrency: "GBP" }),
        );
      }
    }
    expect(offers).toContainEqual(expect.objectContaining({ name: "Free", price: "0.00" }));
    expect(offers.some((offer) => String(offer.name).startsWith("Enterprise"))).toBe(false);
  });

  it("marks up every question on the page, word for word", () => {
    expect(faqEntities()).toHaveLength(faq.length);
    expect(faqEntities()[0]).toMatchObject({
      name: faq[0]?.question,
      acceptedAnswer: { text: faq[0]?.answer },
    });
  });

  it("names the company the owner chose for the home page", () => {
    expect(json).toContain('"legalName":"Workchats Ltd"');
    expect(json).not.toContain("Octogle");
  });

  it("lists every platform, including the Linux AppImage", () => {
    expect(json).toContain('"operatingSystem":"macOS, Windows, Linux, iOS, Android, Web"');
  });

  it("can't break out of the script tag", () => {
    expect(json.includes("</script")).toBe(false);
  });
});
