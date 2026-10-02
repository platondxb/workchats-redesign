import { ButtonLink } from "@/components/ui/Button";
import { CurrencySwitch } from "@/components/ui/CurrencySwitch";
import { TextLink } from "@/components/ui/TextLink";
import { home } from "@/content/home";
import { displayCurrencies, type CurrencyCode } from "@/content/pricing";
import { cx } from "@/lib/cx";
import { convertTotal, formatDisplayPrice } from "@/lib/pricing";

/*
 * The cost case as a calculator: pick a team size and a currency, and see the five-tool bill next to
 * Workchats. Server-rendered for 50 people (the blog's example), so it reads completely without
 * JavaScript; a small inline script reveals the slider, recalculates, and keeps the currency in step
 * with the pricing section. Above 50 people Pro no longer fits, so the sum switches to Max. All prices
 * come from content/home.ts and content/pricing.ts.
 */

/** Shows a total only for its currency; the pound is the default, so it hides when another is chosen. */
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

const calculatorScript = `(function(){var r=document.getElementById("team-size");if(!r)return;var d=r.dataset,five=+d.five,pro=+d.pro,max=+d.max,limit=+d.limit,rates=JSON.parse(d.rates),K="workchats-currency",g=function(i){return document.getElementById(i)},out=g("team-size-value"),fiveEl=g("cost-five"),workEl=g("cost-workchats"),label=g("cost-workchats-label"),bar=g("cost-workchats-bar"),savingEl=g("cost-saving"),live=g("cost-status"),t;function active(){var el=document.querySelector('input[name="cost-currency"]:checked');return el?el.value:"GBP"}function money(n,code){var c=rates[code||active()],v=Math.round(n*c.rate);return c.symbol+v.toLocaleString("en-GB")}function setAmount(host,n){if(!host)return;var spans=host.querySelectorAll("[data-currency]");for(var i=0;i<spans.length;i++){spans[i].textContent=money(n,spans[i].getAttribute("data-currency"))}}function mirror(code){["currency","cost-currency"].forEach(function(n){var el=g(n+"-"+code.toLowerCase());if(el)el.checked=true})}function fill(){r.style.setProperty("--fill",(r.value-r.min)/(r.max-r.min)*100+"%")}function update(){fill();var n=+r.value,small=n<=limit,per=small?pro:max,f=n*12*five,w=n*12*per;out.textContent=n+" people";r.setAttribute("aria-valuetext",n+" people");setAmount(fiveEl,f);setAmount(workEl,w);setAmount(savingEl,f-w);label.textContent=small?d.proLabel:d.maxLabel;bar.setAttribute("width",String(Math.round(per/five*1000)/10));clearTimeout(t);t=setTimeout(function(){live.textContent=n+" people: "+money(f)+" a year for five tools, "+money(w)+" with "+label.textContent+". You save "+money(f-w)+" a year."},600)}try{var stored=sessionStorage.getItem(K);if(stored)mirror(stored)}catch(e){}document.addEventListener("change",function(e){var t=e.target;if(!t||t.type!=="radio"||(t.name!=="currency"&&t.name!=="cost-currency"))return;try{sessionStorage.setItem(K,t.value)}catch(err){}mirror(t.value)});fill();r.hidden=false;r.addEventListener("input",update)})()`;

export function Comparison() {
  const { comparison } = home;
  const { calculator } = comparison;
  const { fiveTools, workchats, saving } = calculator;
  return (
    <section
      id="comparison"
      aria-labelledby="comparison-title"
      className="comparison bg-night py-section text-on-night"
    >
      <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-5">
          <h2 id="comparison-title" className="font-display text-title">
            {comparison.title}
          </h2>
          <p className="mt-4 text-lead text-on-night-muted">{comparison.intro}</p>
          <p className="mt-8 text-small font-semibold text-on-night-muted">{comparison.pricesLabel}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {comparison.stack.map((item) => (
              <li
                key={item.tool}
                className="inline-flex items-center gap-2 rounded-full border border-night-line px-3.5 py-1.5 text-small font-semibold"
              >
                {item.tool}
                <span className="font-regular text-on-night-muted tabular-nums">{item.price}</span>
              </li>
            ))}
          </ul>
          <TextLink href={comparison.source.href} inverse className="mt-6">
            {comparison.source.label}
          </TextLink>
        </div>

        <div className="rounded-lg bg-night-raised p-6 md:p-8 lg:col-span-7 lg:p-10">
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
            data-five={fiveTools.perUser}
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

          <CurrencySwitch
            name="cost-currency"
            legend={calculator.currencyLegend}
            tone="dark"
            className="mt-6 justify-between"
          />

          <div className="mt-5 grid gap-6">
            <CostRow id="cost-five" label={fiveTools.label} amountGbp={fiveTools.totalGbp} share={1} />
            <CostRow
              id="cost-workchats"
              label={workchats.pro.label}
              amountGbp={workchats.totalGbp}
              share={workchats.pro.perUser / fiveTools.perUser}
              highlight
            />
          </div>

          <div className="mt-8 flex flex-col gap-5 border-t border-night-line pt-6 sm:flex-row sm:items-end sm:justify-between">
            <p>
              <span className="block text-small font-semibold text-on-night-muted">{saving.label}</span>
              <span
                id="cost-saving"
                className="font-display text-title tabular-nums"
                suppressHydrationWarning
              >
                <Amounts gbp={saving.totalGbp} />
              </span>{" "}
              <span className="text-body text-on-night-muted">{saving.suffix}</span>
            </p>
            <ButtonLink
              href={calculator.cta.href}
              variant="inverse"
              arrow
              className="self-start sm:self-auto"
            >
              {calculator.cta.label}
            </ButtonLink>
          </div>
          <p className="mt-6 text-micro text-on-night-muted">{calculator.note}</p>
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
  /** Share of the five-tool bill, for the bar. */
  share: number;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="flex items-baseline justify-between gap-4">
        <span id={`${id}-label`} className="text-small font-semibold" suppressHydrationWarning>
          {label}
        </span>
        <span className="shrink-0 font-display text-heading tabular-nums">
          <span id={id} suppressHydrationWarning>
            <Amounts gbp={amountGbp} />
          </span>
          <span className="font-sans text-small font-regular text-on-night-muted"> a year</span>
        </span>
      </p>
      <svg aria-hidden="true" viewBox="0 0 100 2" preserveAspectRatio="none" className="mt-3 h-2 w-full">
        <rect width="100" height="2" rx="1" className="fill-night-line" />
        <rect
          id={`${id}-bar`}
          width={Math.round(share * 1000) / 10}
          height="2"
          rx="1"
          className={cx("grow-in", highlight ? "fill-accent" : "fill-on-night-muted")}
          suppressHydrationWarning
        />
      </svg>
    </div>
  );
}
