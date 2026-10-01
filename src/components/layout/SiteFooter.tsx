import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { SiteLink } from "@/components/ui/SiteLink";
import { socialIcons } from "@/components/ui/icons";
import { home } from "@/content/home";
import { footerNav, type NavGroup } from "@/content/navigation";
import { site } from "@/content/site";
import { analyticsEnabled } from "@/lib/analytics";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { company } = site;

  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page grid-page gap-y-10 py-16">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the only route in this app; see SiteLink */}
          <a href="/" className="inline-flex min-h-11 items-center rounded-sm text-ink">
            {/* A cached SVG file rather than inline paths: the header already inlines the logo once. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG needs no optimisation, and next/image would add client JS */}
            <img
              src="/brand/workchats-logo.svg"
              alt="Workchats"
              width={130}
              height={28}
              className="h-7 w-auto"
            />
          </a>
          <p className="mt-3 max-w-72 text-small text-ink-muted">{home.footer.tagline}</p>
          <ul className="mt-6 flex gap-2" aria-label="Workchats on social media">
            {site.social.map((profile) => {
              const Icon = socialIcons[profile.icon];
              return (
                <li key={profile.href}>
                  <a
                    href={profile.href}
                    rel="noopener"
                    aria-label={profile.label}
                    className="grid size-11 place-items-center rounded-full border border-line text-ink-muted hover:border-line-strong hover:text-ink"
                  >
                    <Icon aria-hidden="true" className="size-5" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {footerNav.map((group) => (
          <FooterGroup key={group.label} group={group} />
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-3 py-6 text-micro text-ink-muted md:flex-row md:items-center md:justify-between">
          <p className="max-w-180">
            © {year} {company.tradingName}. Workchats is built by {company.operator},{" "}
            {company.operatorLocation}. Support:{" "}
            <a
              href={`mailto:${company.supportEmail}`}
              className="underline underline-offset-2 hover:text-ink"
            >
              {company.supportEmail}
            </a>
          </p>
          {analyticsEnabled ? <CookieSettingsButton /> : null}
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ group }: { group: NavGroup }) {
  const headingId = `footer-${group.label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <nav aria-labelledby={headingId} className="col-span-2">
      <h2 id={headingId} className="text-small font-semibold text-ink">
        {group.label}
      </h2>
      <ul className="mt-2">
        {group.items.map((item) => (
          <li key={item.href}>
            <SiteLink
              href={item.href}
              className="inline-flex min-h-11 min-w-11 items-center text-small text-ink-muted hover:text-ink hover:underline"
            >
              {item.label}
            </SiteLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
