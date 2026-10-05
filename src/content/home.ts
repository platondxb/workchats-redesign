import { formatDisplayPrice, gbpPrice, lowestPaidPrice, maxAnnualSaving } from "@/lib/pricing";
import { plans, quotas } from "./pricing";
import { calendarIntegrations, customers, hostingRegions, site } from "./site";

/**
 * Home page copy. Facts come from workchats.com (the home page, /features/*, /faq, /about, /download,
 * /terms-conditions, /privacy-policy and the five-tools cost breakdown on the blog) and from the site
 * owner's answers of 3 October 2026. The structure and the reasons behind it are in
 * docs/redesign/strategy.md. UK English, sentence case.
 */

function requireAmount(amount: number | null | undefined, what: string): number {
  if (amount === null || amount === undefined) throw new Error(`Missing ${what} in content/pricing.ts`);
  return amount;
}

const proPlan = plans.find((plan) => plan.id === "pro");
const maxPlan = plans.find((plan) => plan.id === "max");
const proAnnual = requireAmount(proPlan ? gbpPrice(proPlan, "annual") : null, "the Pro annual price");
const proMonthly = requireAmount(proPlan ? gbpPrice(proPlan, "monthly") : null, "the Pro monthly price");
const maxAnnual = requireAmount(maxPlan ? gbpPrice(maxPlan, "annual") : null, "the Max annual price");
const fromPrice = formatDisplayPrice(
  requireAmount(lowestPaidPrice(plans, "annual")?.amount, "a paid price"),
  "GBP",
);
const gbp = (amount: number) => formatDisplayPrice(amount, "GBP");
const freeMembers = quotas.free.members;

/** Small counts read better as words in a sentence ("five tools", not "5 tools"). */
const numberWords = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
function inWords(count: number): string {
  return numberWords[count] ?? String(count);
}
const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "the UK, the EU or the UAE", from the hosting regions. */
const regionList = (() => {
  const names = hostingRegions.map((region) => `the ${region.short}`);
  return `${names.slice(0, -1).join(", ")} or ${names.at(-1) ?? ""}`;
})();

/**
 * The cost case: what a typical team pays, per person a month at list prices billed annually, for the
 * tools Workchats replaces. The figures are the owner's, from the cost breakdown on the blog; the live
 * /pricing page states its competitor prices were "verified May 2026" and converted to GBP at prevailing
 * exchange rates. The owner approved this comparison, with the apps unnamed, on 3 October 2026 and
 * confirmed that Workchats replaces the screen-recording tool. On 5 October 2026 the owner asked for the
 * real apps to be named and lifted the anonymity rule (brief §3.2) for the whole page, so each row now
 * names the app and the plan its price is for.
 *
 * Because the apps are named, anyone can check the prices: each comment below gives the plan, the figure,
 * where it comes from and when it was checked, and the figures must stay true to the vendors' own list prices.
 *
 * Spot check from this repository on 3 October 2026, from an EU network (so not GBP list prices): Google
 * Workspace Business Standard showed €13.60 per user a month, Loom Business $18 a month on monthly
 * billing. Re-check the GBP list prices before launch and update `pricesChecked`.
 */
const stack = [
  // Slack Pro, billed annually: £7.25 per user a month. Cost breakdown; /faq "around £7.25". Checked May 2026.
  { id: "chat", name: "Slack Pro", price: 7.25, replaced: true },
  // Zoom Workplace Pro, billed annually: £11.99 per user a month. Cost breakdown; /faq. Checked May 2026.
  { id: "meetings", name: "Zoom Workplace Pro", price: 11.99, replaced: true },
  // Loom Business: £10 per user a month. Cost breakdown. Checked May 2026.
  { id: "recording", name: "Loom Business", price: 10, replaced: true },
  // WhatsApp: free. The personal messenger a team falls back to, which Workchats replaces at no saving.
  { id: "messenger", name: "WhatsApp", price: 0, replaced: true },
  // Google Workspace Business Standard, billed annually: £12 per user a month. Cost breakdown. Kept: email,
  // calendar and documents are not a chat problem. Checked May 2026.
  { id: "suite", name: "Google Workspace Business Standard", price: 12, replaced: false },
] as const;

const pricesChecked = "May 2026";
const seats = 50;
const kept = stack.filter((item) => !item.replaced);
const keptPerUser = kept.reduce((sum, item) => sum + item.price, 0);
const yearly = (perUserMonthly: number) => Math.round(perUserMonthly * seats * 12);
const stackYear = stack.reduce((sum, item) => sum + yearly(item.price), 0);
const consolidatedYear = yearly(proAnnual) + kept.reduce((sum, item) => sum + yearly(item.price), 0);
/** Per person a month, so the calculator can scale every figure with the team size. */
const stackPerUser = Math.round(stack.reduce((sum, item) => sum + item.price, 0) * 100) / 100;
const savingAt50 = stackYear - consolidatedYear;
const replacedCount = stack.filter((item) => item.replaced).length;

/** The sixth person: what a team that grows past the Free plan pays on Pro. */
const sixthPersonTeam = freeMembers + 1;
const sixPeopleMonthly = sixthPersonTeam * proAnnual;

export const home = {
  meta: {
    title: "Workchats: team chat, video calls and files in one app",
    description: `Team chat, video calls and file search in one app. Free for up to ${freeMembers} people. Pro from ${fromPrice} per user a month, billed annually.`,
  },

  og: {
    alt: `Workchats: team chat, calls and files in one app. Free for up to ${freeMembers} people, Pro from ${fromPrice} per user a month.`,
    subline: `Free for up to ${freeMembers} people. Pro from ${fromPrice} per user a month.`,
  },

  hero: {
    /** Two lines, set in two tones: what it is, then what trying it costs. */
    title: ["Team chat, calls and files.", `Free for up to ${freeMembers} people.`] as const,
    lead: "Workchats replaces the separate chat, meeting and recording tools your team pays for. End-to-end encrypted on every plan.",
    primary: { label: "Start free", href: site.links.signUp },
    download: { href: "#download" },
    caption: `No credit card needed, no time limit. Pro is ${fromPrice} a person a month when you grow.`,
    /**
     * The devices are one picture to assistive technology: this says what they show, in the order they
     * show it. The views are the real app's layout (the owner's screenshots, 5 October 2026) with a
     * fictional team.
     */
    productLabel:
      "Workchats on a laptop and a phone, showing in turn: a team chat with a voice message, a shared file and a meeting about to start; the team's contacts; a week of meetings with a daily stand-up; a recorded video call with a shared checklist; and a task board.",
    /**
     * The tour on the devices: the app's five parts, in the order of its own sidebar, each shown on both
     * screens in turn (components/product/HeroDevices.tsx, lib/tour.ts).
     */
    tour: {
      stops: ["chats", "contacts", "schedule", "calls", "tasks"],
      pause: "Pause the product tour",
      play: "Play the product tour",
    },
  },

  customers,

  /**
   * Where data lives, on a globe the visitor can turn. The intro carries the reliability and security
   * facts as well, so the business case (cost and encryption in the hero, residency and the SLA here)
   * lands inside the first two screens on a desktop.
   */
  regions: {
    title: `Hosted in ${regionList}`,
    intro:
      "Choose where your workspace lives. Its data stays inside that region, end-to-end encrypted, with a 99.9% uptime SLA on Pro and above.",
    legend: "Show a region on the globe",
    compliance: "GDPR compliant, with audit logs and data export on Pro and above.",
    walkthrough: { label: "Book a security walkthrough", href: site.links.bookDemo },
    globeLabel: `A globe showing the three regions Workchats is hosted in, ${hostingRegions
      .map((region) => region.name)
      .join(", ")
      .replace(/, (?=[^,]*$)/, " and ")}, linked by arcs.`,
    dragHint: "Drag to turn the globe",
  },

  freePlan: {
    title: "Five people, free, for as long as you like",
    intro: `The Free plan has no trial period and no end date. This is what a team of ${freeMembers} gets.`,
    includes: [
      "Channels, DMs and group chats",
      "1:1 voice and video calls with screen sharing",
      "Calls with no time limit",
      `${quotas.free.storagePerUserGb} GB of storage per person`,
      "End-to-end encryption",
      "Message history that is never archived after 90 days",
      "Email and calendar integrations",
      "Apps for the web, desktop and mobile",
    ],
    sixth: {
      title: "Invite to Northgate Studio",
      note: "Adding a sixth person moves the team to Pro.",
      price: `${sixthPersonTeam} people on Pro: ${gbp(sixPeopleMonthly)} a month, billed annually.`,
      carryOver: "Everything you have carries over.",
      action: "Upgrade and invite",
    },
    primary: { label: "Start free", href: site.links.signUp },
    compare: { label: "Compare plans", href: "#pricing" },
  },

  day: {
    title: "One working day at Northgate Studio",
    intro: "Five details that make Workchats quieter than the tools it replaces.",
    moments: [
      {
        id: "offline",
        time: "08:47",
        title: "Works offline",
        body: "Daniel writes from a site with no signal. The message waits, then sends when he is back online.",
      },
      {
        id: "hours",
        time: "09:00",
        title: "Working hours",
        body: "Tom's day starts at 09:00, and his profile says so. Nobody has to guess whether he's around.",
      },
      {
        id: "call",
        time: "09:41",
        title: "Calls start in the chat",
        body: "Priya starts a call from the #spring-launch thread. No link to paste and no time limit.",
      },
      {
        id: "summary",
        time: "10:32",
        title: "Recordings with summaries",
        body: "The recording lands in the channel with an AI summary of the decisions and action items.",
      },
      {
        id: "connect",
        time: "14:10",
        title: "Connection requests",
        body: "Someone outside the team asks to connect before they can message Sofia. No cold outreach.",
      },
    ],
  },

  download: {
    title: "On every device your team already uses",
    intro: "Your workspace follows you from the browser to the desktop to your phone.",
    thisDevice: "This device",
    calendars: `Syncs with ${calendarIntegrations.slice(0, -1).join(", ")} and ${calendarIntegrations.at(-1) ?? ""}.`,
  },

  cost: {
    quote: "We built Workchats because our own team was paying for five tools to do what one should.",
    title: `A typical team pays for ${inWords(stack.length)} tools. Workchats replaces ${inWords(replacedCount)}.`,
    stackLabel: "What each person costs a month, at list prices",
    stack: stack.map((item) => ({
      id: item.id,
      name: item.name,
      price: gbp(item.price),
      kept: !item.replaced,
    })),
    keptNote: "You keep this one",
    calculator: {
      label: "Team size",
      unit: "people",
      seats,
      min: 10,
      max: 200,
      step: 10,
      currencyLegend: "Show the totals in",
      /** Totals are whole pounds; the section shows them in the visitor's chosen currency. */
      stack: {
        label: `${capitalise(inWords(stack.length))} separate tools`,
        perUser: stackPerUser,
        totalGbp: stackYear,
      },
      workchats: {
        /** Pro covers up to 50 people; larger teams need Max. */
        proLimit: quotas.pro.members,
        pro: { label: "Workchats Pro + your office suite", perUser: proAnnual + keptPerUser },
        max: { label: "Workchats Max + your office suite", perUser: maxAnnual + keptPerUser },
        totalGbp: consolidatedYear,
      },
      saving: { label: "You save", totalGbp: savingAt50 },
      perYear: "a year",
      note: `List prices per person, billed annually, before VAT, checked ${pricesChecked}. Above ${quotas.pro.members} people the sum uses Workchats Max. Totals in other currencies are approximate.`,
    },
    compare: { label: "Compare plans", href: "#pricing" },
    source: { label: "Read the full cost breakdown", href: site.links.costBreakdown },
  },

  pricing: {
    title: "Start free. Move to Pro when you grow.",
    intro: "Billed in pounds sterling. Prices in other currencies are approximate.",
    periodLegend: "Billing period",
    annual: "Annually",
    monthly: "Monthly",
    saving: `Save up to ${maxAnnualSaving(plans)}%`,
    currencyLegend: "Show prices in",
    recommended: `Recommended once you pass ${freeMembers} people`,
    larger: "For larger teams and regulated organisations",
    compare: { label: "Compare every plan in detail", href: site.links.pricing },
  },

  faq: {
    title: "Questions teams ask before they switch",
    more: { label: "See all questions", href: site.links.faq },
    contact: "Still have a question? Write to us at",
  },

  finalCta: {
    title: "Start with five people and grow from there",
    body: `Free for up to ${freeMembers}, with no time limit. For a bigger rollout, book a demo and we'll walk your team through it.`,
    primary: { label: "Start free", href: site.links.signUp },
    secondary: { label: "Book a demo", href: site.links.bookDemo },
  },

  founder: {
    teams: `Workchats has teams in ${site.company.teams}.`,
  },

  footer: {
    tagline: "Team chat, video calls, files and search in one app.",
  },

  /** Facts the FAQ and the pricing copy quote, computed here so they can't drift from pricing.ts. */
  facts: {
    proAnnual: gbp(proAnnual),
    proMonthly: gbp(proMonthly),
    proMembers: quotas.pro.members,
  },
} as const;
