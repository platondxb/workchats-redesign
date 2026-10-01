import {
  ChatCircle,
  ClipboardText,
  DownloadSimple,
  File,
  LockKey,
  LockSimple,
  Phone,
  ShieldCheck,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { toneClasses } from "@/components/product/ProductFrame";
import { ButtonLink } from "@/components/ui/Button";
import { privacySettings } from "@/content/demo";
import { home } from "@/content/home";
import { cx } from "@/lib/cx";

/*
 * Where the data lives (the regions, with flags, next to the heading), then three promises in the
 * original site's form: a small piece of product interface, a short title and one line. Plan-level
 * extras (SSO, DLP, SLAs) are in the pricing cards; the detail is on /faq.
 * The interface pictures are decorative (aria-hidden): the titles and lines carry the facts.
 */

const flagClasses = {
  gb: "flag-gb",
  eu: "flag-eu",
  ae: "flag-ae",
} satisfies Record<(typeof home.security.regions)[number]["id"], string>;

export function Security() {
  const { security } = home;
  const { cards, review } = security;
  return (
    <section aria-labelledby="security-title" className="py-section">
      <div className="container-page">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between xl:gap-12">
          <h2 id="security-title" className="max-w-180 font-display text-title text-ink">
            {security.title}
          </h2>
          <div className="shrink-0">
            <p className="text-small font-semibold text-ink-muted">{security.regionsLabel}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {security.regions.map((region) => (
                <li
                  key={region.id}
                  className={cx(
                    "inline-flex flag min-h-11 items-center gap-2.5 rounded-full border border-line bg-surface pr-4 pl-3 text-small font-semibold text-ink",
                    flagClasses[region.id],
                  )}
                >
                  {region.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
          <Card title={cards.encryption.title} body={cards.encryption.body}>
            <EncryptionWidget />
          </Card>
          <Card title={cards.privacy.title} body={cards.privacy.body}>
            <PrivacyWidget />
          </Card>
          <Card title={cards.compliance.title} body={cards.compliance.body}>
            <ComplianceWidget />
          </Card>
        </ul>

        <div className="mt-4 flex flex-col gap-5 rounded-lg bg-accent-subtle p-6 md:flex-row md:items-center md:justify-between md:px-8 lg:mt-5">
          <p className="text-body text-ink-muted">
            <strong className="font-semibold text-ink">{review.title}</strong> {review.body}
          </p>
          <ButtonLink href={review.cta.href} arrow className="shrink-0 self-start md:self-auto">
            {review.cta.label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/**
 * Picture on top, then the promise. On tablets the picture sits beside the text. On desktop each card
 * spans three rows of the list's grid (subgrid), so the tallest picture sets the row height for all
 * three and the titles and lines start at the same height.
 */
function Card({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <li className="grid rise-in grid-cols-1 rounded-lg bg-tint p-6 md:grid-cols-2 md:gap-x-10 md:p-8 lg:row-span-3 lg:grid-cols-1 lg:grid-rows-subgrid lg:gap-y-0 lg:p-5 xl:p-7">
      <div
        aria-hidden="true"
        className="mb-8 grid place-items-center select-none md:row-span-2 md:mb-0 lg:row-span-1 lg:mb-8"
      >
        {children}
      </div>
      <h3 className="text-heading text-ink md:self-end lg:self-auto">{title}</h3>
      <p className="mt-2 text-body text-ink-muted md:self-start lg:self-auto">{body}</p>
    </li>
  );
}

const panelClasses = {
  base: "w-full max-w-80 rounded-md border border-line bg-surface p-5 text-ink shadow-raised lg:p-4 xl:p-5",
  label: "text-nano font-semibold tracking-label text-ink-subtle uppercase",
} as const;

const encryptionIcons: readonly Icon[] = [ChatCircle, Phone, File];

/** The encryption setting as an admin sees it: switched on, covering messages, calls and files. */
function EncryptionWidget() {
  const { covers, specs } = home.security.encryption;
  return (
    <div className={panelClasses.base}>
      <p className="flex items-center gap-3">
        <LockKey className="size-10 shrink-0 rounded-sm bg-avatar-green p-2.5 text-avatar-green-ink" />
        <span className="flex-1 text-small font-semibold">Encryption</span>
        {/* A switch, on. The knob is a pseudo-element. */}
        <span className="relative h-6 w-10 shrink-0 rounded-full bg-success after:absolute after:top-0.5 after:right-0.5 after:size-5 after:rounded-full after:bg-surface" />
      </p>
      <ul className="mt-5 grid grid-cols-3 gap-2 text-center text-micro font-semibold">
        {covers.map((label, index) => {
          const ItemIcon = encryptionIcons[index] ?? File;
          return (
            <li key={label} className="grid justify-items-center gap-1.5 rounded-sm bg-tint py-3">
              <ItemIcon className="size-5 text-accent-ink" />
              {label}
            </li>
          );
        })}
      </ul>
      <p className={cx(panelClasses.label, "mt-4 flex flex-wrap justify-between gap-x-3 gap-y-1")}>
        {specs.map((spec) => (
          <span key={spec} className="whitespace-nowrap">
            {spec}
          </span>
        ))}
      </p>
    </div>
  );
}

/** One person's privacy settings: one open to show its three levels, two more summarised. */
function PrivacyWidget() {
  const { levels, open, others } = privacySettings;
  return (
    <div className={panelClasses.base}>
      <p className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-small font-semibold">
          <LockSimple className="size-5 text-accent-ink" />
          Privacy
        </span>
        <span className={cx(panelClasses.label, "whitespace-nowrap")}>{levels.length} levels</span>
      </p>
      <p className="mt-5 text-micro font-semibold text-ink-muted">{open.label}</p>
      <p className="mt-2 grid grid-cols-3 rounded-full bg-tint p-1 text-center text-micro font-semibold">
        {levels.map((level) => (
          <span
            key={level}
            className={cx(
              "rounded-full py-1.5",
              level === open.value ? "bg-surface text-accent-ink shadow-raised" : "text-ink-muted",
            )}
          >
            {level}
          </span>
        ))}
      </p>
      <ul className="mt-5 grid gap-2.5 border-t border-line pt-4 text-small">
        {others.map((setting) => (
          <li key={setting.label} className="flex items-center justify-between gap-4">
            {setting.label}
            <span
              className={cx("rounded-full px-2.5 py-0.5 text-micro font-semibold", toneClasses[setting.tone])}
            >
              {setting.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const complianceIcons = {
  gdpr: { icon: ShieldCheck, tone: "green" },
  export: { icon: DownloadSimple, tone: "amber" },
  audit: { icon: ClipboardText, tone: "violet" },
} as const satisfies Record<
  (typeof home.security.compliance)[number]["id"],
  { icon: Icon; tone: keyof typeof toneClasses }
>;

/** What compliance comes with, and from which plan. */
function ComplianceWidget() {
  return (
    <ul className={cx(panelClasses.base, "grid gap-1 p-2")}>
      {home.security.compliance.map((item) => {
        const { icon: ItemIcon, tone } = complianceIcons[item.id];
        return (
          <li key={item.id} className="flex items-center gap-3 rounded-sm p-2.5">
            <ItemIcon className={cx("size-10 shrink-0 rounded-sm p-2.5", toneClasses[tone])} />
            <span className="text-small font-semibold">
              {item.label}
              <span className={cx(panelClasses.label, "block")}>{item.plan}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
