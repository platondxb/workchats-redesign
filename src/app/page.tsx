import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { priceRollScript } from "@/lib/price-roll";
import { homeJsonLd } from "@/lib/structured-data";
import { Cost } from "@/sections/home/Cost";
import { Customers } from "@/sections/home/Customers";
import { Downloads } from "@/sections/home/Downloads";
import { Faq } from "@/sections/home/Faq";
import { FinalCta } from "@/sections/home/FinalCta";
import { FreePlan } from "@/sections/home/FreePlan";
import { Hero } from "@/sections/home/Hero";
import { Pricing } from "@/sections/home/Pricing";
import { Regions } from "@/sections/home/Regions";
import { WorkingDay } from "@/sections/home/WorkingDay";

export const metadata: Metadata = {
  title: { absolute: home.meta.title },
  description: home.meta.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    locale: site.locale,
    title: home.meta.title,
    description: home.meta.description,
  },
  twitter: {
    card: "summary_large_image",
    title: home.meta.title,
    description: home.meta.description,
  },
};

/**
 * The home page makes one argument, in order (docs/redesign/strategy.md): what Workchats is and that five
 * people use it free, the product working across devices, who uses it, where its data lives and how it
 * is kept safe, the free plan and what happens at person six, the details that make it calm, every
 * device, what it saves, what it costs, questions, then the last step. The business case starts inside
 * the first two screens on a desktop. The route is fully static: no cookies, headers or uncached data.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <Hero />
      <Customers />
      <Regions />
      <FreePlan />
      <WorkingDay />
      <Downloads />
      <Cost />
      <Pricing />
      <Faq />
      <FinalCta />
      {/* Rolls the digits of a price in the pricing cards when the currency or the billing period changes (lib/price-roll.ts). */}
      <script dangerouslySetInnerHTML={{ __html: priceRollScript }} />
    </>
  );
}
