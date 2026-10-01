import { ButtonLink } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { home } from "@/content/home";
import { cx } from "@/lib/cx";

/*
 * The cost case as a calculator: pick a team size and see the five-tool bill next to Workchats.
 * Server-rendered for 50 people (the blog's example), so it reads completely without JavaScript; a
 * small inline script reveals the slider and recalculates. Above 50 people Pro no longer fits, so the
 * sum switches to Max. All prices come from content/home.ts and content/pricing.ts.
 */

const calculatorScript = `(function(){var r=document.getElementById("team-size");if(!r)return;var d=r.dataset,five=+d.five,pro=+d.pro,max=+d.max,limit=+d.limit,g=function(i){return document.getElementById(i)},out=g("team-size-value"),a=g("cost-five"),b=g("cost-workchats"),label=g("cost-workchats-label"),bar=g("cost-workchats-bar"),saving=g("cost-saving"),live=g("cost-status"),t;function gbp(n){return"£"+Math.round(n).toLocaleString("en-GB")}function fill(){r.style.setProperty("--fill",(r.value-r.min)/(r.max-r.min)*100+"%")}function update(){fill();var n=+r.value,small=n<=limit,per=small?pro:max,f=n*12*five,w=n*12*per;out.textContent=n+" people";r.setAttribute("aria-valuetext",n+" people");a.textContent=gbp(f);b.textContent=gbp(w);saving.textContent=gbp(f-w);label.textContent=small?d.proLabel:d.maxLabel;bar.setAttribute("width",String(Math.round(per/five*1000)/10));clearTimeout(t);t=setTimeout(function(){live.textContent=n+" people: "+gbp(f)+" a year for five tools, "+gbp(w)+" with "+label.textContent+". You save "+gbp(f-w)+" a year."},600)}fill();r.hidden=false;r.addEventListener("input",update)})()`;

export function Comparison() {
  const { comparison } = home;
  const { calculator } = comparison;
  const { fiveTools, workchats, saving } = calculator;
  return (
    <section aria-labelledby="comparison-title" className="bg-night py-section text-on-night">
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
            hidden
            suppressHydrationWarning
            className="range mt-3 h-11 w-full cursor-pointer"
          />

          <div className="mt-6 grid gap-6">
            <CostRow id="cost-five" label={fiveTools.label} total={fiveTools.total} share={1} />
            <CostRow
              id="cost-workchats"
              label={workchats.pro.label}
              total={workchats.total}
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
                {saving.total}
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
  total,
  share,
  highlight = false,
}: {
  id: string;
  label: string;
  total: string;
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
            {total}
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
