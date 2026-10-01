import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { TextLink } from "./TextLink";

interface SectionHeaderProps {
  id: string;
  title: string;
  intro?: ReactNode;
  action?: { label: string; href: string };
  /** Light text for the dark section. */
  inverse?: boolean;
  className?: string;
}

/** Section title, optional intro and an optional link on the right. No eyebrow labels. */
export function SectionHeader({ id, title, intro, action, inverse = false, className }: SectionHeaderProps) {
  const heading = (
    <div className={cx("max-w-180", !action && className)}>
      <h2 id={id} className="font-display text-title">
        {title}
      </h2>
      {intro ? (
        <p className={cx("mt-4 max-w-text text-lead", inverse ? "text-on-night-muted" : "text-ink-muted")}>
          {intro}
        </p>
      ) : null}
    </div>
  );
  if (!action) return heading;
  return (
    <div
      className={cx("flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10", className)}
    >
      {heading}
      <TextLink href={action.href} inverse={inverse} className="shrink-0">
        {action.label}
      </TextLink>
    </div>
  );
}
