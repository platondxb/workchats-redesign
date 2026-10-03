import { Copy } from "@phosphor-icons/react/ssr";
import { liquidClasses } from "@/components/ui/liquid-glass-button";
import { TextLink } from "@/components/ui/TextLink";
import { home } from "@/content/home";
import { hostingRegions, site } from "@/content/site";
import { cx } from "@/lib/cx";

const flagClasses = {
  gb: "flag-gb",
  eu: "flag-eu",
  ae: "flag-ae",
} satisfies Record<(typeof hostingRegions)[number]["id"], string>;

/*
 * The business case for whoever signs off: cost, what it replaces, reliability, security, residency and
 * compliance, as a one-page brief they can forward. The brief is a light sheet on the dark page, like the
 * app's own screens: light is kept for real artefacts. "Copy link" copies this section's address; it
 * needs the Clipboard API, so it stays hidden until the inline script has checked for it.
 */
const copyScript = `(function(){var b=document.getElementById("copy-brief"),s=document.getElementById("copy-brief-status");if(!b||!s||!navigator.clipboard)return;b.hidden=false;var t;b.addEventListener("click",function(){var u=location.origin+location.pathname+"#business-case";navigator.clipboard.writeText(u).then(function(){s.textContent="${home.businessCase.copyLink.done}: "+u;b.setAttribute("data-copied","");clearTimeout(t);t=setTimeout(function(){b.removeAttribute("data-copied")},2400)},function(){s.textContent="Couldn't copy the link. It is "+u})})})()`;

export function BusinessCase() {
  const { businessCase } = home;
  return (
    <section id="business-case" aria-labelledby="business-case-title" className="py-section">
      <div className="container-page grid-page items-start gap-y-10">
        <div className="col-span-4 md:col-span-8 lg:sticky lg:top-28 lg:col-span-5">
          <h2 id="business-case-title" className="font-display text-title">
            {businessCase.title}
          </h2>
          <p className="mt-4 max-w-text text-lead text-on-night-muted">{businessCase.intro}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              id="copy-brief"
              type="button"
              hidden
              suppressHydrationWarning
              data-cta="business-case-copy"
              className={liquidClasses("glass", "sm", "data-copied:text-accent-on-night")}
            >
              <Copy aria-hidden="true" className="size-4.5" />
              <span className="group-data-copied/button:hidden">{businessCase.copyLink.label}</span>
              <span className="hidden group-data-copied/button:inline">{businessCase.copyLink.done}</span>
            </button>
            <TextLink href={businessCase.walkthrough.href} data-cta="business-case">
              {businessCase.walkthrough.label}
            </TextLink>
          </div>
          <p id="copy-brief-status" role="status" className="sr-only" suppressHydrationWarning />
          <script dangerouslySetInnerHTML={{ __html: copyScript }} />
        </div>

        <article
          aria-labelledby="brief-title"
          className="col-span-4 rounded-md bg-surface p-6 text-ink shadow-overlay md:col-span-8 md:p-8 lg:col-span-7"
        >
          <header className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
            <h3 id="brief-title" className="text-heading">
              {businessCase.sheetTitle}
            </h3>
            <p className="text-micro text-ink-subtle">{site.url.replace(/^https?:\/\/(www\.)?/, "")}</p>
          </header>
          <dl>
            {businessCase.rows.map((row) => (
              <div
                key={row.id}
                className="grid gap-1 border-b border-line py-4 last:border-b-0 last:pb-0 sm:grid-cols-3 sm:gap-6"
              >
                <dt className="text-small font-semibold">{row.term}</dt>
                <dd className="text-small text-ink-muted sm:col-span-2">
                  {row.detail}
                  {row.id === "residency" ? (
                    <span className="mt-3 flex flex-wrap gap-2">
                      {hostingRegions.map((region) => (
                        <span
                          key={region.id}
                          className={cx(
                            "inline-flex flag items-center gap-2 rounded-full border border-line px-3 py-1 text-micro font-semibold text-ink",
                            flagClasses[region.id],
                          )}
                        >
                          {region.name}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      </div>
    </section>
  );
}
