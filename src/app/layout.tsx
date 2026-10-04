import type { Metadata, Viewport } from "next";
import { Stack_Sans_Headline, Stack_Sans_Text } from "next/font/google";
import { ConsentManager } from "@/components/consent/ConsentManager";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { LiquidGlassFilter } from "@/components/ui/liquid-glass-button";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { gaMeasurementId } from "@/lib/analytics";
import { analyticsEventsScript } from "@/lib/analytics-events";
import { platformScript } from "@/lib/platform";
import { themeScript } from "@/lib/theme";
import { metaColours } from "@/styles/meta-colours";
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

/** The site is dark until the visitor picks the light theme (lib/theme.ts): browser chrome and form controls follow it. */
export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: metaColours.night,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the <head> scripts set data-theme and data-os on <html> before React hydrates.
    <html
      lang={site.language}
      className={`${stackText.variable} ${stackHeadline.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Runs before the first paint: the visitor's saved theme, so the page never flashes the wrong one (lib/theme.ts). */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Runs before the first paint: the visitor's platform, for the download labels (lib/platform.ts). */}
        <script dangerouslySetInnerHTML={{ __html: platformScript }} />
        {/* Analytics events, sent only once gtag exists, which is only after consent (lib/analytics-events.ts). */}
        <script dangerouslySetInnerHTML={{ __html: analyticsEventsScript }} />
      </head>
      <body>
        <SkipLink />
        <SiteHeader />
        <main id="main" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
        <SiteFooter />
        <LiquidGlassFilter />
        {gaMeasurementId ? (
          <ConsentManager gaId={gaMeasurementId} policyHref={site.links.cookiePolicy} />
        ) : null}
      </body>
    </html>
  );
}
