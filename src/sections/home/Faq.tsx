import { Plus } from "@phosphor-icons/react/ssr";
import { TextLink } from "@/components/ui/TextLink";
import { faq } from "@/content/faq";
import { home } from "@/content/home";
import { site } from "@/content/site";

/**
 * Native <details>/<summary>: keyboard support (Tab, Enter, Space) and the expanded state are built in,
 * and the answers are in the HTML for search engines. No JavaScript. Panels animate open where the
 * browser can animate to auto height (globals.css). `data-faq` names the question for `faq_open`.
 */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-section">
      <div className="container-page grid-page gap-y-8">
        <div className="col-span-4 md:col-span-8 lg:col-span-5">
          <h2 id="faq-title" className="font-display text-title">
            {home.faq.title}
          </h2>
          <TextLink href={home.faq.more.href} className="mt-4">
            {home.faq.more.label}
          </TextLink>
          <p className="mt-6 max-w-72 text-small text-on-night-muted">
            {home.faq.contact}{" "}
            <a
              href={`mailto:${site.company.supportEmail}`}
              className="font-semibold text-accent-on-night underline underline-offset-4"
            >
              {site.company.supportEmail}
            </a>
          </p>
        </div>
        <div className="col-span-4 border-t border-night-line md:col-span-8 lg:col-span-7 lg:col-start-6 xl:col-span-6 xl:col-start-7">
          {faq.map((item) => (
            <details
              key={item.id}
              id={`faq-${item.id}`}
              data-faq={item.id}
              className="group border-b border-night-line"
            >
              <summary className="flex min-h-16 items-center justify-between gap-6 py-4 text-body font-semibold text-on-night hover:text-accent-on-night">
                {item.question}
                <Plus
                  aria-hidden="true"
                  className="size-8 shrink-0 rounded-full bg-night-overlay p-2 text-on-night-muted transition-transform duration-base ease-out group-open:rotate-45"
                />
              </summary>
              <p className="max-w-text pb-6 text-body text-on-night-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
