import { Check } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { CurrencySwitch } from "@/components/ui/CurrencySwitch";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { TextLink } from "@/components/ui/TextLink";
import { home } from "@/content/home";
import {
  defaultBillingPeriod,
  displayCurrencies,
  plans,
  type BillingPeriod,
  type CurrencyCode,
  type Plan,
  type PlanId,
} from "@/content/pricing";
import { cx } from "@/lib/cx";
import { convert, formatDisplayPrice, gbpPrice } from "@/lib/pricing";

/*
 * Pricing as a path rather than four towers: Free and Pro side by side (start here, then grow), Pro marked
 * as the recommended next step by its label, its wider card and its raised surface rather than by colour
 * alone and with no outline frame (the owner's earlier request), and Max and Enterprise together underneath,
 * for larger and regulated organisations. Every price comes from content/pricing.ts, the same source as the
 * structured data.
 *
 * Billing period and currency are native radio buttons; CSS shows the matching price (the billing-* and
 * currency-* variants in globals.css), so both switches work before and without JavaScript. A small inline
 * script remembers the chosen currency for the session (sessionStorage: a preference the visitor set, so no
 * consent is needed) and announces the new prices to screen readers.
 */

/**
 * Shows a price only for its currency, and hides the other four with display: none, so the block is
 * exactly as wide as the figure on screen. The chosen figure rises in on price-in.
 */
const currencyClasses = {
  GBP: "price-in inline currency-usd:hidden currency-eur:hidden currency-aed:hidden currency-rub:hidden",
  USD: "price-in hidden currency-usd:inline",
  EUR: "price-in hidden currency-eur:inline",
  AED: "price-in hidden currency-aed:inline",
  RUB: "price-in hidden currency-rub:inline",
} satisfies Record<CurrencyCode, string>;

const periodClasses = {
  annual: "billing-monthly:hidden",
  monthly: "hidden billing-monthly:inline",
} satisfies Record<BillingPeriod, string>;

const pricingScript = `(function(){var s=document.getElementById("pricing");if(!s)return;var K="workchats-currency",live=document.getElementById("pricing-status");function mirror(c){["currency","cost-currency"].forEach(function(n){var el=document.getElementById(n+"-"+c.toLowerCase());if(el)el.checked=true})}try{var c=sessionStorage.getItem(K);if(c)mirror(c)}catch(e){}document.addEventListener("change",function(e){var t=e.target;if(!t||t.type!=="radio")return;if(t.name==="currency"||t.name==="cost-currency"){try{sessionStorage.setItem(K,t.value)}catch(err){}mirror(t.value)}if(!live)return;var code=(document.querySelector('input[name="currency"]:checked')||{value:"GBP"}).value,monthly=document.getElementById("billing-monthly").checked,parts=[];s.querySelectorAll("[data-plan-price]").forEach(function(p){var a=[].find.call(p.querySelectorAll('[data-currency="'+code+'"]'),function(x){return x.offsetParent!==null});if(a)parts.push(p.getAttribute("data-plan-price")+" "+a.textContent)});live.textContent=parts.join(", ")+" per user a month, billed "+(monthly?"monthly":"annually")+"."})})()`;

function plan(id: PlanId): Plan {
  const found = plans.find((p) => p.id === id);
  if (!found) throw new Error(`Missing plan "${id}" in content/pricing.ts`);
  return found;
}

export function Pricing() {
  const { pricing } = home;
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="pricing py-section">
      <div className="container-page">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-180">
            <h2 id="pricing-title" className="font-display text-title">
              {pricing.title}
            </h2>
            <p className="mt-4 text-lead text-on-night-muted">{pricing.intro}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <fieldset
              aria-label={pricing.periodLegend}
              className="inline-flex self-start rounded-full border border-night-line bg-night p-1"
            >
              <Segment id="billing-annual" value="annual" checked={defaultBillingPeriod === "annual"}>
                {pricing.annual}
                <span className="rounded-full bg-night-overlay px-2 py-0.5 text-nano text-accent-on-night group-has-checked/segment:bg-accent-subtle group-has-checked/segment:text-accent-ink">
                  {pricing.saving}
                </span>
              </Segment>
              <Segment id="billing-monthly" value="monthly" checked={defaultBillingPeriod === "monthly"}>
                {pricing.monthly}
              </Segment>
            </fieldset>
            <CurrencySwitch name="currency" legend={pricing.currencyLegend} />
          </div>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <li className="lg:col-span-5">
            <PlanCard plan={plan("free")} />
          </li>
          <li className="lg:col-span-7">
            <PlanCard plan={plan("pro")} recommended={pricing.recommended} />
          </li>
        </ul>

        <div className="mt-4 rounded-lg border border-night-line p-6 md:p-8">
          <p className="text-small font-semibold text-on-night-muted">{pricing.larger}</p>
          <ul className="mt-6 grid gap-10 md:grid-cols-2 md:gap-8">
            <li>
              <PlanCard plan={plan("max")} quiet />
            </li>
            <li>
              <PlanCard plan={plan("enterprise")} quiet />
            </li>
          </ul>
        </div>

        <TextLink href={pricing.compare.href} className="mt-6">
          {pricing.compare.label}
        </TextLink>
        <p id="pricing-status" aria-live="polite" className="sr-only" suppressHydrationWarning />
        <script dangerouslySetInnerHTML={{ __html: pricingScript }} />
      </div>
    </section>
  );
}

function Segment({
  id,
  value,
  checked,
  children,
}: {
  id: string;
  value: string;
  checked: boolean;
  children: ReactNode;
}) {
  return (
    <label className="group/segment inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-small font-semibold text-on-night-muted transition-colors duration-fast hover:text-on-night has-checked:bg-on-night has-checked:text-night has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent-on-night">
      <input type="radio" name="billing" id={id} value={value} defaultChecked={checked} className="sr-only" />
      {children}
    </label>
  );
}

/**
 * One plan. The Free and Pro cards are panels; Max and Enterprise sit quietly in the shared panel below.
 * Every card has the same rhythm (name, line, price, action, list), so the actions line up.
 */
function PlanCard({
  plan,
  recommended,
  quiet = false,
}: {
  plan: Plan;
  recommended?: string;
  quiet?: boolean;
}) {
  const titleId = `plan-${plan.id}`;
  return (
    <article
      aria-labelledby={titleId}
      className={cx(
        "flex h-full flex-col",
        !quiet && "rounded-lg border border-night-line p-6 md:p-8",
        !quiet && (recommended ? "bg-night-overlay shadow-raised" : "bg-night-raised"),
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h3 id={titleId} className="text-heading">
          {plan.name}
        </h3>
        {recommended ? (
          <p className="rounded-full bg-accent px-3 py-0.5 text-micro font-semibold text-on-accent">
            {recommended}
          </p>
        ) : null}
      </div>
      <p className="mt-1 text-small text-on-night-muted">{plan.summary}</p>
      <PlanPrice plan={plan} />
      <LiquidButton
        href={plan.cta.href}
        tone={plan.cta.variant === "primary" ? "primary" : "glass"}
        data-cta={`pricing-${plan.id}`}
        className="mt-6 w-full sm:w-auto sm:self-start"
      >
        {plan.cta.label}
      </LiquidButton>
      <p className="mt-6 text-small font-semibold text-on-night">{plan.includesPrevious ?? "Included"}</p>
      <ul className={cx("mt-3 grid gap-x-8 gap-y-2.5", recommended && "sm:grid-cols-2")}>
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-small text-on-night-muted">
            <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent-on-night" />
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
        <p className="font-display text-title">Custom</p>
        <p className="text-micro text-on-night-subtle">Priced for your organisation</p>
      </div>
    );
  }

  const amounts = (period: BillingPeriod) => {
    const gbp = gbpPrice(plan, period);
    if (gbp === null) throw new Error(`Plan "${plan.id}" has no ${period} price in content/pricing.ts`);
    return displayCurrencies.map((currency) => (
      <span
        key={currency.code}
        data-amount=""
        data-currency={currency.code}
        className={currencyClasses[currency.code]}
      >
        {formatDisplayPrice(convert(gbp, currency.code), currency.code)}
      </span>
    ));
  };

  if (plan.price.kind === "free") {
    return (
      <div className="mt-6" data-plan-price={plan.name}>
        <p className="font-display text-title tabular-nums">{amounts("annual")}</p>
        <p className="text-micro text-on-night-subtle">For as long as you like</p>
      </div>
    );
  }

  // Price on its own line and the unit underneath, so every card has the same rhythm and the buttons
  // line up whichever currency is shown.
  return (
    <div className="mt-6" data-plan-price={plan.name}>
      <p className="font-display text-title tabular-nums">
        <span className={periodClasses.annual}>{amounts("annual")}</span>
        <span className={periodClasses.monthly}>{amounts("monthly")}</span>
      </p>
      <p className="text-micro text-on-night-subtle">
        Per user a month, <span className={periodClasses.annual}>billed annually</span>
        <span className={periodClasses.monthly}>billed monthly</span>
      </p>
    </div>
  );
}
