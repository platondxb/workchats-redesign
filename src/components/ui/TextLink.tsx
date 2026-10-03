import { ArrowRight } from "@phosphor-icons/react/ssr";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { SiteLink } from "./SiteLink";

type TextLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children"> & {
  href: string;
  children: ReactNode;
  className?: string;
};

/** A standalone link with a 44px tap target and an arrow that nudges on hover, e.g. "Compare plans". */
export function TextLink({ href, children, className, ...rest }: TextLinkProps) {
  return (
    <SiteLink
      href={href}
      {...rest}
      className={cx(
        "group inline-flex min-h-11 items-center gap-1.5 font-semibold text-accent-on-night underline decoration-1 underline-offset-4 hover:decoration-2",
        className,
      )}
    >
      {children}
      <ArrowRight
        aria-hidden="true"
        className="size-4 shrink-0 transition-transform duration-fast ease-out group-hover:translate-x-0.5"
      />
    </SiteLink>
  );
}
