import { HeroStage } from "@/components/product/HeroStage";
import { ButtonLink } from "@/components/ui/Button";
import { home } from "@/content/home";

/** One static headline, one supporting paragraph, two actions, one line of microcopy, then the product. */
export function Hero() {
  const { hero } = home;
  return (
    <section aria-labelledby="hero-title" className="pt-8 pb-12 md:pt-14 md:pb-16 lg:pt-20">
      <div className="container-page">
        <div className="grid-page items-end gap-y-6">
          <h1
            id="hero-title"
            className="col-span-4 font-display text-display text-ink md:col-span-8 lg:col-span-7"
          >
            {hero.title}
          </h1>
          <div className="col-span-4 md:col-span-6 lg:col-span-5 lg:pb-2">
            <p className="text-lead text-ink-muted">{hero.lead}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ButtonLink href={hero.primary.href} arrow>
                {hero.primary.label}
              </ButtonLink>
              <ButtonLink href={hero.secondary.href} variant="secondary">
                {hero.secondary.label}
              </ButtonLink>
            </div>
            <p className="mt-3 text-small text-ink-subtle">{hero.note}</p>
          </div>
        </div>
        <HeroStage label={hero.productLabel} />
      </div>
    </section>
  );
}
