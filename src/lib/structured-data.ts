import { faq } from "@/content/faq";
import { home } from "@/content/home";
import { billingCurrency, plans } from "@/content/pricing";
import { platforms, site, type PlatformId } from "@/content/site";
import { gbpPrice } from "./pricing";

type JsonLdNode = Record<string, unknown>;

/** Schema.org wants operating systems by name; the page's labels ("iPhone and iPad") read better on screen. */
const operatingSystemNames: Record<PlatformId, string> = {
  web: "Web",
  macos: "macOS",
  windows: "Windows",
  linux: "Linux",
  ios: "iOS",
  android: "Android",
};

export const brandLogo = { path: "/brand/workchats-logo.png", width: 512, height: 512 } as const;

/**
 * Offers generated from content/pricing.ts, the same data the pricing cards render, so the page and
 * the structured data can't disagree. No rating, no "pre-order", no waitlist: nothing the page doesn't show.
 */
export function planOffers(): JsonLdNode[] {
  const offers: JsonLdNode[] = [];
  for (const plan of plans) {
    if (plan.price.kind === "custom") continue;
    const description = plan.features.join(", ");
    if (plan.price.kind === "free") {
      offers.push({
        "@type": "Offer",
        name: plan.name,
        price: "0.00",
        priceCurrency: billingCurrency,
        description,
      });
      continue;
    }
    for (const period of ["annual", "monthly"] as const) {
      const amount = gbpPrice(plan, period);
      if (amount === null) continue;
      const price = amount.toFixed(2);
      offers.push({
        "@type": "Offer",
        name: `${plan.name}, billed ${period === "annual" ? "annually" : "monthly"}`,
        price,
        priceCurrency: billingCurrency,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price,
          priceCurrency: billingCurrency,
          unitText: "per user per month",
        },
        description,
      });
    }
  }
  return offers;
}

/** The FAQ markup carries exactly the questions and answers shown on the page. */
export function faqEntities(): JsonLdNode[] {
  return faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  }));
}

export function homeJsonLd(): JsonLdNode {
  const organizationId = `${site.url}/#organization`;
  const websiteId = `${site.url}/#website`;
  const softwareId = `${site.url}/#software`;
  const questions = faqEntities();

  const graph: JsonLdNode[] = [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: site.name,
      legalName: site.company.legalName,
      url: site.url,
      email: site.company.supportEmail,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}${brandLogo.path}`,
        width: brandLogo.width,
        height: brandLogo.height,
      },
      founder: { "@type": "Person", name: site.founder.name, jobTitle: site.founder.role },
      sameAs: site.social.map((profile) => profile.href),
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: site.url,
      name: site.name,
      inLanguage: site.language,
      publisher: { "@id": organizationId },
    },
    {
      "@type": "WebPage",
      "@id": `${site.url}/#webpage`,
      url: `${site.url}/`,
      name: home.meta.title,
      description: home.meta.description,
      inLanguage: site.language,
      isPartOf: { "@id": websiteId },
      about: { "@id": softwareId },
    },
    {
      "@type": "SoftwareApplication",
      "@id": softwareId,
      name: site.name,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Team communication",
      operatingSystem: platforms.map((platform) => operatingSystemNames[platform.id]).join(", "),
      url: site.url,
      publisher: { "@id": organizationId },
      offers: planOffers(),
    },
  ];

  if (questions.length > 0) {
    graph.push({ "@type": "FAQPage", "@id": `${site.url}/#faq`, mainEntity: questions });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
