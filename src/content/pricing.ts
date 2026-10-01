import { site } from "./site";

/**
 * Prices and plans: the single source for the pricing cards, the comparison, the meta description and
 * the structured data. Sources: /pricing, /faq and Terms §4 on workchats.com.
 *
 * Billing is in GBP ("Prices are in British pounds", FAQ). Other currencies are shown for guidance with
 * the current site's exchange rates and rounding, and are labelled as approximate.
 */

export type CurrencyCode = "GBP" | "USD" | "EUR" | "AED" | "RUB";
export type BillingPeriod = "annual" | "monthly";
export type PlanId = "free" | "pro" | "max" | "enterprise";

export const billingCurrency: CurrencyCode = "GBP";

/** Display currencies, with the rates and symbols the current site uses (data-rate-*, data-symbol-*). */
export const displayCurrencies: readonly {
  code: CurrencyCode;
  symbol: string;
  rate: number;
  label: string;
}[] = [
  { code: "GBP", symbol: "£", rate: 1, label: "Pound sterling" },
  { code: "USD", symbol: "$", rate: 1.27, label: "US dollar" },
  { code: "EUR", symbol: "€", rate: 1.17, label: "Euro" },
  { code: "AED", symbol: "Dh ", rate: 4.66, label: "UAE dirham" },
  { code: "RUB", symbol: "₽", rate: 105, label: "Russian rouble" },
];

/** Converted prices are rounded to the nearest half unit, as on the current site (data-rounding="0.5"). */
export const conversionStep = 0.5;

/** Price per user per month in GBP. */
export interface PerUserPrice {
  monthly: number;
  annual: number;
}

export type PlanPrice = { kind: "free" } | { kind: "perUser"; gbp: PerUserPrice } | { kind: "custom" };

export interface PlanCta {
  label: string;
  href: string;
  variant: "primary" | "secondary";
}

export interface Plan {
  id: PlanId;
  name: string;
  summary: string;
  price: PlanPrice;
  /** Shown above the list for paid plans, e.g. "Everything in Free, plus". */
  includesPrevious?: string;
  features: readonly string[];
  cta: PlanCta;
}

export const defaultBillingPeriod: BillingPeriod = "annual";

/** Plan limits as numbers, so copy elsewhere on the page quotes the same values. */
export const quotas = {
  free: { members: 5, storagePerUserGb: 5 },
  pro: { members: 50, groupCallPeople: 25, storagePerUserGb: 20, guests: 5 },
  max: { groupCallPeople: 50, storagePerUserGb: 50, guests: 25 },
} as const;

export const plans: readonly Plan[] = [
  {
    id: "free",
    name: "Free",
    summary: "For small teams getting started with Workchats.",
    price: { kind: "free" },
    features: [
      `Up to ${quotas.free.members} team members`,
      "1 workspace",
      "1:1 voice and video calls with screen sharing",
      "Channels, DMs and group chats",
      `${quotas.free.storagePerUserGb} GB storage per user`,
      "Basic integrations (email, calendar)",
    ],
    cta: { label: "Start free", href: site.links.signUp, variant: "primary" },
  },
  {
    id: "pro",
    name: "Pro",
    summary: "For growing teams who need more space and control.",
    price: { kind: "perUser", gbp: { monthly: 4, annual: 3 } },
    includesPrevious: "Everything in Free, plus",
    features: [
      `Up to ${quotas.pro.members} team members`,
      "Unlimited workspaces",
      `Group video calls for up to ${quotas.pro.groupCallPeople}`,
      `${quotas.pro.storagePerUserGb} GB storage per user`,
      "SSO, admin controls and audit logs",
      `${quotas.pro.guests} guest users and all integrations`,
      "99.9% uptime SLA",
    ],
    cta: { label: "Start with Pro", href: `${site.links.signUp}?plan=pro`, variant: "secondary" },
  },
  {
    id: "max",
    name: "Max",
    summary: "For larger teams with advanced security needs.",
    price: { kind: "perUser", gbp: { monthly: 7, annual: 5 } },
    includesPrevious: "Everything in Pro, plus",
    features: [
      "Unlimited team members",
      `Group video calls for up to ${quotas.max.groupCallPeople}`,
      `${quotas.max.storagePerUserGb} GB storage per user`,
      "Advanced security (DLP, eDiscovery)",
      `${quotas.max.guests} guest users and API access`,
      "Dedicated account manager",
      "Custom SLA",
    ],
    cta: { label: "Start with Max", href: `${site.links.signUp}?plan=max`, variant: "secondary" },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    summary: "For large or regulated organisations.",
    price: { kind: "custom" },
    includesPrevious: "Everything in Max, plus",
    features: [
      "SAML and SCIM provisioning",
      "On-premise or private cloud",
      "Unlimited storage and guest users",
      "Custom SLA and contracts",
      "Dedicated success manager",
    ],
    cta: { label: "Contact sales", href: site.links.contact, variant: "secondary" },
  },
];
