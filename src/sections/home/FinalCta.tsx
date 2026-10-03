import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { home } from "@/content/home";

/**
 * The last step: the same stage light as the top of the page, from below this time, behind the one ask.
 * The body doesn't repeat the hero's "no credit card" line.
 */
export function FinalCta() {
  const { finalCta } = home;
  return (
    <section
      aria-labelledby="final-cta-title"
      className="bg-(image:--gradient-stage-light-low) bg-no-repeat pt-section pb-section-lg"
    >
      <div className="container-page text-center">
        <h2 id="final-cta-title" className="mx-auto max-w-180 font-display text-title">
          {finalCta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-lead text-lead text-on-night-muted">{finalCta.body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LiquidButton href={finalCta.primary.href} size="lg" data-cta="final">
            {finalCta.primary.label}
          </LiquidButton>
          <LiquidButton href={finalCta.secondary.href} tone="glass" size="lg" data-cta="final-demo">
            {finalCta.secondary.label}
          </LiquidButton>
        </div>
      </div>
    </section>
  );
}
