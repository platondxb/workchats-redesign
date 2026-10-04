import { CurrencySwitch } from "@/components/ui/CurrencySwitch";
import { TextLink } from "@/components/ui/TextLink";
import { home } from "@/content/home";
import { displayCurrencies, type CurrencyCode } from "@/content/pricing";
import { site } from "@/content/site";
import { cx } from "@/lib/cx";
import { convertTotal, formatDisplayPrice } from "@/lib/pricing";

/*
 * The cost case, anonymised: the tools a typical team pays for, by category, at list prices, and a
 * calculator for their own team size and currency. Server-rendered for 50 people (the cost breakdown's
 * example) in every currency, so it reads completely without JavaScript; a small inline script reveals
 * the slider, recalculates, and keeps the currency in step with the pricing section. Above 50 people Pro
 * no longer fits, so the sum switches to Max. Every figure comes from content/home.ts and pricing.ts; the
 * products behind each category are named only in the source comments there. The three totals are marked
 * data-roll: when one changes, with the currency or the team size, its digits roll (lib/price-roll.ts).
 */

/**
 * Shows a total only for its currency. Display: none for the other four keeps the line exactly as wide as
 * the figure on screen, so the "a year" that follows it stays next to it; the chosen one rises in.
 */
const currencyClasses = {
  GBP: "price-in inline cost-currency-usd:hidden cost-currency-eur:hidden cost-currency-aed:hidden cost-currency-rub:hidden",
  USD: "price-in hidden cost-currency-usd:inline",
  EUR: "price-in hidden cost-currency-eur:inline",
  AED: "price-in hidden cost-currency-aed:inline",
  RUB: "price-in hidden cost-currency-rub:inline",
} satisfies Record<CurrencyCode, string>;

/** One figure in every display currency. The chosen one is shown by CSS; the script rewrites them all. */
function Amounts({ gbp }: { gbp: number }) {
  return displayCurrencies.map((currency) => (
    <span key={currency.code} data-currency={currency.code} className={currencyClasses[currency.code]}>
      {formatDisplayPrice(convertTotal(gbp, currency.code), currency.code)}
    </span>
  ));
}

/** The rates the inline script needs, so a recalculation matches this server-rendered markup exactly. */
const rates = JSON.stringify(
  Object.fromEntries(displayCurrencies.map((c) => [c.code, { symbol: c.symbol, rate: c.rate }])),
);

const calculatorScript = `(function(){var r=document.getElementById("team-size");if(!r)return;var d=r.dataset,five=+d.stack,pro=+d.pro,max=+d.max,limit=+d.limit,rates=JSON.parse(d.rates),K="workchats-currency",g=function(i){return document.getElementById(i)},out=g("team-size-value"),stackEl=g("cost-stack"),workEl=g("cost-workchats"),label=g("cost-workchats-label"),bar=g("cost-workchats-bar"),savingEl=g("cost-saving"),live=g("cost-status"),t;function active(){var el=document.querySelector('input[name="cost-currency"]:checked');return el?el.value:"GBP"}function money(n,code){var c=rates[code||active()],v=Math.round(n*c.rate);return c.symbol+v.toLocaleString("en-GB")}function setAmount(host,n){if(!host)return;var spans=host.querySelectorAll("[data-currency]");for(var i=0;i<spans.length;i++){spans[i].textContent=money(n,spans[i].getAttribute("data-currency"))}}function mirror(code){["currency","cost-currency"].forEach(function(n){var el=g(n+"-"+code.toLowerCase());if(el)el.checked=true})}function fill(){r.style.setProperty("--fill",(r.value-r.min)/(r.max-r.min)*100+"%")}function update(){fill();var n=+r.value,small=n<=limit,per=small?pro:max,f=n*12*five,w=n*12*per;out.textContent=n+" people";r.setAttribute("aria-valuetext",n+" people");setAmount(stackEl,f);setAmount(workEl,w);setAmount(savingEl,f-w);label.textContent=small?d.proLabel:d.maxLabel;bar.setAttribute("width",String(Math.round(per/five*1000)/10));clearTimeout(t);t=setTimeout(function(){live.textContent=n+" people: "+money(f)+" a year for the separate tools, "+money(w)+" with "+label.textContent+". You save "+money(f-w)+" a year."},600)}try{var stored=sessionStorage.getItem(K);if(stored)mirror(stored)}catch(e){}document.addEventListener("change",function(e){var t=e.target;if(!t||t.type!=="radio"||(t.name!=="currency"&&t.name!=="cost-currency"))return;try{sessionStorage.setItem(K,t.value)}catch(err){}mirror(t.value)});fill();r.hidden=false;r.addEventListener("input",update)})()`;

export function Cost() {
  const { cost } = home;
  const { calculator } = cost;
  const { stack, workchats, saving } = calculator;
  return (
    <section id="cost" aria-labelledby="cost-title" className="cost py-section">
      <div className="container-page">
        <h2 id="cost-title" className="max-w-200 font-display text-title">
          {cost.title}
        </h2>
      </div>
      <div className="container-page mt-10 grid-page items-start gap-y-12 md:mt-14">
        <div className="col-span-4 md:col-span-8 lg:col-span-5">
          <p className="text-small font-semibold text-on-night-muted">{cost.stackLabel}</p>
          <ul className="mt-3 border-t border-night-line">
            {cost.stack.map((item) => (
              <li
                key={item.id}
                className={cx(
                  "flex items-baseline justify-between gap-4 border-b border-night-line py-3 text-small",
                  item.kept ? "text-on-night-subtle" : "text-on-night",
                )}
              >
                <span>
                  {item.category}
                  {item.kept ? <span className="block text-micro">{cost.keptNote}</span> : null}
                </span>
                <span className="shrink-0 tabular-nums">{item.price}</span>
              </li>
            ))}
          </ul>
          <TextLink href={cost.source.href} className="mt-4">
            {cost.source.label}
          </TextLink>
          <figure className="mt-12 border-l-2 border-accent-on-night pl-6">
            <blockquote className="font-display text-heading text-on-night">
              <p>“{cost.quote}”</p>
            </blockquote>
            <figcaption className="mt-3 text-small text-on-night-muted">
              {site.founder.name}, {site.founder.role.toLowerCase()}. {home.founder.teams}
            </figcaption>
          </figure>
        </div>

        <div className="col-span-4 rounded-lg border border-night-line bg-night-raised p-6 md:col-span-8 md:p-8 lg:col-span-6 lg:col-start-7 lg:p-10">
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="team-size"
              className="inline-flex min-h-11 items-center text-small font-semibold text-on-night-muted"
            >
              {calculator.label}
            </label>
            <output
              id="team-size-value"
              htmlFor="team-size"
              className="font-display text-heading tabular-nums"
              suppressHydrationWarning
            >
              {calculator.seats} {calculator.unit}
            </output>
          </div>
          <input
            id="team-size"
            type="range"
            min={calculator.min}
            max={calculator.max}
            step={calculator.step}
            defaultValue={calculator.seats}
            aria-valuetext={`${calculator.seats} ${calculator.unit}`}
            data-stack={stack.perUser}
            data-pro={workchats.pro.perUser}
            data-max={workchats.max.perUser}
            data-limit={workchats.proLimit}
            data-pro-label={workchats.pro.label}
            data-max-label={workchats.max.label}
            data-rates={rates}
            hidden
            suppressHydrationWarning
            className="range mt-3 h-11 w-full cursor-pointer"
          />

          <CurrencySwitch name="cost-currency" legend={calculator.currencyLegend} className="mt-6" />

          <div className="mt-6 grid gap-6">
            <CostRow id="cost-stack" label={stack.label} amountGbp={stack.totalGbp} share={1} />
            <CostRow
              id="cost-workchats"
              label={workchats.pro.label}
              amountGbp={workchats.totalGbp}
              share={workchats.pro.perUser / stack.perUser}
              highlight
            />
          </div>

          <div className="mt-8 flex flex-col gap-5 border-t border-night-line pt-6 sm:flex-row sm:items-end sm:justify-between">
            <p>
              <span className="block text-small font-semibold text-on-night-muted">{saving.label}</span>
              <span
                id="cost-saving"
                data-roll=""
                className="relative inline-block font-display text-title tabular-nums"
                suppressHydrationWarning
              >
                <Amounts gbp={saving.totalGbp} />
              </span>{" "}
              <span className="text-body text-on-night-muted">{calculator.perYear}</span>
            </p>
            <TextLink href={cost.compare.href} className="self-start sm:self-auto">
              {cost.compare.label}
            </TextLink>
          </div>
          <p className="mt-6 text-micro text-on-night-subtle">{calculator.note}</p>
          <p id="cost-status" aria-live="polite" className="sr-only" suppressHydrationWarning />
          <script dangerouslySetInnerHTML={{ __html: calculatorScript }} />
        </div>
      </div>
    </section>
  );
}

function CostRow({
  id,
  label,
  amountGbp,
  share,
  highlight = false,
}: {
  id: string;
  label: string;
  /** The whole-pound total; the row shows it in every display currency. */
  amountGbp: number;
  /** Share of the separate tools' bill, for the bar. */
  share: number;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="flex items-baseline gap-4">
        <span id={`${id}-label`} className="mr-auto text-small font-semibold" suppressHydrationWarning>
          {label}
        </span>
        <span
          id={id}
          data-roll=""
          className="relative shrink-0 font-display text-heading tabular-nums"
          suppressHydrationWarning
        >
          <Amounts gbp={amountGbp} />
        </span>
        <span className="shrink-0 text-small text-on-night-muted"> {home.cost.calculator.perYear}</span>
      </p>
      {/* The track is the SVG's own background, which saves a rect on every row. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 2"
        preserveAspectRatio="none"
        className="mt-3 h-2 w-full rounded-full bg-night-line"
      >
        <rect
          id={`${id}-bar`}
          width={Math.round(share * 1000) / 10}
          height="2"
          rx="1"
          className={highlight ? "fill-accent" : "fill-on-night-muted"}
          suppressHydrationWarning
        />
      </svg>
    </div>
  );
}
