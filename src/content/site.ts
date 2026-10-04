/**
 * Site-wide facts: URLs, company details, platforms, customers and social profiles.
 * Sources: workchats.com home page, /about, /download, /faq, /terms-conditions and /privacy-policy, and the
 * site owner's answers of 3 October 2026 (docs/redesign/strategy.md).
 */

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.workchats.com").replace(/\/$/, "");

export const site = {
  name: "Workchats",
  url: siteUrl,
  locale: "en_GB",
  language: "en-GB",

  links: {
    signUp: "https://admin.workchats.com/signup/",
    signIn: "https://app.workchats.com/",
    bookDemo: "/book-a-demo",
    contact: "/contact",
    download: "/download",
    pricing: "/pricing",
    features: "/features",
    faq: "/faq",
    about: "/about",
    cookiePolicy: "/cookie-policy",
    costBreakdown: "/blog/real-cost-of-running-five-team-communication-tools",
  },

  company: {
    /** The name the owner chose for the home page (3 Oct 2026), in the footer and the structured data. */
    legalName: "Workchats Ltd",
    teams: "Dubai, London and Pune",
    supportEmail: "support@workchats.com",
  },

  founder: {
    name: "Yaseen Deen",
    role: "Founder",
  },

  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/workchats/", icon: "linkedin" },
    { label: "Instagram", href: "https://www.instagram.com/workchatsapp/", icon: "instagram" },
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61573854117007", icon: "facebook" },
  ],
} as const;

export type SocialIcon = (typeof site.social)[number]["icon"];

/**
 * The platforms Workchats runs on and what each one needs, as listed on /download.
 *
 * `href` is null for every platform in this MVP: the owner asked for download buttons that take a press
 * and do nothing else until the store and installer links are confirmed (3 Oct 2026). Setting an `href`
 * turns that platform's button into a link everywhere it appears; nothing else needs to change.
 * The live /download page links GitHub releases for macOS, Windows and Linux, the App Store
 * (id6751442418) and Google Play (com.octogle.workchats); see docs/redesign/audit.md §5.7.
 */
export interface Platform {
  id: PlatformId;
  label: string;
  detail: string;
  /** The hero's download button when the visitor's device is this platform. */
  cta: string;
  href: string | null;
}

export type PlatformId = "web" | "macos" | "windows" | "linux" | "ios" | "android";

export const platforms: readonly Platform[] = [
  { id: "macos", label: "macOS", detail: "Apple Silicon, macOS 12+", cta: "Download for macOS", href: null },
  { id: "windows", label: "Windows", detail: "Windows 10 or 11", cta: "Download for Windows", href: null },
  { id: "linux", label: "Linux", detail: "AppImage, 64-bit", cta: "Download for Linux", href: null },
  { id: "ios", label: "iPhone and iPad", detail: "iOS 15+", cta: "Download for iOS", href: null },
  { id: "android", label: "Android", detail: "Phone and tablet", cta: "Download for Android", href: null },
  { id: "web", label: "Web", detail: "Any modern browser", cta: "Open the web app", href: null },
];

/** The hero's download button when the device can't be told, or JavaScript is off. */
export const genericDownloadLabel = "Download the app";

/**
 * Customers the owner confirmed may be named, as customers, on 3 October 2026 (docs/redesign/strategy.md).
 * Shown as text in the site's own typeface: using each company's logo needs that company's permission.
 * "Ericsson" is the company's own spelling.
 */
export const customers = {
  label: "Used by teams at",
  names: ["AWS", "Microsoft", "Google", "GoDaddy", "IBM", "Ericsson", "EPAM"],
} as const;

/** Calendar integrations, live per the owner (3 Oct 2026) and /features/video-meetings. */
export const calendarIntegrations = ["Google Calendar", "Outlook", "iCal"] as const;

/**
 * Where data is hosted (FAQ: "the UK, EU, or Middle East"; the owner confirmed the United Arab Emirates for
 * the Middle East, 3 October 2026), and the data-protection law that applies in each (Terms, "Data
 * protection": UK GDPR, EU GDPR and the UAE's PDPL).
 *
 * `point` places the region on the globe, at its geographic centre: it marks the region, not a data centre.
 * (Capitals would put the UK's and the EU's points almost on top of each other: London and Brussels are
 * 320 km apart.)
 */
export const hostingRegions = [
  {
    id: "gb",
    name: "United Kingdom",
    short: "UK",
    law: "UK GDPR",
    point: [54, -2], // CIA World Factbook, "Geographic coordinates"
  },
  {
    id: "eu",
    name: "European Union",
    short: "EU",
    law: "EU GDPR",
    point: [49.8431, 9.9019], // Gadheim, Bavaria: the EU's geographic midpoint since 2020 (IGN)
  },
  {
    id: "ae",
    name: "United Arab Emirates",
    short: "UAE",
    law: "UAE PDPL, Federal Decree-Law No. 45 of 2021",
    point: [24, 54], // CIA World Factbook, "Geographic coordinates"
  },
] as const satisfies readonly {
  id: string;
  name: string;
  short: string;
  law: string;
  point: readonly [number, number];
}[];

export type RegionId = (typeof hostingRegions)[number]["id"];
