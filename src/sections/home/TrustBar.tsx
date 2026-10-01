import { TextLink } from "@/components/ui/TextLink";
import { platformIcons, trustIcons } from "@/components/ui/icons";
import { home } from "@/content/home";
import { platforms } from "@/content/site";

/** Where Workchats runs, with each platform's real status, and the four facts teams ask about first. */
export function TrustBar() {
  const { trust } = home;
  return (
    <section aria-label={trust.label} className="container-page">
      <div className="grid grid-cols-1 gap-8 border-y border-line py-8 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-7">
          <p className="flex flex-wrap items-center justify-between gap-x-4 text-small font-semibold text-ink-muted">
            {trust.platformsTitle}
            <TextLink href={trust.download.href} className="text-small">
              {trust.download.label}
            </TextLink>
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {platforms.map((platform) => {
              const Icon = platformIcons[platform.id];
              return (
                <li
                  key={platform.id}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-surface pr-3.5 pl-3 text-small font-semibold"
                >
                  <Icon aria-hidden="true" className="size-4.5 text-ink-muted" />
                  {platform.label}
                  {"status" in platform ? (
                    <span className="rounded-full bg-warning-subtle px-2 text-nano text-warning">
                      {platform.status}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
        <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:col-span-5">
          {trust.facts.map((fact) => {
            const Icon = trustIcons[fact.id];
            return (
              <li key={fact.id} className="flex items-center gap-3 text-small font-semibold text-ink">
                <Icon
                  aria-hidden="true"
                  className="size-9 shrink-0 rounded-full bg-accent-subtle p-2 text-accent-ink"
                />
                {fact.text}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
