import {
  conversionStep,
  displayCurrencies,
  type BillingPeriod,
  type CurrencyCode,
  type Plan,
} from "@/content/pricing";

/** GBP price per user per month for a plan, or null when the plan has no list price (Enterprise). */
export function gbpPrice(plan: Plan, period: BillingPeriod): number | null {
  switch (plan.price.kind) {
    case "free":
      return 0;
    case "custom":
      return null;
    case "perUser":
      return plan.price.gbp[period];
  }
}

/** Converts a GBP price for display, with the current site's rate and rounding to the nearest half. */
export function convert(gbp: number, currency: CurrencyCode): number {
  const entry = displayCurrencies.find((c) => c.code === currency);
  if (!entry) throw new Error(`Unknown currency ${currency}`);
  if (currency === "GBP" || gbp === 0) return gbp;
  return Math.round((gbp * entry.rate) / conversionStep) * conversionStep;
}

/** "£3", "$6.50", "Dh 14", "₽315": symbol first, decimals only when needed, as on the current site. */
export function formatDisplayPrice(amount: number, currency: CurrencyCode): string {
  const entry = displayCurrencies.find((c) => c.code === currency);
  if (!entry) throw new Error(`Unknown currency ${currency}`);
  if (!Number.isFinite(amount) || amount < 0) throw new RangeError(`Invalid price: ${amount}`);
  const number = Number.isInteger(amount)
    ? amount.toLocaleString("en-GB")
    : amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${entry.symbol}${number}`;
}

/** Whole-percent saving from paying annually. Rounded down, so the page never overstates it. */
export function annualSaving(plan: Plan): number | null {
  const monthly = gbpPrice(plan, "monthly");
  const annual = gbpPrice(plan, "annual");
  if (monthly === null || annual === null || monthly === 0) return null;
  return Math.floor(((monthly - annual) / monthly) * 100);
}

/** The largest annual saving across plans, for the "save up to" label. */
export function maxAnnualSaving(plans: readonly Plan[]): number {
  return plans.reduce((max, plan) => Math.max(max, annualSaving(plan) ?? 0), 0);
}

/** The cheapest paid per-user price, e.g. "Pro from £3". */
export function lowestPaidPrice(
  plans: readonly Plan[],
  period: BillingPeriod,
): { plan: Plan; amount: number } | null {
  let best: { plan: Plan; amount: number } | null = null;
  for (const plan of plans) {
    if (plan.price.kind !== "perUser") continue;
    const amount = gbpPrice(plan, period);
    if (amount !== null && (best === null || amount < best.amount)) best = { plan, amount };
  }
  return best;
}
