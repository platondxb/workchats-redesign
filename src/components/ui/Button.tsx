import { ArrowRight } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./button-classes";
import { SiteLink } from "./SiteLink";

export { buttonClasses, type ButtonSize, type ButtonVariant };

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** A trailing arrow that nudges on hover, for the main action in a group. */
  arrow?: boolean;
  className?: string;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  className,
}: ButtonLinkProps) {
  return (
    <SiteLink href={href} className={buttonClasses(variant, size, className)}>
      {children}
      {arrow ? (
        <ArrowRight
          aria-hidden="true"
          className="-mr-1 size-4 shrink-0 transition-transform group-hover/button:translate-x-0.5"
        />
      ) : null}
    </SiteLink>
  );
}
