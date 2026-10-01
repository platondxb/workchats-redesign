import { ArrowRight } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { SiteLink } from "./SiteLink";

interface TextLinkProps {
  href: string;
  children: ReactNode;
  /** Light text for the dark section and the brand band. */
  inverse?: boolean;
  className?: string;
}

/** A standalone link with a 44px tap target and an arrow that nudges on hover, e.g. "Explore messaging". */
export function TextLink({ href, children, inverse = false, className }: TextLinkProps) {
  return (
    <SiteLink
      href={href}
      className={cx(
        "group inline-flex min-h-11 items-center gap-1.5 font-semibold underline decoration-1 underline-offset-4 hover:decoration-2",
        inverse ? "text-on-night" : "text-accent-ink",
        className,
      )}
    >
      {children}
      <ArrowRight
        aria-hidden="true"
        className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
      />
    </SiteLink>
  );
}
