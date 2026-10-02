import { formatDisplayPrice, gbpPrice, lowestPaidPrice, maxAnnualSaving } from "@/lib/pricing";
import { plans, quotas } from "./pricing";
import { site } from "./site";

/**
 * Home page copy. Facts come from workchats.com: the home page, /features/*, /faq, /about, /download,
 * /terms-conditions, /privacy-policy and the five-tools cost breakdown on the blog. UK English.
 */

function requireAmount(amount: number | null | undefined, what: string): number {
  if (amount === null || amount === undefined) throw new Error(`Missing ${what} in content/pricing.ts`);
  return amount;
}

const proPlan = plans.find((plan) => plan.id === "pro");
const maxPlan = plans.find((plan) => plan.id === "max");
const proAnnual = requireAmount(proPlan ? gbpPrice(proPlan, "annual") : null, "the Pro annual price");
const maxAnnual = requireAmount(maxPlan ? gbpPrice(maxPlan, "annual") : null, "the Max annual price");
const fromPrice = formatDisplayPrice(
  requireAmount(lowestPaidPrice(plans, "annual")?.amount, "a paid price"),
  "GBP",
);

/** The five-tool stack from the blog breakdown: list price per user a month, annual billing. */
const fiveToolStack = [
  { tool: "Slack Pro", job: "Channels and DMs", price: 7.25 },
  { tool: "Zoom Pro", job: "Meetings", price: 11.99 },
  { tool: "Google Workspace Business Standard", job: "Email, calendar and Drive", price: 12 },
  { tool: "Loom Business", job: "Async video", price: 10 },
  { tool: "WhatsApp", job: "Everything that fits nowhere else", price: 0 },
] as const;
const keptTool = fiveToolStack[2];
const seats = 50;
const yearly = (perUserMonthly: number) => Math.round(perUserMonthly * seats * 12);
const fiveToolsYear = fiveToolStack.reduce((sum, item) => sum + yearly(item.price), 0);
const consolidatedYear = yearly(proAnnual) + yearly(keptTool.price);
/** Per user a month, so the calculator can scale every figure with the team size. */
const fiveToolsPerUser = Math.round(fiveToolStack.reduce((sum, item) => sum + item.price, 0) * 100) / 100;

const gbp = (amount: number) => formatDisplayPrice(amount, "GBP");

export const home = {
  meta: {
    title: "Workchats: team chat, video calls and files in one app",
    description: `Team chat, video calls and file search in one app for teams of 10 to 500. Free for up to ${quotas.free.members} people. Pro from ${fromPrice} per user a month, billed annually.`,
  },

  og: {
    alt: `Workchats: a simpler way to talk with your whole team. Free for up to ${quotas.free.members} people, Pro from ${fromPrice} per user a month.`,
    subline: `Free for up to ${quotas.free.members} people. Pro from ${fromPrice} per user a month.`,
  },

  hero: {
    title: "A simpler way to talk with your whole team",
    lead: "Great teams don't need more apps. Workchats puts messages, video calls and files in one calm place, with no time limit on calls and end-to-end encryption on every plan.",
    primary: { label: "Start free", href: site.links.signUp },
    secondary: { label: "Book a demo", href: site.links.bookDemo },
    note: `Free for up to ${quotas.free.members} people. No credit card needed.`,
    productLabel:
      "The Workchats app. In the #spring-launch channel, Priya Shah suggests a quick check-in and starts a call from the conversation; the call arrives on a teammate's phone.",
  },

  /**
   * The downloads bar. Every platform is a real, pressable button. There is no downloads route in this
   * app yet, so in this MVP the buttons take a press and do nothing else: no navigation, no swap.
   */
  downloads: {
    label: "Supported platforms",
    title: "Workchats runs on",
    hint: "Choose a platform to see what you'll need.",
  },

  features: {
    title: "Everything your team needs. Nothing they don't.",
    intro:
      "Workchats keeps your conversations, calls, files and calendar in one place. Each part works on its own, and better together.",
    all: { label: "Explore all features", href: site.links.features },
    legend: "Choose a feature",
    tabs: [
      {
        id: "messaging",
        tab: "Messaging",
        title: "Every kind of conversation, in one place",
        body: "DMs for quick questions, channels for team plans, voice notes for the long stories.",
        points: [
          "Public, private and announcement channels",
          "Threads, reactions and pinned messages",
          "Works offline: draft now, sends later",
        ],
        link: { label: "Explore messaging", href: "/features/messaging" },
        productLabel:
          "The #design channel in Workchats, with a pinned launch date, a message with reactions and a two-reply thread, and a read receipt.",
      },
      {
        id: "meetings",
        tab: "Video and meetings",
        title: "Calls that start where the conversation lives",
        body: "One click from any chat. No meeting link to paste, no separate app.",
        points: [
          `Group calls for up to ${quotas.pro.groupCallPeople} on Pro, ${quotas.max.groupCallPeople} on Max`,
          "Screen sharing with live annotation",
          "Recordings with AI transcripts and summaries",
        ],
        link: { label: "Explore video and meetings", href: "/features/video-meetings" },
        productLabel:
          "A Workchats call that has run for over an hour: Tom Hughes is sharing his screen, Priya Shah is speaking, and the toolbar has microphone, camera, screen sharing, chat and leave controls.",
      },
      {
        id: "files",
        tab: "Files and search",
        title: "Share a file once. Find it forever.",
        body: "Files stay with the message they came with, and one search bar finds everything.",
        points: [
          "PDF previews right in the chat",
          "Filter by who sent it, when and where",
          "Nothing archived after 90 days, on any plan",
        ],
        link: { label: "Explore files and search", href: "/features/files-search" },
        productLabel:
          "Workchats search results for “brand guidelines”: the PDF shared by Amara Okafor, the message it came with, and Sofia Marín from brand and marketing.",
      },
    ],
  },

  bento: {
    title: "Built for teams who actually talk",
    intro: "Designed by studying how real teams communicate, not by copying what already exists.",
    tiles: {
      calls: {
        title: "No time limit on calls",
        body: "Every call runs as long as it needs to. No cutoffs and no upgrade prompts, on any plan.",
      },
      hours: {
        title: "Working hours, respected",
        body: "Set start and end times for each day. Teammates see your hours on your profile, so nobody gets pinged on a Sunday.",
      },
      workspaces: {
        title: "Every company, one account",
        body: "Switch between the organisations you belong to without signing out. Each keeps its own channels and settings.",
      },
      offline: {
        title: "Works offline",
        body: "Read, draft and queue messages with no connection. They send the moment you're back.",
      },
      connections: {
        title: "Quiet inboxes",
        body: "People outside your immediate team send a connection request before they can message you. No cold outreach.",
      },
    },
  },

  comparison: {
    title: "One app instead of five",
    intro:
      "Most teams pay for Slack, Zoom, Google Workspace and Loom, then end up in WhatsApp anyway. Workchats replaces all of it except email.",
    pricesLabel: "What the five cost, per user a month",
    stack: fiveToolStack.map((item) => ({
      tool: item.tool.replace(" Business Standard", ""),
      price: gbp(item.price),
    })),
    calculator: {
      label: "Team size",
      unit: "people",
      seats,
      min: 10,
      max: 200,
      step: 10,
      currencyLegend: "Show the totals in",
      /** Totals are whole pounds; the section shows them in the visitor's chosen currency. */
      fiveTools: { label: "Five separate tools", perUser: fiveToolsPerUser, totalGbp: fiveToolsYear },
      workchats: {
        /** Pro covers up to 50 people; larger teams need Max. */
        proLimit: quotas.pro.members,
        pro: {
          label: `Workchats Pro + ${keptTool.tool.replace(" Business Standard", "")}`,
          perUser: proAnnual + keptTool.price,
        },
        max: {
          label: `Workchats Max + ${keptTool.tool.replace(" Business Standard", "")}`,
          perUser: maxAnnual + keptTool.price,
        },
        totalGbp: consolidatedYear,
      },
      saving: { label: "You save", totalGbp: fiveToolsYear - consolidatedYear, suffix: "a year" },
      perYear: "a year",
      cta: { label: "Start free", href: site.links.signUp },
      note: `List prices per user, billed annually, before VAT. Above ${quotas.pro.members} people the sum uses Workchats Max. Converted totals are approximate.`,
    },
    source: { label: "Read the full cost breakdown", href: site.links.costBreakdown },
  },

  pricing: {
    title: "Pricing that's simple and affordable",
    intro: `Start free with up to ${quotas.free.members} team members. Upgrade when you need more space, more people or more control.`,
    periodLegend: "Billing period",
    annual: "Annually",
    monthly: "Monthly",
    saving: `Save up to ${maxAnnualSaving(plans)}%`,
    currencyLegend: "Show prices in",
    currencyNote: "Billed in pounds sterling. Prices in other currencies are approximate.",
    compare: { label: "Compare every plan in detail", href: site.links.pricing },
  },

  security: {
    title: "Your team's data stays your team's data",
    regionsLabel: "Hosted in your region",
    regions: [
      { id: "gb", name: "United Kingdom" },
      { id: "eu", name: "European Union" },
      { id: "ae", name: "Middle East" },
    ],
    cards: {
      encryption: {
        title: "End-to-end encryption",
        body: "On every message, call and file. Even on Free.",
      },
      privacy: {
        title: "Granular privacy settings",
        body: "Everyone controls who sees their role, status and messages.",
      },
      compliance: {
        title: "GDPR compliant",
        body: "With audit logs, data export and hosting in your region.",
      },
    },
    /** What the product pictures in the cards show. Plan availability from /faq and the pricing cards. */
    encryption: { covers: ["Messages", "Calls", "Files"], specs: ["AES-256 at rest", "TLS in transit"] },
    compliance: [
      { id: "gdpr", label: "GDPR compliant", plan: "All plans" },
      { id: "export", label: "Full data export", plan: "From Pro" },
      { id: "audit", label: "Audit logs", plan: "From Pro" },
    ],
    review: {
      title: "Running a security review?",
      body: "We'll walk your IT team through it.",
      cta: { label: "Book a demo", href: site.links.bookDemo },
    },
  },

  roadmap: {
    title: "Coming soon",
    intro: "Designed and in development. Not available yet.",
  },

  founder: {
    quote: "We built Workchats because our own team was paying for five tools to do what one should.",
    story:
      "Small teams shouldn't need five subscriptions to hold one conversation. So we built one calm place for messages, meetings and files.",
    builtBy: `Workchats is built by Octogle Technologies, with teams in ${site.company.teams}.`,
    link: { label: "About the team", href: site.links.about },
  },

  faq: {
    title: "Questions? We're glad you asked.",
    more: { label: "See all questions", href: site.links.faq },
    contact: "Still have a question? Write to us at",
  },

  finalCta: {
    title: "Your team deserves a simpler way to work together",
    body: `Start free with up to ${quotas.free.members} people, or book a demo and we'll walk you through Workchats with your team in mind.`,
    primary: { label: "Start free", href: site.links.signUp },
    secondary: { label: "Book a demo", href: site.links.bookDemo },
  },

  footer: {
    tagline: "Team messaging, video meetings, file sharing and search in a single app.",
  },
} as const;

export type FeatureTab = (typeof home.features.tabs)[number];
