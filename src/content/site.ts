/**
 * Site-wide facts: URLs, company details, platforms and social profiles.
 * Sources: workchats.com home page, /about, /download, /faq, /terms-conditions and /privacy-policy.
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
    /** As shown in the current site's footer. */
    tradingName: "Workchats Ltd",
    /** The company that builds and runs Workchats (Terms §20, Privacy Policy, About, FAQ). */
    operator: "Octogle Technologies Ltd",
    operatorLocation: "Dubai, United Arab Emirates",
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
 * The platforms Workchats runs on, and what each one needs, as listed on /download.
 * No release-status labels: the redesign presents every platform as an equal, current option.
 */
export const platforms = [
  { id: "web", label: "Web", detail: "Any modern browser" },
  { id: "macos", label: "macOS", detail: "Apple Silicon, macOS 12+" },
  { id: "windows", label: "Windows", detail: "Windows 10 or 11" },
  { id: "linux", label: "Linux", detail: "AppImage, 64-bit" },
  { id: "ios", label: "iOS", detail: "iPhone and iPad, iOS 15+" },
  { id: "android", label: "Android", detail: "Phone and tablet" },
] as const;

export type PlatformId = (typeof platforms)[number]["id"];
