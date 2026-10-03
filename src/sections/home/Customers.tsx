import { home } from "@/content/home";

/**
 * Real customers, named with the owner's permission (3 October 2026). Set as text in the site's own
 * typeface rather than as logos, and labelled with what is true ("Used by teams at"), not a trust claim.
 */
export function Customers() {
  const { customers } = home;
  return (
    <section aria-labelledby="customers-title" className="container-page pb-section">
      <p id="customers-title" className="text-center text-small text-on-night-subtle">
        {customers.label}
      </p>
      <ul className="mx-auto mt-5 flex max-w-text flex-wrap items-baseline justify-center gap-x-8 gap-y-3 font-display text-heading text-on-night-muted md:max-w-content md:gap-x-12">
        {customers.names.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </section>
  );
}
