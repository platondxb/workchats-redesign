import type { ReactNode } from "react";
import { SiteLink } from "@/components/ui/SiteLink";
import { TextLink } from "@/components/ui/TextLink";
import { buttonClasses } from "@/components/ui/button-classes";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { home } from "@/content/home";
import {
  billingCurrency,
  defaultBillingPeriod,
  displayCurrencies,
  plans,
  type BillingPeriod,
  type CurrencyCode,
  type Plan,
} from "@/content/pricing";
import { convert, formatDisplayPrice, gbpPrice } from "@/lib/pricing";
import { cx } from "@/lib/cx";

/*
 * Four tiers, each with the action that fits it. Every price comes from content/pricing.ts, the same
 * source as the structured data. Billing period and currency are native radio buttons; CSS shows the
 * matching price (the billing-* and currency-* variants in globals.css), so both switches work before
 * and without JavaScript. A small inline script only remembers the chosen currency for the session
 * (sessionStorage: a preference the visitor set, so no consent is needed) and announces the new prices
 * to screen readers.
 */

/** Shows a price only for its currency. The pound is the default, so it hides when another is chosen. */
const currencyClasses = {
  GBP: "inline currency-usd:hidden currency-eur:hidden currency-aed:hidden currency-rub:hidden",
  USD: "hidden currency-usd:inline",
  EUR: "hidden currency-eur:inline",
  AED: "hidden currency-aed:inline",
  RUB: "hidden currency-rub:inline",
} satisfies Record<CurrencyCode, string>;

const periodClasses = {
  annual: "billing-monthly:hidden",
  monthly: "hidden billing-monthly:inline",
} satisfies Record<BillingPeriod, string>;

const pricingScript = `(function(){var s=document.getElementById("pricing");if(!s)return;var k="workchats-currency";try{var c=sessionStorage.getItem(k),r=c&&document.getElementById("currency-"+c.toLowerCase());if(r)r.checked=true}catch(e){}var live=document.getElementById("pricing-status");s.addEventListener("change",function(e){var t=e.target;if(!t||t.type!=="radio")return;if(t.name==="currency"){try{sessionStorage.setItem(k,t.value)}catch(e){}}if(!live)return;var parts=[];s.querySelectorAll("[data-plan-price]").forEach(function(p){var a=[].find.call(p.querySelectorAll("[data-amount]"),function(x){return x.offsetParent!==null});if(a)parts.push(p.getAttribute("data-plan-price")+" "+a.textContent)});var monthly=document.getElementById("billing-monthly").checked;live.textContent=parts.join(", ")+" per user a month, billed "+(monthly?"monthly":"annually")+"."})})()`;

export function Pricing() {
  const { pricing } = home;
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="pricing py-section">
      <div className="container-page">
        <SectionHeader id="pricing-title" title={pricing.title} intro={pricing.intro} />

        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <fieldset className="inline-flex self-start rounded-full border border-line bg-surface p-1 shadow-raised">
            <legend className="sr-only">{pricing.periodLegend}</legend>
            <Segment
              name="billing"
              id="billing-annual"
              value="annual"
              checked={defaultBillingPeriod === "annual"}
            >
              {pricing.annual}
              <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-nano text-accent-ink">
                {pricing.saving}
              </span>
            </Segment>
            <Segment
              name="billing"
              id="billing-monthly"
              value="monthly"
              checked={defaultBillingPeriod === "monthly"}
            >
              {pricing.monthly}
            </Segment>
          </fieldset>

          <fieldset className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <legend className="float-left mr-1 text-small font-semibold text-ink-muted">
              {pricing.currencyLegend}
            </legend>
            <span className="inline-flex flex-wrap rounded-full border border-line bg-surface p-1">
              {displayCurrencies.map((currency) => (
                <Segment
                  key={currency.code}
                  name="currency"
                  id={`currency-${currency.code.toLowerCase()}`}
                  value={currency.code}
                  checked={currency.code === billingCurrency}
                  compact
                  accessibleName={`${currency.label} (${currency.code})`}
                >
                  {currency.code}
                </Segment>
              ))}
            </span>
          </fieldset>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <li key={plan.id}>
              <PlanCard plan={plan} />
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-small text-ink-subtle">{pricing.currencyNote}</p>
          <TextLink href={pricing.compare.href}>{pricing.compare.label}</TextLink>
        </div>
        <p id="pricing-status" aria-live="polite" className="sr-only" suppressHydrationWarning />
        <script dangerouslySetInnerHTML={{ __html: pricingScript }} />
      </div>
    </section>
  );
}

function Segment({
  name,
  id,
  value,
  checked,
  compact = false,
  accessibleName,
  children,
}: {
  name: string;
  id: string;
  value: string;
  checked: boolean;
  compact?: boolean;
  /** A fuller accessible name, e.g. "US dollar (USD)", which contains the visible label. */
  accessibleName?: string;
  children: ReactNode;
}) {
  return (
    <label
      className={cx(
        "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full font-semibold text-ink-muted transition-colors hover:text-ink has-checked:bg-ink has-checked:text-on-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent",
        compact ? "min-w-11 justify-center px-3 text-micro" : "px-4 text-small",
      )}
    >
      <input
        type="radio"
        name={name}
        id={id}
        value={value}
        defaultChecked={checked}
        aria-label={accessibleName}
        className="sr-only"
      />
      {children}
    </label>
  );
}

/** Every plan gets the same card: no outlines or "featured" frames; the actions carry the hierarchy. */
function PlanCard({ plan }: { plan: Plan }) {
  const titleId = `plan-${plan.id}`;
  return (
    <article
      aria-labelledby={titleId}
      className="flex h-full flex-col rounded-lg border border-line bg-surface p-6"
    >
      <h3 id={titleId} className="text-heading text-ink">
        {plan.name}
      </h3>
      <p className="mt-1 text-small text-ink-muted md:min-h-12">{plan.summary}</p>
      <PlanPrice plan={plan} />
      <SiteLink href={plan.cta.href} className={buttonClasses(plan.cta.variant, "md", "mt-6 w-full")}>
        {plan.cta.label}
      </SiteLink>
      <p className="mt-6 text-small font-semibold text-ink">{plan.includesPrevious ?? "Included"}</p>
      <ul className="mt-3 space-y-2.5">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex gap-2.5 text-small text-ink before:mt-1.5 before:h-2.5 before:w-1.5 before:shrink-0 before:rotate-45 before:border-r-2 before:border-b-2 before:border-accent"
          >
            {feature}
          </li>
        ))}
      </ul>
    </article>
  );
}

function PlanPrice({ plan }: { plan: Plan }) {
  if (plan.price.kind === "custom") {
    return (
      <div className="mt-6">
        <p className="font-display text-title text-ink">Custom</p>
        <p className="text-micro text-ink-subtle">Priced for your organisation</p>
      </div>
    );
  }

  const amounts = (period: BillingPeriod) => {
    const gbp = gbpPrice(plan, period);
    if (gbp === null) throw new Error(`Plan "${plan.id}" has no ${period} price in content/pricing.ts`);
    return displayCurrencies.map((currency) => (
      <span key={currency.code} data-amount="" className={currencyClasses[currency.code]}>
        {formatDisplayPrice(convert(gbp, currency.code), currency.code)}
      </span>
    ));
  };

  if (plan.price.kind === "free") {
    return (
      <div className="mt-6" data-plan-price={plan.name}>
        <p className="font-display text-title text-ink tabular-nums">{amounts("annual")}</p>
        <p className="text-micro text-ink-subtle">No time limit, no credit card</p>
      </div>
    );
  }

  // Price on its own line and the unit underneath, so every card has the same rhythm and the buttons
  // line up whichever currency is shown.
  return (
    <div className="mt-6" data-plan-price={plan.name}>
      <p className="font-display text-title text-ink tabular-nums">
        <span className={periodClasses.annual}>{amounts("annual")}</span>
        <span className={periodClasses.monthly}>{amounts("monthly")}</span>
      </p>
      <p className="text-micro text-ink-subtle">
        Per user a month, <span className={periodClasses.annual}>billed annually</span>
        <span className={periodClasses.monthly}>billed monthly</span>
      </p>
    </div>
  );
}
