import type { Metadata } from "next";
import { Stack_Sans_Headline, Stack_Sans_Text } from "next/font/google";
import { ConsentManager } from "@/components/consent/ConsentManager";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { gaMeasurementId } from "@/lib/analytics";
import "./globals.css";

// One superfamily in two optical styles, self-hosted by next/font: two WOFF2 files, Latin subset.
// next/font can't generate metric-matched fallbacks for Stack Sans, so ours are declared in globals.css.
const stackText = Stack_Sans_Text({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-stack-text",
  adjustFontFallback: false,
  fallback: ["Stack Sans Text Fallback"],
});

const stackHeadline = Stack_Sans_Headline({
  subsets: ["latin"],
  weight: "700", // the headline face is only used bold: one small static file instead of the variable font
  display: "swap",
  variable: "--font-stack-headline",
  adjustFontFallback: false,
  fallback: ["Stack Sans Headline Fallback"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: home.meta.title, template: `%s | ${site.name}` },
  description: home.meta.description,
  applicationName: site.name,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={site.language} className={`${stackText.variable} ${stackHeadline.variable}`}>
      <body>
        <SkipLink />
        <SiteHeader />
        <main id="main" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
        <SiteFooter />
        {gaMeasurementId ? (
          <ConsentManager gaId={gaMeasurementId} policyHref={site.links.cookiePolicy} />
        ) : null}
      </body>
    </html>
  );
}
