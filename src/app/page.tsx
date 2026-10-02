import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { homeJsonLd } from "@/lib/structured-data";
import { Bento } from "@/sections/home/Bento";
import { Comparison } from "@/sections/home/Comparison";
import { Downloads } from "@/sections/home/Downloads";
import { Faq } from "@/sections/home/Faq";
import { Features } from "@/sections/home/Features";
import { FinalCta } from "@/sections/home/FinalCta";
import { Hero } from "@/sections/home/Hero";
import { Pricing } from "@/sections/home/Pricing";
import { Security } from "@/sections/home/Security";

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
 * The home page makes one argument, in order: what Workchats is (and a look at it working), what it
 * does, the details that make it calm, why the data is safe, what it replaces and saves, what it costs,
 * questions, then the last step. Security comes before the price, so the main objection is answered
 * before the ask. The route is fully static: no cookies, headers or uncached data.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <Hero />
      <Downloads />
      <Features />
      <Bento />
      <Security />
      <Comparison />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
