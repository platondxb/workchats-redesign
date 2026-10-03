import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { SiteLink } from "@/components/ui/SiteLink";
import { socialIcons } from "@/components/ui/icons";
import { home } from "@/content/home";
import { footerNav, type NavGroup } from "@/content/navigation";
import { site } from "@/content/site";
import { analyticsEnabled } from "@/lib/analytics";
import { Logo } from "./Logo";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { company } = site;

  return (
    <footer className="border-t border-night-line">
      <div className="container-page grid-page gap-y-10 py-16">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the only route in this app; see SiteLink */}
          <a href="/" className="inline-flex min-h-11 items-center rounded-sm text-on-night">
            <Logo className="h-7 w-auto" />
          </a>
          <p className="mt-3 max-w-72 text-small text-on-night-muted">{home.footer.tagline}</p>
          <ul className="mt-6 flex gap-2" aria-label="Workchats on social media">
            {site.social.map((profile) => {
              const Icon = socialIcons[profile.icon];
              return (
                <li key={profile.href}>
                  <a
                    href={profile.href}
                    rel="noopener"
                    aria-label={profile.label}
                    className="grid size-11 place-items-center rounded-full border border-night-line text-on-night-muted hover:border-night-line-strong hover:text-on-night"
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

      <div className="border-t border-night-line">
        <div className="container-page flex flex-col gap-3 py-6 text-micro text-on-night-subtle md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {company.legalName}. Support:{" "}
            <a
              href={`mailto:${company.supportEmail}`}
              className="underline underline-offset-2 hover:text-on-night"
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
      <h2 id={headingId} className="text-small font-semibold text-on-night">
        {group.label}
      </h2>
      <ul className="mt-2">
        {group.items.map((item) => (
          <li key={item.href}>
            <SiteLink
              href={item.href}
              className="inline-flex min-h-11 min-w-11 items-center text-small text-on-night-muted hover:text-on-night hover:underline"
            >
              {item.label}
            </SiteLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
