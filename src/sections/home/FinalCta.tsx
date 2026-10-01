import { MARK_PATH } from "@/components/layout/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { home } from "@/content/home";

/** The last step, on the brand blue. The note doesn't repeat the hero's "no credit card" line. */
export function FinalCta() {
  const { finalCta } = home;
  return (
    <section aria-labelledby="final-cta-title" className="container-page pb-section">
      <div className="relative isolate overflow-hidden rounded-lg bg-accent px-6 py-14 text-on-accent md:px-12 md:py-20 lg:px-20">
        <svg
          aria-hidden="true"
          viewBox="0 0 126 126"
          className="pointer-events-none absolute -top-24 -right-20 -z-10 w-120 fill-brand md:-right-10"
        >
          <path d={MARK_PATH} />
        </svg>
        <h2 id="final-cta-title" className="max-w-180 font-display text-title">
          {finalCta.title}
        </h2>
        <p className="mt-4 max-w-text text-lead">{finalCta.body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={finalCta.primary.href} variant="inverse" arrow>
            {finalCta.primary.label}
          </ButtonLink>
          <ButtonLink href={finalCta.secondary.href} variant="inverse-outline">
            {finalCta.secondary.label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
