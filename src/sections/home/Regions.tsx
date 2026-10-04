import { ShieldCheck } from "@phosphor-icons/react/ssr";
import { RegionGlobe } from "@/components/globe/RegionGlobe";
import { TextLink } from "@/components/ui/TextLink";
import { home } from "@/content/home";
import { hostingRegions, type RegionId } from "@/content/site";
import { cx } from "@/lib/cx";

const flagClasses = {
  gb: "flag-gb",
  eu: "flag-eu",
  ae: "flag-ae",
} satisfies Record<RegionId, string>;

/*
 * Where a workspace's data lives: the UK, the EU or the UAE, on a planet the visitor can turn, with the
 * regions marked and joined by arcs. The list beside it is the same choice in words, with the law that
 * applies in each region; choosing one turns the globe to it and lights its arcs (RegionGlobe.tsx), and it
 * is how a keyboard or screen-reader user takes the same tour.
 *
 * The heading and the intro carry the security facts too (encryption and the uptime SLA), so the business
 * case still starts inside the first two screens on a desktop, as it did before this section was a globe.
 *
 * Phones read it top to bottom (claim, globe, list); on a desktop the globe stands to the right of the
 * text and the list, centred on them.
 */
export function Regions() {
  const { regions } = home;
  return (
    // The top padding is deliberately tight: the heading has to land inside the first two screens on a
    // desktop, below ~1800px of hero and customers.
    <section
      id="regions"
      aria-labelledby="regions-title"
      className="overflow-x-clip pt-8 pb-section lg:pt-12"
    >
      <div className="container-page grid-page items-center gap-y-8 lg:gap-y-6">
        <div className="col-span-4 md:col-span-8 lg:col-span-5 lg:row-start-1 lg:self-end">
          <h2 id="regions-title" className="font-display text-title">
            {regions.title}
          </h2>
          <p className="mt-4 max-w-text text-lead text-on-night-muted">{regions.intro}</p>
        </div>

        <div className="col-span-4 md:col-span-6 md:col-start-2 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
          <RegionGlobe regions={hostingRegions} label={regions.globeLabel} hint={regions.dragHint} />
        </div>

        <div className="col-span-4 md:col-span-8 lg:col-span-5 lg:row-start-2 lg:self-start">
          <fieldset>
            <legend className="text-small font-semibold text-on-night-subtle">{regions.legend}</legend>
            <div className="mt-3 grid gap-2">
              {hostingRegions.map((region) => (
                <label
                  key={region.id}
                  className="group/region flex cursor-pointer items-center gap-4 rounded-md border border-night-line bg-night-raised/60 p-4 transition-colors duration-fast ease-out hover:border-night-line-strong has-checked:border-accent-on-night has-checked:bg-night-overlay has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent-on-night"
                >
                  <input
                    type="radio"
                    name="region"
                    id={`region-${region.id}`}
                    value={region.id}
                    className="sr-only"
                  />
                  <span aria-hidden="true" className={cx("flex flag", flagClasses[region.id])} />
                  <span className="grid min-w-0 flex-1 gap-0.5 text-body font-semibold text-on-night">
                    {region.name}
                    <span className="text-small font-regular text-on-night-muted">{region.law}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-night-line-strong transition-colors duration-fast ease-out group-has-checked/region:border-accent-on-night after:size-2 after:scale-0 after:rounded-full after:bg-accent-on-night after:transition-transform after:duration-fast after:ease-out group-has-checked/region:after:scale-100"
                  />
                </label>
              ))}
            </div>
          </fieldset>
          <p className="mt-6 flex gap-3 text-small text-on-night-muted">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-accent-on-night" />
            {regions.compliance}
          </p>
          <TextLink href={regions.walkthrough.href} data-cta="regions" className="mt-3">
            {regions.walkthrough.label}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
