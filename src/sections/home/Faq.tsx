import { Plus } from "@phosphor-icons/react/ssr";
import { TextLink } from "@/components/ui/TextLink";
import { faq } from "@/content/faq";
import { home } from "@/content/home";
import { site } from "@/content/site";

/**
 * Native <details>/<summary>: keyboard support (Tab, Enter, Space) and the expanded state are built in,
 * and the answers are in the HTML for search engines. No JavaScript. Panels animate open where the
 * browser can animate to auto height (globals.css).
 */
export function Faq() {
  return (
    <section aria-labelledby="faq-title" className="py-section">
      <div className="container-page grid-page gap-y-8">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          <h2 id="faq-title" className="font-display text-title text-ink">
            {home.faq.title}
          </h2>
          <TextLink href={home.faq.more.href} className="mt-4">
            {home.faq.more.label}
          </TextLink>
          <p className="mt-6 max-w-72 text-small text-ink-muted">
            {home.faq.contact}{" "}
            <a
              href={`mailto:${site.company.supportEmail}`}
              className="font-semibold text-accent-ink underline underline-offset-4"
            >
              {site.company.supportEmail}
            </a>
          </p>
        </div>
        <div className="col-span-4 md:col-span-8 lg:col-span-8">
          {faq.map((item) => (
            <details
              key={item.id}
              id={`faq-${item.id}`}
              className="group mb-3 rounded-md border border-line bg-surface open:shadow-raised"
            >
              <summary className="flex min-h-16 items-center justify-between gap-6 rounded-md px-5 py-4 text-body font-semibold text-ink hover:text-accent-ink md:px-6">
                {item.question}
                <Plus
                  aria-hidden="true"
                  className="size-8 shrink-0 rounded-full bg-tint p-2 text-ink-muted transition-transform group-open:rotate-45"
                />
              </summary>
              <p className="max-w-text px-5 pb-5 text-body text-ink-muted md:px-6">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
