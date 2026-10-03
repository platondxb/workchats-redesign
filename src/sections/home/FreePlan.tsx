import { Check, Plus } from "@phosphor-icons/react/ssr";
import { Avatar } from "@/components/product/ProductFrame";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { TextLink } from "@/components/ui/TextLink";
import { freeTeam, workspaces } from "@/content/demo";
import { home } from "@/content/home";

/*
 * The free plan, made concrete: what a team of five gets, that it never ends, and what happens when the
 * sixth person joins. The invite is drawn as the product would show it; its words are real text, because
 * the upgrade path is information, and only the avatars and the button are pictures.
 */
export function FreePlan() {
  const { freePlan } = home;
  const [workspace] = workspaces;
  return (
    <section id="free" aria-labelledby="free-title" className="py-section">
      <div className="container-page grid-page items-center gap-y-12">
        <div className="col-span-4 md:col-span-8 lg:col-span-6">
          <h2 id="free-title" className="font-display text-title">
            {freePlan.title}
          </h2>
          <p className="mt-4 max-w-text text-lead text-on-night-muted">{freePlan.intro}</p>
          <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {freePlan.includes.map((item) => (
              <li key={item} className="flex gap-3 text-small text-on-night">
                <Check aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-accent-on-night" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <LiquidButton href={freePlan.primary.href} data-cta="free-plan">
              {freePlan.primary.label}
            </LiquidButton>
            <TextLink href={freePlan.compare.href}>{freePlan.compare.label}</TextLink>
          </div>
        </div>

        <figure className="col-span-4 md:col-span-6 md:col-start-2 lg:col-span-5 lg:col-start-8">
          <div className="rounded-md bg-surface p-5 text-ink shadow-overlay sm:p-6 md:p-7">
            <figcaption className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-sm bg-accent text-micro font-bold text-on-accent"
              >
                {workspace.initials}
              </span>
              <span className="text-heading">{freePlan.sixth.title}</span>
            </figcaption>
            <ul aria-hidden="true" className="mt-6 flex items-center gap-1 sm:gap-2">
              {freeTeam.map((person) => (
                <li key={person}>
                  <Avatar person={person} size="lg" className="max-sm:size-9 max-sm:text-micro" />
                </li>
              ))}
              <li className="grid size-9 place-items-center rounded-full border-2 border-dashed border-accent text-accent-ink sm:size-12">
                <Plus className="size-5" />
              </li>
            </ul>
            <p className="mt-6 text-body font-semibold">{freePlan.sixth.note}</p>
            <p className="mt-1 text-small text-ink-muted">{freePlan.sixth.price}</p>
            <p className="text-small text-ink-muted">{freePlan.sixth.carryOver}</p>
            <p aria-hidden="true" className="mt-6 flex justify-end gap-2 text-micro font-semibold">
              <span className="rounded-full bg-tint px-4 py-2">Cancel</span>
              <span className="rounded-full bg-accent px-4 py-2 text-on-accent">{freePlan.sixth.action}</span>
            </p>
          </div>
        </figure>
      </div>
    </section>
  );
}
