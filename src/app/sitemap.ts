import type { MetadataRoute } from "next";
import { comingSoon, footerNav, primaryNav, isNavGroup } from "@/content/navigation";
import { site } from "@/content/site";

/**
 * The home page, plus (while the rest of the site is served from the current platform through the
 * fallback rewrite) every existing marketing page linked from the navigation.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const paths = new Set<string>(["/"]);

  if (process.env.LEGACY_SITE_ORIGIN?.trim()) {
    const links = [
      ...primaryNav.flatMap((entry) => (isNavGroup(entry) ? entry.items : [entry])),
      ...footerNav.flatMap((group) => group.items),
      ...comingSoon.items,
    ];
    for (const link of links) {
      if (link.href.startsWith("/")) paths.add(link.href);
    }
  }

  return [...paths].map((path) => ({
    url: path === "/" ? `${site.url}/` : `${site.url}${path}`,
    lastModified,
    priority: path === "/" ? 1 : 0.7,
  }));
}
