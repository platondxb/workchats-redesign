import type { ComponentPropsWithoutRef } from "react";

type SiteLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & { href: string };

/**
 * Every link on the site goes through here. While the home page is the only route this app serves,
 * links are plain anchors: every destination is a full page load anyway (the rest of the site, the app,
 * sign-up), and leaving next/link out keeps its client code off the page.
 * When a second route moves into this app, render next/link here for the routes it serves.
 */
export function SiteLink({ href, children, ...rest }: SiteLinkProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
